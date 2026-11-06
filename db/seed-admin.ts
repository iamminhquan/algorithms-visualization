import { randomUUID } from "node:crypto";
import { hashPassword } from "better-auth/crypto";
import { eq } from "drizzle-orm";
import { db } from ".";
import { accountsTable, usersTable } from "./schema";

const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
const password = process.env.ADMIN_PASSWORD;
const name = process.env.ADMIN_NAME?.trim() || "admin";

if (!email || !password) {
  throw new Error(
    "Cần đặt ADMIN_EMAIL và ADMIN_PASSWORD để tạo tài khoản admin",
  );
}

const existing = await db.query.usersTable.findFirst({
  where: eq(usersTable.email, email),
});

if (existing === undefined) {
  const userId = randomUUID();
  const passwordHash = await hashPassword(password);

  await db.transaction(async (tx) => {
    await tx.insert(usersTable).values({
      id: userId,
      name,
      email,
      emailVerified: true,
      role: "admin",
    });
    await tx.insert(accountsTable).values({
      id: randomUUID(),
      userId,
      accountId: userId,
      providerId: "credential",
      password: passwordHash,
    });
  });

  console.log(`Đã tạo tài khoản admin ${email}`);
} else {
  await db
    .update(usersTable)
    .set({ role: "admin", emailVerified: true })
    .where(eq(usersTable.id, existing.id));
  console.log(`Tài khoản ${email} đã tồn tại, đã cập nhật quyền admin`);
}

await db.$client.end();
