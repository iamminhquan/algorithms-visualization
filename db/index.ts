import "server-only";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

const dbUrl = process.env.DATABASE_URL;
if (!dbUrl) {
  throw new Error("Chưa đặt biến môi trường DATABASE_URL");
}

/*
 * Giữ một Pool duy nhất qua các lần hot reload khi chạy `next dev`.
 * `globalThis` không khai báo sẵn field `pool` nên phải ép kiểu để gắn thêm vào.
 */
const globalForDb = globalThis as unknown as { pool?: Pool };

const pool = globalForDb.pool ?? new Pool({ connectionString: dbUrl });

if (process.env.NODE_ENV !== "production") {
  globalForDb.pool = pool;
}

export const db = drizzle({ client: pool, schema });
