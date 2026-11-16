"use server";

import { eq } from "drizzle-orm";
import { updateTag } from "next/cache";
import { db } from "@/db";
import {
  algorithmSourceCodesTable,
  algorithmsTable,
  categoriesTable,
} from "@/db/schema";
import { requireAdminUser } from "@/features/learning/auth";
import type { ILearningActionState } from "@/features/learning/types";

const SLUG_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function getText(formData: FormData, name: string): string {
  const value = formData.get(name);
  return typeof value === "string" ? value.trim() : "";
}

function getLines(formData: FormData, name: string): string[] {
  return getText(formData, name)
    .split(/\r?\n/)
    .map((line) => line.replace(/\s+$/, ""))
    .filter((line, index, lines) => line !== "" || index < lines.length - 1);
}

export async function createAlgorithmAction(
  _previousState: ILearningActionState,
  formData: FormData,
): Promise<ILearningActionState> {
  await requireAdminUser();

  const name = getText(formData, "name");
  const algorithmId = Number(getText(formData, "algorithmId")) || null;
  const key = getText(formData, "key");
  const slug = getText(formData, "slug");
  const categoryId = Number(getText(formData, "categoryId"));
  const description = getText(formData, "description");
  const timeComplexity = getText(formData, "timeComplexity");
  const spaceComplexity = getText(formData, "spaceComplexity");

  if (!name || !SLUG_REGEX.test(key) || !SLUG_REGEX.test(slug)) {
    return { error: "Vui lòng nhập tên, key và slug hợp lệ." };
  }
  if (!Number.isSafeInteger(categoryId) || categoryId < 1) {
    return { error: "Vui lòng chọn danh mục hợp lệ." };
  }
  const category = await db.query.categoriesTable.findFirst({
    where: eq(categoriesTable.id, categoryId),
    columns: { id: true },
  });
  if (!category) {
    return { error: "Danh mục đã chọn không còn tồn tại." };
  }

  try {
    await db.transaction(async (tx) => {
      let id = algorithmId;
      if (algorithmId) {
        const updated = await tx
          .update(algorithmsTable)
          .set({
            name,
            slug,
            categoryId,
            description: description || null,
            timeComplexity: timeComplexity || null,
            spaceComplexity: spaceComplexity || null,
          })
          .where(eq(algorithmsTable.id, algorithmId))
          .returning({ id: algorithmsTable.id });
        if (updated.length === 0) {
          throw new Error("Thuật toán cần sửa không còn tồn tại.");
        }
        await tx
          .delete(algorithmSourceCodesTable)
          .where(eq(algorithmSourceCodesTable.algorithmId, algorithmId));
      } else {
        const [algorithm] = await tx
          .insert(algorithmsTable)
          .values({
            name,
            key,
            slug,
            categoryId,
            description: description || null,
            timeComplexity: timeComplexity || null,
            spaceComplexity: spaceComplexity || null,
          })
          .returning({ id: algorithmsTable.id });
        id = algorithm.id;
      }
      if (!id) {
        throw new Error("Không thể xác định thuật toán cần lưu.");
      }

      const snippets = [];
      const pseudocode = getLines(formData, "pseudocode");
      if (pseudocode.length > 0) {
        snippets.push({
          algorithmId: id,
          kind: "pseudocode" as const,
          language: "",
          lines: pseudocode,
        });
      }
      const cpp = getLines(formData, "sourceCode.cpp");
      if (cpp.length > 0) {
        snippets.push({
          algorithmId: id,
          kind: "source" as const,
          language: "cpp",
          lines: cpp,
        });
      }
      if (snippets.length > 0) {
        await tx.insert(algorithmSourceCodesTable).values(snippets);
      }
    });
  } catch (error) {
    const databaseError = error as { code?: string; constraint?: string };
    if (databaseError.code === "23505") {
      return {
        error:
          "Tên, key hoặc slug này đã được sử dụng. Vui lòng chọn giá trị khác.",
      };
    }
    throw error;
  }

  updateTag("catalog");
  return { success: algorithmId ? "Đã lưu thay đổi." : "Đã thêm thuật toán." };
}
