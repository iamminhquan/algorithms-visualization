export const CODE_LANGUAGES = ["cpp"] as const;

export type CodeLanguage = (typeof CODE_LANGUAGES)[number];
export type SourceCode = Readonly<Record<CodeLanguage, readonly string[]>>;
