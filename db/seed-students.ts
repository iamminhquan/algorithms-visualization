import { randomUUID } from "node:crypto";
import { readFileSync } from "node:fs";
import { hashPassword } from "better-auth/crypto";
import { eq } from "drizzle-orm";
import * as XLSX from "xlsx";
import { db } from ".";
import { accountsTable, usersTable } from "./schema";

const csvPath = process.argv[2] ?? "public/samples/import-roster-20.csv";
const password = process.env.STUDENT_PASSWORD ?? "Student@123";

const normalizeHeader = (value: string): string =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");

const workbook = XLSX.read(readFileSync(csvPath), { type: "buffer" });
const firstSheetName = workbook.SheetNames[0];
if (!firstSheetName) {
  throw new Error(`File ${csvPath} không có sheet dữ liệu`);
}
const rows = XLSX.utils
  .sheet_to_json<Record<string, unknown>>(workbook.Sheets[firstSheetName], {
    defval: "",
  })
  .filter((row) =>
    Object.values(row).some((value) => String(value).trim() !== ""),
  );

const headerMap = new Map<string, string>();
for (const key of Object.keys(rows[0] ?? {})) {
  headerMap.set(normalizeHeader(key), key);
}
const emailKey = headerMap.get("email") ?? headerMap.get("mail");
const nameKey =
  headerMap.get("hoten") ?? headerMap.get("hovaten") ?? headerMap.get("name");
if (!emailKey) {
  throw new Error(`File ${csvPath} thiếu cột email`);
}

const passwordHash = await hashPassword(password);
let created = 0;
let skipped = 0;

for (const [index, row] of rows.entries()) {
  const email = String(row[emailKey] ?? "")
    .trim()
    .toLowerCase();
  const name = nameKey ? String(row[nameKey] ?? "").trim() : "";
  if (email === "") {
    console.log(`Bỏ qua dòng ${index + 2}: thiếu email`);
    continue;
  }

  const existing = await db.query.usersTable.findFirst({
    where: eq(usersTable.email, email),
    columns: { id: true },
  });
  if (existing) {
    skipped += 1;
    continue;
  }

  const userId = randomUUID();
  await db.transaction(async (tx) => {
    await tx.insert(usersTable).values({
      id: userId,
      name: name === "" ? email : name,
      email,
      role: "student",
      emailVerified: true,
      isLocked: false,
    });
    await tx.insert(accountsTable).values({
      id: randomUUID(),
      userId,
      accountId: userId,
      providerId: "credential",
      password: passwordHash,
    });
  });
  created += 1;
  console.log(`Đã tạo sinh viên ${email}`);
}

console.log(
  `\nTổng ${rows.length} dòng: tạo mới ${created}, bỏ qua (đã tồn tại) ${skipped}. Mật khẩu: ${password}`,
);

await db.$client.end();
