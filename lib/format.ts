const DATE_FORMATTER = new Intl.DateTimeFormat("vi-VN", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  timeZone: "Asia/Ho_Chi_Minh",
});

const DATE_TIME_FORMATTER = new Intl.DateTimeFormat("vi-VN", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "Asia/Ho_Chi_Minh",
});

const NUMBER_FORMATTER = new Intl.NumberFormat("vi-VN");

export function formatDate(value: Date | string): string {
  return DATE_FORMATTER.format(
    typeof value === "string" ? new Date(value) : value,
  );
}

export function formatDateTime(value: Date | string): string {
  return DATE_TIME_FORMATTER.format(
    typeof value === "string" ? new Date(value) : value,
  );
}

export function formatNumber(value: number): string {
  return NUMBER_FORMATTER.format(value);
}
