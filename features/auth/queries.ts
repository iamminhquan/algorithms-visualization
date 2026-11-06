import { cacheLife, cacheTag } from "next/cache";
import "server-only";
import { db } from "@/db";

const USERS_CACHE_TAG = "users";

export async function getUserCatalog() {
  "use cache";
  cacheLife("minutes");
  cacheTag(USERS_CACHE_TAG);
  return db.query.usersTable.findMany({
    orderBy: (users, { desc: descending }) => descending(users.createdAt),
  });
}
