import { randomInt } from "node:crypto";

export const CLASS_CODE_LENGTH = 6;

const CLASS_CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export const CLASS_CODE_PATTERN = /^[A-Z0-9]{6,8}$/;

export function getFormText(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

export function getFormInt(
  formData: FormData,
  key: string,
): number | undefined {
  const raw = getFormText(formData, key);
  if (raw === "") {
    return undefined;
  }
  const value = Number(raw);
  return Number.isInteger(value) ? value : undefined;
}

export function getFormNumber(
  formData: FormData,
  key: string,
): number | undefined {
  const raw = getFormText(formData, key);
  if (raw === "") {
    return undefined;
  }
  const value = Number(raw);
  return Number.isFinite(value) ? value : undefined;
}

export function getFormFile(formData: FormData, key: string): File | null {
  const value = formData.get(key);
  return value instanceof File && value.size > 0 ? value : null;
}

export function normalizeClassCode(value: string): string {
  return value.trim().toLocaleUpperCase("en-US");
}

export function generateClassCode(): string {
  let code = "";
  for (let index = 0; index < CLASS_CODE_LENGTH; index += 1) {
    code += CLASS_CODE_ALPHABET[randomInt(CLASS_CODE_ALPHABET.length)];
  }
  return code;
}

export function parseDeadline(value: string): Date | null {
  if (value === "") {
    return null;
  }
  const localDateTimePattern = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2})?$/;
  const normalized = localDateTimePattern.test(value)
    ? `${value.length === 16 ? `${value}:00` : value}+07:00`
    : value;
  const date = new Date(normalized);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function extractBlankIndexes(content: string): readonly number[] {
  const indexes = new Set<number>();
  for (const match of content.matchAll(/\{\{\s*(\d+)\s*\}\}/g)) {
    const index = Number(match[1]);
    if (Number.isInteger(index) && index >= 1) {
      indexes.add(index);
    }
  }
  return [...indexes].sort((left, right) => left - right);
}

export function isUniqueViolation(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === "23505"
  );
}
