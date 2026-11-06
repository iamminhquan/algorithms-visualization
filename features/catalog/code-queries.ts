import { eq } from "drizzle-orm";
import { cacheLife, cacheTag } from "next/cache";
import "server-only";
import { db } from "@/db";
import { algorithmCodeSnippetsTable, algorithmsTable } from "@/db/schema";
import type { SourceCode } from "@/engine/visualization";
import type { IAlgorithmCodeContent } from "./code-content";

function getCodeCacheTag(key: string): string {
  return `algorithm-code-${key}`;
}

export async function getAlgorithmSourceCode(
  key: string,
): Promise<IAlgorithmCodeContent> {
  "use cache";
  cacheLife("hours");
  cacheTag(getCodeCacheTag(key));

  const rows = await db
    .select({
      kind: algorithmCodeSnippetsTable.kind,
      language: algorithmCodeSnippetsTable.language,
      lines: algorithmCodeSnippetsTable.lines,
    })
    .from(algorithmCodeSnippetsTable)
    .innerJoin(
      algorithmsTable,
      eq(algorithmsTable.id, algorithmCodeSnippetsTable.algorithmId),
    )
    .where(eq(algorithmsTable.key, key));

  const pseudocode = rows.find((row) => row.kind === "pseudocode")?.lines ?? [];
  const cppLines = rows.find(
    (row) => row.kind === "source" && row.language === "cpp",
  )?.lines;

  const sourceCode: SourceCode = { cpp: cppLines ?? [] };

  return { pseudocode, sourceCode };
}
