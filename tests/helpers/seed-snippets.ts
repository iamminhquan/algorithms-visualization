import snippets from "@/db/seed-data/snippets.json";

export function getSeedPseudocodeLines(
  algorithmKey: string,
): readonly string[] {
  const snippet = snippets.find(
    (entry) =>
      entry.algorithmKey === algorithmKey && entry.kind === "pseudocode",
  );
  if (snippet === undefined) {
    throw new Error(`Không tìm thấy mã giả cho thuật toán "${algorithmKey}"`);
  }
  return snippet.lines;
}

export function getSeedSourceLines(algorithmKey: string): readonly string[] {
  const snippet = snippets.find(
    (entry) => entry.algorithmKey === algorithmKey && entry.kind === "source",
  );
  if (snippet === undefined) {
    throw new Error(`Không tìm thấy mã nguồn cho thuật toán "${algorithmKey}"`);
  }
  return snippet.lines;
}
