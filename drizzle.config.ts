import { loadEnvConfig } from "@next/env";
import { defineConfig } from "drizzle-kit";

/*
 * drizzle-kit chạy ngoài Next.js nên cần tự nạp các file .env*.
 */
loadEnvConfig(process.cwd());

const dbUrl = process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL;
if (!dbUrl) {
  throw new Error("Chưa đặt biến môi trường DATABASE_URL");
}

export default defineConfig({
  dialect: "postgresql",
  schema: "./db/schema",
  out: "./drizzle",
  dbCredentials: {
    url: dbUrl,
  },
  strict: true,
  verbose: true,
});
