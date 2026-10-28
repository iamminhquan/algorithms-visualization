export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function isNonNegativeInteger(value: unknown): value is number {
  return typeof value === "number" && Number.isInteger(value) && value >= 0;
}

export function isShortText(
  value: unknown,
  maxLength: number,
): value is string {
  return typeof value === "string" && value.length <= maxLength;
}
