import { db } from ".";
import { algorithmCodeSnippetsTable, algorithmsTable } from "./schema";
import {
  CODE_SNIPPET_KINDS,
  type CodeSnippetKind,
  type NewAlgorithmCodeSnippet,
} from "./schema/sources";
import snippetsData from "./seed-data/snippets.json";

function isCodeSnippetKind(value: string): value is CodeSnippetKind {
  return CODE_SNIPPET_KINDS.some((kind) => kind === value);
}

const algorithms = await db
  .select({ id: algorithmsTable.id, key: algorithmsTable.key })
  .from(algorithmsTable);

const idByKey = new Map(algorithms.map(({ id, key }) => [key, id]));

const snippets: NewAlgorithmCodeSnippet[] = [];

for (const snippet of snippetsData) {
  if (!isCodeSnippetKind(snippet.kind)) {
    throw new Error(`Loại đoạn mã không hợp lệ: "${snippet.kind}"`);
  }
  const algorithmId = idByKey.get(snippet.algorithmKey);
  if (algorithmId === undefined) {
    throw new Error(`Không tìm thấy thuật toán "${snippet.algorithmKey}"`);
  }
  snippets.push({
    algorithmId,
    kind: snippet.kind,
    language: snippet.language,
    lines: snippet.lines,
  });
}

if (snippets.length > 0) {
  await db
    .insert(algorithmCodeSnippetsTable)
    .values(snippets)
    .onConflictDoNothing();
}

await db.$client.end();
console.log(`Đã chạy seed ${snippets.length} đoạn mã!!!`);
