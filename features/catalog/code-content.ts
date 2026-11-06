import type { SourceCode } from "@/engine/visualization";

export interface IAlgorithmCodeContent {
  readonly pseudocode: readonly string[];
  readonly sourceCode: SourceCode;
}
