import { MIN_PASSWORD_LENGTH } from "./limits";

export interface IAuthError {
  readonly code?: string;
  readonly status?: number;
}

const TOO_MANY_REQUESTS_STATUS = 429;

export const GENERIC_AUTH_ERROR_MESSAGE =
  "Đã có lỗi xảy ra. Vui lòng thử lại sau.";

const AUTH_ERROR_MESSAGES: ReadonlyMap<string, string> = new Map(
  Object.entries({
    INVALID_EMAIL: "Email không hợp lệ.",
    INVALID_EMAIL_OR_PASSWORD: "Email hoặc mật khẩu không đúng.",
    INVALID_PASSWORD: "Email hoặc mật khẩu không đúng.",
    EMAIL_NOT_VERIFIED: "Email của bạn chưa được xác thực.",
    PASSWORD_TOO_SHORT: `Mật khẩu phải có ít nhất ${MIN_PASSWORD_LENGTH} ký tự.`,
    PASSWORD_TOO_LONG: "Mật khẩu quá dài.",
    PASSWORD_ALREADY_SET: "Tài khoản đã có mật khẩu.",
    UNAUTHORIZED: "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.",
    SESSION_EXPIRED: "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.",
    SESSION_NOT_FRESH: "Phiên đăng nhập đã cũ. Vui lòng đăng nhập lại.",
    USER_ALREADY_EXISTS: "Email này đã được đăng ký.",
    USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL:
      "Email này đã được đăng ký. Vui lòng dùng email khác.",
    EMAIL_ALREADY_VERIFIED: "Email này đã được xác thực. Bạn có thể đăng nhập.",
    INVALID_OTP: "Mã xác thực không đúng.",
    OTP_EXPIRED: "Mã xác thực đã hết hạn. Hãy gửi lại mã mới.",
    TOO_MANY_ATTEMPTS: "Bạn đã nhập sai quá nhiều lần. Hãy gửi lại mã mới.",
    USER_NOT_FOUND: "Không tìm thấy tài khoản với email này.",
  }),
);

export function getAuthErrorMessage(error: IAuthError): string {
  if (error.status === TOO_MANY_REQUESTS_STATUS) {
    return "Bạn thao tác quá nhanh. Vui lòng đợi một lát rồi thử lại.";
  }
  return (
    (error.code && AUTH_ERROR_MESSAGES.get(error.code)) ||
    GENERIC_AUTH_ERROR_MESSAGE
  );
}
