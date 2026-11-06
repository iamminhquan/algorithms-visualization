"use server";

import { and, count, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect, unstable_rethrow } from "next/navigation";
import * as XLSX from "xlsx";
import { db } from "@/db";
import type { IClassImportError } from "@/db/schema";
import {
  classesTable,
  classImportJobsTable,
  classMembersTable,
  examsTable,
  usersTable,
} from "@/db/schema";
import { actionError, getUnknownErrorMessage } from "./action-helpers";
import { canManageClass, requireStaffUser, requireStudentUser } from "./auth";
import {
  getAdminClassHref,
  getStudentClassHref,
  STUDENT_CLASSES_PATH,
} from "./routes";
import type { IImportActionState, ILearningActionState } from "./types";
import {
  generateClassCode,
  getFormFile,
  getFormInt,
  getFormText,
  isUniqueViolation,
  normalizeClassCode,
} from "./validation";

const MAX_IMPORT_FILE_SIZE = 5 * 1024 * 1024;

function normalizeHeader(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}

function readRecordValue(
  record: Readonly<Record<string, unknown>>,
  keys: readonly string[],
): string {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "string" || typeof value === "number") {
      const text = String(value).trim();
      if (text !== "") {
        return text;
      }
    }
  }
  return "";
}

function validateClassSizes(
  minSize: number | undefined,
  maxSize: number | undefined,
): string | null {
  if (minSize === undefined || maxSize === undefined) {
    return "Vui lòng nhập sĩ số tối thiểu và tối đa.";
  }
  if (minSize < 0) {
    return "Sĩ số tối thiểu không được âm.";
  }
  if (maxSize <= 0) {
    return "Sĩ số tối đa phải lớn hơn 0.";
  }
  if (minSize > maxSize) {
    return "Sĩ số tối thiểu không được lớn hơn sĩ số tối đa.";
  }
  return null;
}

async function resolveOwnerId(
  requestedOwnerId: string,
  actorId: string,
  isAdmin: boolean,
): Promise<string | null> {
  const ownerId =
    isAdmin && requestedOwnerId !== "" ? requestedOwnerId : actorId;
  const owner = await db.query.usersTable.findFirst({
    where: eq(usersTable.id, ownerId),
    columns: { id: true, role: true },
  });
  if (!owner || (owner.role !== "admin" && owner.role !== "teacher")) {
    return null;
  }
  return owner.id;
}

export async function createClassAction(
  _previousState: ILearningActionState,
  formData: FormData,
): Promise<ILearningActionState> {
  const user = await requireStaffUser();
  const name = getFormText(formData, "name");
  const minSize = getFormInt(formData, "minSize");
  const maxSize = getFormInt(formData, "maxSize");
  const ownerId = await resolveOwnerId(
    getFormText(formData, "ownerId"),
    user.id,
    user.role === "admin",
  );

  if (name === "") {
    return actionError("Tên lớp không được để trống.");
  }
  const sizeError = validateClassSizes(minSize, maxSize);
  if (sizeError) {
    return actionError(sizeError);
  }
  if (!ownerId) {
    return actionError("Giảng viên phụ trách không hợp lệ.");
  }

  try {
    let code = generateClassCode();
    for (let attempt = 0; attempt < 5; attempt += 1) {
      const existing = await db.query.classesTable.findFirst({
        where: eq(classesTable.code, code),
        columns: { id: true },
      });
      if (!existing) {
        break;
      }
      code = generateClassCode();
    }

    const [created] = await db
      .insert(classesTable)
      .values({
        name,
        code,
        minSize: minSize ?? 0,
        maxSize: maxSize ?? 1,
        ownerId,
        status: "active",
      })
      .returning({ id: classesTable.id });

    revalidatePath("/admin/classes");
    redirect(getAdminClassHref(created.id));
  } catch (error) {
    unstable_rethrow(error);
    if (isUniqueViolation(error)) {
      return actionError("Mã lớp bị trùng, vui lòng thử lại.");
    }
    return actionError(getUnknownErrorMessage(error));
  }
}

export async function updateClassAction(
  _previousState: ILearningActionState,
  formData: FormData,
): Promise<ILearningActionState> {
  const user = await requireStaffUser();
  const classId = getFormInt(formData, "classId");
  const name = getFormText(formData, "name");
  const minSize = getFormInt(formData, "minSize");
  const maxSize = getFormInt(formData, "maxSize");
  if (classId === undefined) {
    return actionError("Lớp học không hợp lệ.");
  }

  const classRow = await db.query.classesTable.findFirst({
    where: eq(classesTable.id, classId),
  });
  if (!classRow) {
    return actionError("Không tìm thấy lớp học.");
  }
  if (!canManageClass(user, classRow.ownerId)) {
    return actionError("Bạn không có quyền sửa lớp này.");
  }

  if (name === "") {
    return actionError("Tên lớp không được để trống.");
  }
  const sizeError = validateClassSizes(minSize, maxSize);
  if (sizeError) {
    return actionError(sizeError);
  }

  const [memberCount] = await db
    .select({ value: count() })
    .from(classMembersTable)
    .where(eq(classMembersTable.classId, classId));
  if ((maxSize ?? 0) < memberCount.value) {
    return actionError(
      `Sĩ số tối đa không được nhỏ hơn số sinh viên hiện tại (${memberCount.value}).`,
    );
  }

  const ownerId = await resolveOwnerId(
    getFormText(formData, "ownerId"),
    classRow.ownerId,
    user.role === "admin",
  );
  if (!ownerId) {
    return actionError("Giảng viên phụ trách không hợp lệ.");
  }

  try {
    await db
      .update(classesTable)
      .set({
        name,
        minSize: minSize ?? 0,
        maxSize: maxSize ?? 1,
        ownerId,
      })
      .where(eq(classesTable.id, classId));

    revalidatePath("/admin/classes");
    revalidatePath(getAdminClassHref(classId));
    redirect(getAdminClassHref(classId));
  } catch (error) {
    unstable_rethrow(error);
    return actionError(getUnknownErrorMessage(error));
  }
}

export async function setClassStatusAction(
  _previousState: ILearningActionState,
  formData: FormData,
): Promise<ILearningActionState> {
  const user = await requireStaffUser();
  const classId = getFormInt(formData, "classId");
  const status = getFormText(formData, "status");
  if (classId === undefined || (status !== "active" && status !== "archived")) {
    return actionError("Lớp học không hợp lệ.");
  }

  const classRow = await db.query.classesTable.findFirst({
    where: eq(classesTable.id, classId),
    columns: { id: true, ownerId: true },
  });
  if (!classRow || !canManageClass(user, classRow.ownerId)) {
    return actionError("Bạn không có quyền đổi trạng thái lớp này.");
  }

  await db
    .update(classesTable)
    .set({ status })
    .where(eq(classesTable.id, classId));

  revalidatePath("/admin/classes");
  revalidatePath(getAdminClassHref(classId));
  revalidatePath(STUDENT_CLASSES_PATH);
  return {
    success: status === "archived" ? "Đã lưu trữ lớp." : "Đã mở lại lớp.",
  };
}

export async function deleteClassAction(
  _previousState: ILearningActionState,
  formData: FormData,
): Promise<ILearningActionState> {
  const user = await requireStaffUser();
  const classId = getFormInt(formData, "classId");
  if (classId === undefined) {
    return actionError("Lớp học không hợp lệ.");
  }

  const classRow = await db.query.classesTable.findFirst({
    where: eq(classesTable.id, classId),
    columns: { id: true, ownerId: true },
  });
  if (!classRow || !canManageClass(user, classRow.ownerId)) {
    return actionError("Bạn không có quyền xoá lớp này.");
  }

  const [examCount] = await db
    .select({ value: count() })
    .from(examsTable)
    .where(eq(examsTable.classId, classId));
  if (examCount.value > 0) {
    return actionError(
      "Không thể xoá lớp đã có bài kiểm tra. Hãy lưu trữ lớp.",
    );
  }

  await db.delete(classesTable).where(eq(classesTable.id, classId));
  revalidatePath("/admin/classes");
  revalidatePath(STUDENT_CLASSES_PATH);
  redirect("/admin/classes");
}

export async function joinClassAction(
  _previousState: ILearningActionState,
  formData: FormData,
): Promise<ILearningActionState> {
  const user = await requireStudentUser();
  const code = normalizeClassCode(getFormText(formData, "code"));

  if (code === "") {
    return actionError("Vui lòng nhập mã lớp.");
  }

  try {
    const classRow = await db.transaction(async (tx) => {
      const [lockedClass] = await tx
        .select()
        .from(classesTable)
        .where(eq(classesTable.code, code))
        .for("update");

      if (!lockedClass) {
        throw new Error("Mã lớp không tồn tại.");
      }
      if (lockedClass.status !== "active") {
        throw new Error("Lớp học đã đóng, không thể tham gia.");
      }

      const [memberCount] = await tx
        .select({ value: count() })
        .from(classMembersTable)
        .where(eq(classMembersTable.classId, lockedClass.id));
      if (memberCount.value >= lockedClass.maxSize) {
        throw new Error("Lớp đã đủ sĩ số tối đa.");
      }

      await tx.insert(classMembersTable).values({
        classId: lockedClass.id,
        userId: user.id,
        joinMethod: "code",
      });
      return lockedClass;
    });

    revalidatePath(STUDENT_CLASSES_PATH);
    redirect(getStudentClassHref(classRow.id));
  } catch (error) {
    unstable_rethrow(error);
    if (isUniqueViolation(error)) {
      return actionError("Bạn đã tham gia lớp này rồi.");
    }
    return actionError(getUnknownErrorMessage(error));
  }
}

export async function importClassRosterAction(
  _previousState: IImportActionState,
  formData: FormData,
): Promise<IImportActionState> {
  const user = await requireStaffUser();
  const classId = getFormInt(formData, "classId");
  const file = getFormFile(formData, "file");
  if (classId === undefined || !file) {
    return { error: "Vui lòng chọn file Excel danh sách sinh viên." };
  }
  if (file.size > MAX_IMPORT_FILE_SIZE) {
    return { error: "File vượt quá dung lượng 5MB." };
  }

  const classRow = await db.query.classesTable.findFirst({
    where: eq(classesTable.id, classId),
  });
  if (!classRow) {
    return { error: "Không tìm thấy lớp học." };
  }
  if (!canManageClass(user, classRow.ownerId)) {
    return { error: "Bạn không có quyền import danh sách cho lớp này." };
  }
  if (classRow.status !== "active") {
    return { error: "Lớp đã lưu trữ, không thể import thêm sinh viên." };
  }

  let rows: readonly Record<string, unknown>[];
  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    const workbook = XLSX.read(buffer, { type: "buffer" });
    const firstSheetName = workbook.SheetNames[0];
    if (!firstSheetName) {
      return { error: "File Excel không có sheet dữ liệu." };
    }
    const sheet = workbook.Sheets[firstSheetName];
    rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, {
      defval: "",
    });
  } catch {
    return { error: "Không đọc được file Excel. Vui lòng kiểm tra định dạng." };
  }

  const dataRows = rows.filter((row) =>
    Object.values(row).some((value) => String(value).trim() !== ""),
  );
  if (dataRows.length === 0) {
    return { error: "File Excel không có dữ liệu." };
  }

  const firstRow = dataRows[0];
  const headerMap = new Map<string, string>();
  for (const key of Object.keys(firstRow)) {
    headerMap.set(normalizeHeader(key), key);
  }
  const emailKey = headerMap.get("email") ?? headerMap.get("mail");
  const studentCodeKey =
    headerMap.get("mssv") ??
    headerMap.get("masosinhvien") ??
    headerMap.get("studentcode");
  const nameKey =
    headerMap.get("hoten") ?? headerMap.get("hovaten") ?? headerMap.get("name");

  if (!emailKey || !studentCodeKey) {
    return {
      error: "File cần có cột email và MSSV. Có thể dùng tiêu đề: Email, MSSV.",
    };
  }

  const [job] = await db
    .insert(classImportJobsTable)
    .values({
      classId,
      uploadedBy: user.id,
      fileName: file.name,
      status: "processing",
      totalRows: dataRows.length,
    })
    .returning({ id: classImportJobsTable.id });

  const errors: IClassImportError[] = [];
  let successRows = 0;

  try {
    await db.transaction(async (tx) => {
      const [lockedClass] = await tx
        .select()
        .from(classesTable)
        .where(eq(classesTable.id, classId))
        .for("update");
      if (!lockedClass) {
        throw new Error("Không tìm thấy lớp học.");
      }

      const [memberCount] = await tx
        .select({ value: count() })
        .from(classMembersTable)
        .where(eq(classMembersTable.classId, classId));
      const capacity = Math.max(lockedClass.maxSize - memberCount.value, 0);

      for (let index = 0; index < dataRows.length; index += 1) {
        const row = dataRows[index];
        const rowNumber = index + 2;
        const email = readRecordValue(
          row,
          emailKey ? [emailKey] : [],
        ).toLowerCase();
        const studentCode = readRecordValue(
          row,
          studentCodeKey ? [studentCodeKey] : [],
        );
        const fullName = nameKey ? readRecordValue(row, [nameKey]) : "";

        if (email === "" || studentCode === "") {
          errors.push({
            row: rowNumber,
            email,
            studentCode: studentCode || null,
            code: "MISSING_FIELD",
            message: "Thiếu email hoặc MSSV.",
          });
          continue;
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
          errors.push({
            row: rowNumber,
            email,
            studentCode,
            code: "INVALID_EMAIL",
            message: "Email không hợp lệ.",
          });
          continue;
        }
        if (successRows >= capacity) {
          errors.push({
            row: rowNumber,
            email,
            studentCode,
            code: "CAPACITY_EXCEEDED",
            message: "Lớp đã đủ sĩ số tối đa.",
          });
          continue;
        }

        const student = await tx.query.usersTable.findFirst({
          where: eq(usersTable.email, email),
          columns: { id: true, role: true },
        });
        if (!student) {
          errors.push({
            row: rowNumber,
            email,
            studentCode,
            code: "USER_NOT_FOUND",
            message: `Email chưa có tài khoản${fullName ? ` (${fullName})` : ""}.`,
          });
          continue;
        }
        if (student.role !== "student") {
          errors.push({
            row: rowNumber,
            email,
            studentCode,
            code: "NOT_STUDENT",
            message: "Tài khoản này không phải sinh viên.",
          });
          continue;
        }

        const existingMember = await tx.query.classMembersTable.findFirst({
          where: and(
            eq(classMembersTable.classId, classId),
            eq(classMembersTable.userId, student.id),
          ),
          columns: { id: true },
        });
        if (existingMember) {
          errors.push({
            row: rowNumber,
            email,
            studentCode,
            code: "ALREADY_MEMBER",
            message: "Sinh viên đã có trong lớp.",
          });
          continue;
        }

        const existingStudentCode = await tx.query.classMembersTable.findFirst({
          where: and(
            eq(classMembersTable.classId, classId),
            eq(classMembersTable.studentCode, studentCode),
          ),
          columns: { id: true },
        });
        if (existingStudentCode) {
          errors.push({
            row: rowNumber,
            email,
            studentCode,
            code: "DUPLICATE_STUDENT_CODE",
            message: "MSSV đã thuộc về sinh viên khác trong lớp.",
          });
          continue;
        }

        await tx.insert(classMembersTable).values({
          classId,
          userId: student.id,
          joinMethod: "excel_import",
          studentCode,
        });
        successRows += 1;
      }

      await tx
        .update(classImportJobsTable)
        .set({
          status: "done",
          successRows,
          failedRows: errors.length,
          errorDetails: errors,
          finishedAt: new Date(),
        })
        .where(eq(classImportJobsTable.id, job.id));
    });
  } catch (error) {
    await db
      .update(classImportJobsTable)
      .set({
        status: "failed",
        successRows: 0,
        failedRows: dataRows.length,
        errorDetails: [
          {
            row: 0,
            email: "",
            studentCode: null,
            code: "IMPORT_FAILED",
            message: getUnknownErrorMessage(error),
          },
        ],
        finishedAt: new Date(),
      })
      .where(eq(classImportJobsTable.id, job.id));
    return { error: getUnknownErrorMessage(error) };
  }

  revalidatePath(getAdminClassHref(classId));
  return {
    success: `Đã import ${successRows}/${dataRows.length} sinh viên.`,
    summary: {
      totalRows: dataRows.length,
      successRows,
      failedRows: errors.length,
      errors,
    },
  };
}
