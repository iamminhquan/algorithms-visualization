import type { AnswerMatchMode, QuestionType } from "@/db/schema";
import type { IQuestionImportError } from "./types";
import { extractBlankIndexes, normalizeHeader } from "./validation";

/**
 * Các hàm trong file này là TypeScript thuần: dùng chung cho form nhập tay, action import
 * file Excel/CSV và script seed, nên không import React, `db` hay `server-only`.
 */

/** Một lựa chọn trắc nghiệm đã chuẩn hoá. */
export interface IParsedOption {
  readonly content: string;
  readonly isCorrect: boolean;
}

/** Một đáp án chấp nhận của câu điền khuyết hoặc câu trả lời cuối cùng. */
export interface IParsedAnswerKey {
  readonly blankIndex: number;
  readonly acceptedValue: string;
}

/** Một câu hỏi đã chuẩn hoá, sẵn sàng ghi vào cơ sở dữ liệu. */
export interface IParsedQuestion {
  /** Số dòng trong file (dòng tiêu đề là 1) để báo lỗi cho người dùng. */
  readonly row: number;
  readonly type: QuestionType;
  readonly content: string;
  readonly allowMultiple: boolean;
  readonly matchMode: AnswerMatchMode;
  readonly options: readonly IParsedOption[];
  readonly answerKeys: readonly IParsedAnswerKey[];
  /** Điểm đi kèm trong file; chỉ dùng khi import thẳng vào một bài kiểm tra. */
  readonly points: number;
}

export interface IQuestionFileParseResult {
  readonly questions: readonly IParsedQuestion[];
  readonly errors: readonly IQuestionImportError[];
}

const TYPE_ALIASES = new Map<string, QuestionType>(
  (
    [
      ["trắc nghiệm", "multiple_choice"],
      ["multiple choice", "multiple_choice"],
      ["multiple_choice", "multiple_choice"],
      ["mcq", "multiple_choice"],
      ["điền khuyết", "fill_blank"],
      ["fill blank", "fill_blank"],
      ["fill_blank", "fill_blank"],
      ["kết quả cuối cùng", "final_answer"],
      ["final answer", "final_answer"],
      ["final_answer", "final_answer"],
    ] as const
  ).map(([label, type]) => [normalizeHeader(label), type]),
);

const MATCH_MODE_ALIASES = new Map<string, AnswerMatchMode>(
  (
    [
      ["chính xác", "exact"],
      ["exact", "exact"],
      ["không phân biệt hoa thường", "case_insensitive"],
      ["case insensitive", "case_insensitive"],
      ["case_insensitive", "case_insensitive"],
      ["so sánh số", "numeric"],
      ["numeric", "numeric"],
    ] as const
  ).map(([label, mode]) => [normalizeHeader(label), mode]),
);

const TRUE_VALUES = new Set(["1", "true", "yes", "y", "x", "co", "có"]);

const HEADER_ALIASES = {
  type: ["loai", "type", "loaicauhoi", "questiontype"],
  content: ["noidung", "content", "cauhoi", "question"],
  options: ["luachon", "options", "cacluachon"],
  correct: ["dapandung", "correct", "correctanswer", "dapandungs"],
  answerKeys: [
    "dapanchapnhan",
    "dapan",
    "answerkeys",
    "answers",
    "acceptedanswers",
  ],
  matchMode: ["cachsokhop", "sokhop", "matchmode", "match"],
  allowMultiple: ["nhieudapan", "allowmultiple", "multiple"],
  points: ["diem", "points", "score"],
} as const;

/** So khớp nội dung lựa chọn/đáp án, chỉ bỏ khoảng trắng thừa và phân biệt hoa thường. */
function normalizeText(value: string): string {
  return value.normalize("NFC").trim().toLocaleLowerCase("vi");
}

export function parseQuestionType(value: string): QuestionType | null {
  const normalized = normalizeHeader(value);
  if (normalized === "") {
    return null;
  }
  return TYPE_ALIASES.get(normalized) ?? null;
}

export function parseMatchMode(value: string): AnswerMatchMode {
  return MATCH_MODE_ALIASES.get(normalizeHeader(value)) ?? "exact";
}

/**
 * Kiểm tra câu hỏi đã chuẩn hoá. Dùng chung cho form nhập tay và file import để hai đường
 * vào luôn có cùng quy tắc.
 *
 * @returns Thông báo lỗi bằng tiếng Việt, hoặc `null` nếu hợp lệ.
 */
export function validateQuestionInput(
  type: QuestionType,
  content: string,
  options: readonly IParsedOption[],
  answerKeys: readonly IParsedAnswerKey[],
  allowMultiple: boolean,
): string | null {
  if (content === "") {
    return "Nội dung câu hỏi không được để trống.";
  }

  if (type === "multiple_choice") {
    if (options.length < 2) {
      return "Câu trắc nghiệm cần ít nhất 2 lựa chọn.";
    }
    if (options.some((option) => option.content === "")) {
      return "Nội dung lựa chọn không được để trống.";
    }
    const correctCount = options.filter((option) => option.isCorrect).length;
    if (correctCount === 0) {
      return "Cần chọn ít nhất một đáp án đúng.";
    }
    if (!allowMultiple && correctCount !== 1) {
      return "Câu chọn một đáp án chỉ được có đúng một đáp án đúng.";
    }
    return null;
  }

  if (answerKeys.length === 0) {
    return "Cần nhập ít nhất một đáp án chấp nhận.";
  }
  if (answerKeys.some((key) => key.acceptedValue === "")) {
    return "Đáp án chấp nhận không được để trống.";
  }

  if (type === "fill_blank") {
    const blankIndexes = extractBlankIndexes(content);
    if (blankIndexes.length === 0) {
      return "Nội dung điền khuyết cần có chỗ trống dạng {{1}}, {{2}}...";
    }
    const keyIndexes = new Set(answerKeys.map((key) => key.blankIndex));
    for (const blankIndex of blankIndexes) {
      if (!keyIndexes.has(blankIndex)) {
        return `Chỗ trống {{${blankIndex}}} chưa có đáp án.`;
      }
    }
    for (const keyIndex of keyIndexes) {
      if (!blankIndexes.includes(keyIndex)) {
        return `Đáp án cho chỗ trống ${keyIndex} không tồn tại trong nội dung.`;
      }
    }
  }

  return null;
}

function buildHeaderMap(
  rows: readonly Readonly<Record<string, unknown>>[],
): ReadonlyMap<string, string> {
  const headerMap = new Map<string, string>();
  for (const row of rows) {
    for (const key of Object.keys(row)) {
      const normalized = normalizeHeader(key);
      if (!headerMap.has(normalized)) {
        headerMap.set(normalized, key);
      }
    }
  }
  return headerMap;
}

function readCell(
  record: Readonly<Record<string, unknown>>,
  headerMap: ReadonlyMap<string, string>,
  aliases: readonly string[],
): string {
  for (const alias of aliases) {
    const key = headerMap.get(normalizeHeader(alias));
    if (key === undefined) {
      continue;
    }
    const value = record[key];
    if (typeof value === "string" && value.trim() !== "") {
      return value.trim();
    }
    if (typeof value === "number" && Number.isFinite(value)) {
      return String(value);
    }
  }
  return "";
}

function splitList(value: string): readonly string[] {
  return value
    .split("|")
    .map((item) => item.trim())
    .filter((item) => item !== "");
}

function parseBoolean(value: string): boolean {
  return TRUE_VALUES.has(normalizeHeader(value));
}

function parsePoints(value: string): number | null {
  if (value === "") {
    return 1;
  }
  const parsed = Number(value.replace(",", "."));
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

function inferQuestionType(
  content: string,
  options: readonly string[],
): QuestionType {
  if (options.length > 0) {
    return "multiple_choice";
  }
  if (extractBlankIndexes(content).length > 0) {
    return "fill_blank";
  }
  return "final_answer";
}

function parseAnswerKeyToken(
  token: string,
  type: QuestionType,
): IParsedAnswerKey | null {
  if (type === "final_answer") {
    return { blankIndex: 1, acceptedValue: token };
  }

  const separatorIndex = token.indexOf("=");
  if (separatorIndex === -1) {
    return { blankIndex: 1, acceptedValue: token };
  }

  const blankIndex = Number(token.slice(0, separatorIndex).trim());
  const acceptedValue = token.slice(separatorIndex + 1).trim();
  if (!Number.isInteger(blankIndex) || blankIndex < 1 || acceptedValue === "") {
    return null;
  }
  return { blankIndex, acceptedValue };
}

/**
 * Đọc các dòng Excel/CSV đã được `sheet_to_json` chuyển thành object và trả về câu hỏi
 * hợp lệ cùng danh sách lỗi theo số dòng.
 *
 * Cột hỗ trợ (không phân biệt dấu, hoa thường): Loại, Nội dung, Lựa chọn, Đáp án đúng,
 * Đáp án chấp nhận, Cách so khớp, Nhiều đáp án, Điểm. Lựa chọn và đáp án phân tách bằng `|`.
 */
export function parseQuestionRows(
  rows: readonly Readonly<Record<string, unknown>>[],
): IQuestionFileParseResult {
  const questions: IParsedQuestion[] = [];
  const errors: IQuestionImportError[] = [];
  const headerMap = buildHeaderMap(rows);

  rows.forEach((record, index) => {
    const row = index + 2;
    const read = (...aliases: string[]) => readCell(record, headerMap, aliases);

    const content = read(...HEADER_ALIASES.content);
    if (content === "") {
      errors.push({
        row,
        code: "MISSING_CONTENT",
        message: "Thiếu nội dung câu hỏi.",
      });
      return;
    }

    const optionTexts = splitList(read(...HEADER_ALIASES.options));
    const type =
      parseQuestionType(read(...HEADER_ALIASES.type)) ??
      inferQuestionType(content, optionTexts);
    const matchMode = parseMatchMode(read(...HEADER_ALIASES.matchMode));
    const allowMultiple = parseBoolean(read(...HEADER_ALIASES.allowMultiple));
    const points = parsePoints(read(...HEADER_ALIASES.points));
    if (points === null) {
      errors.push({
        row,
        code: "INVALID_POINTS",
        message: "Điểm phải là số lớn hơn 0.",
      });
      return;
    }

    let options: readonly IParsedOption[] = [];
    let answerKeys: readonly IParsedAnswerKey[] = [];

    if (type === "multiple_choice") {
      if (optionTexts.length < 2) {
        errors.push({
          row,
          code: "MISSING_OPTIONS",
          message:
            "Câu trắc nghiệm cần ít nhất 2 lựa chọn, phân tách bằng dấu |.",
        });
        return;
      }

      const correctTokens = splitList(read(...HEADER_ALIASES.correct));
      if (correctTokens.length === 0) {
        errors.push({
          row,
          code: "MISSING_CORRECT",
          message:
            "Thiếu đáp án đúng (số thứ tự 1-based hoặc nội dung lựa chọn).",
        });
        return;
      }

      const correctIndexes = new Set<number>();
      for (const token of correctTokens) {
        const numeric = Number(token);
        if (
          Number.isInteger(numeric) &&
          numeric >= 1 &&
          numeric <= optionTexts.length
        ) {
          correctIndexes.add(numeric - 1);
          continue;
        }
        const normalized = normalizeText(token);
        const foundIndex = optionTexts.findIndex(
          (text) => normalizeText(text) === normalized,
        );
        if (foundIndex === -1) {
          errors.push({
            row,
            code: "UNKNOWN_CORRECT",
            message: `Đáp án đúng "${token}" không khớp lựa chọn nào.`,
          });
          return;
        }
        correctIndexes.add(foundIndex);
      }

      options = optionTexts.map((text, optionIndex) => ({
        content: text,
        isCorrect: correctIndexes.has(optionIndex),
      }));
    } else {
      const rawAnswers =
        read(...HEADER_ALIASES.answerKeys) || read(...HEADER_ALIASES.correct);
      const tokens = splitList(rawAnswers);
      if (tokens.length === 0) {
        errors.push({
          row,
          code: "MISSING_ANSWER",
          message: "Thiếu đáp án chấp nhận, phân tách bằng dấu |.",
        });
        return;
      }

      const keys: IParsedAnswerKey[] = [];
      const seen = new Set<string>();
      for (const token of tokens) {
        const key = parseAnswerKeyToken(token, type);
        if (key === null) {
          errors.push({
            row,
            code: "INVALID_ANSWER",
            message: `Đáp án "${token}" không hợp lệ.`,
          });
          return;
        }
        const dedupeKey = `${key.blankIndex}:${normalizeText(key.acceptedValue)}`;
        if (seen.has(dedupeKey)) {
          continue;
        }
        seen.add(dedupeKey);
        keys.push(key);
      }
      answerKeys = keys;
    }

    const validationError = validateQuestionInput(
      type,
      content,
      options,
      answerKeys,
      allowMultiple,
    );
    if (validationError) {
      errors.push({
        row,
        code: "INVALID_QUESTION",
        message: validationError,
      });
      return;
    }

    questions.push({
      row,
      type,
      content,
      allowMultiple,
      matchMode,
      options,
      answerKeys,
      points,
    });
  });

  return { questions, errors };
}
