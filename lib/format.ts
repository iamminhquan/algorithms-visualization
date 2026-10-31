const DATE_FORMATTER = new Intl.DateTimeFormat("vi-VN", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  timeZone: "Asia/Ho_Chi_Minh",
});

const NUMBER_FORMATTER = new Intl.NumberFormat("vi-VN");

export function formatDate(value: Date | string): string {
  return DATE_FORMATTER.format(
    typeof value === "string" ? new Date(value) : value,
  );
}

export function formatNumber(value: number): string {
  return NUMBER_FORMATTER.format(value);
}
