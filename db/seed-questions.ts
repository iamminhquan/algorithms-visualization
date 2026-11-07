import { readFileSync } from "node:fs";
import { eq, inArray } from "drizzle-orm";
import * as XLSX from "xlsx";
import { parseQuestionRows } from "../features/learning/question-file";
import { insertQuestion } from "../features/learning/question-store";
import { db } from ".";
import { questionsTable, usersTable } from "./schema";

/**
 * Seed bộ câu hỏi mẫu từ `public/samples/cau-hoi-mau.csv` — cũng chính là file người dùng
 * tải về từ nút "Tải file mẫu" trong giao diện import.
 *
 * Cách chạy:
 *   bun run db:seed:questions
 *   bun run db:seed:questions --email=giaovien@example.com
 *
 * Chủ sở hữu câu hỏi được chọn theo thứ tự: tham số `--email`, biến môi trường
 * `SEED_QUESTIONS_EMAIL`, `ADMIN_EMAIL`, rồi tài khoản admin/teacher đầu tiên.
 * Script chạy lại nhiều lần vẫn an toàn: câu hỏi đã có cùng nội dung của cùng chủ sở hữu
 * sẽ được bỏ qua.
 */

const SAMPLE_CSV_URL = new URL(
  "../public/samples/cau-hoi-mau.csv",
  import.meta.url,
);

function getArgValue(name: string): string | undefined {
  const prefix = `--${name}=`;
  const arg = process.argv
    .slice(2)
    .find((item) => item.startsWith(prefix))
    ?.slice(prefix.length)
    .trim();
  return arg ? arg : undefined;
}

function readSampleRows(): readonly Readonly<Record<string, unknown>>[] {
  const buffer = readFileSync(SAMPLE_CSV_URL);
  const workbook = XLSX.read(buffer, { type: "buffer" });
  const firstSheetName = workbook.SheetNames[0];
  if (!firstSheetName) {
    throw new Error("File câu hỏi mẫu không có sheet dữ liệu.");
  }
  return XLSX.utils.sheet_to_json<Readonly<Record<string, unknown>>>(
    workbook.Sheets[firstSheetName],
    { defval: "" },
  );
}

async function resolveOwner() {
  const email =
    getArgValue("email") ??
    process.env.SEED_QUESTIONS_EMAIL?.trim() ??
    process.env.ADMIN_EMAIL?.trim();

  if (email) {
    const owner = await db.query.usersTable.findFirst({
      where: eq(usersTable.email, email.toLowerCase()),
    });
    if (!owner) {
      throw new Error(`Không tìm thấy tài khoản ${email}.`);
    }
    if (owner.role !== "admin" && owner.role !== "teacher") {
      throw new Error(
        `Tài khoản ${email} không phải giáo viên hoặc admin nên không sở hữu câu hỏi.`,
      );
    }
    return owner;
  }

  const owner = await db.query.usersTable.findFirst({
    where: inArray(usersTable.role, ["admin", "teacher"]),
    orderBy: (users, { asc }) => [asc(users.createdAt)],
  });
  if (!owner) {
    throw new Error(
      "Chưa có tài khoản admin/teacher. Hãy chạy db:seed:admin hoặc truyền --email=...",
    );
  }
  return owner;
}

const owner = await resolveOwner();
const rows = readSampleRows();
const { questions, errors } = parseQuestionRows(rows);

if (errors.length > 0) {
  console.warn(`Bỏ qua ${errors.length} dòng không hợp lệ trong file mẫu:`);
  for (const error of errors) {
    console.warn(`  Dòng ${error.row}: ${error.message}`);
  }
}

const existing = await db.query.questionsTable.findMany({
  where: eq(questionsTable.createdBy, owner.id),
  columns: { content: true },
});
const existingContents = new Set(existing.map((question) => question.content));

let inserted = 0;
let skipped = 0;
try {
  for (const question of questions) {
    if (existingContents.has(question.content)) {
      skipped += 1;
      continue;
    }

    await insertQuestion({
      createdBy: owner.id,
      type: question.type,
      content: question.content,
      allowMultiple: question.allowMultiple,
      matchMode: question.matchMode,
      options: question.options,
      answerKeys: question.answerKeys,
    });
    existingContents.add(question.content);
    inserted += 1;
  }
} finally {
  await db.$client.end();
}

console.log(
  `Đã seed câu hỏi cho ${owner.email}: thêm ${inserted}, bỏ qua ${skipped} câu đã có.`,
);
