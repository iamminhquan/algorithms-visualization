import { MIN_PASSWORD_LENGTH } from "./limits";

export interface IAddPasswordResult {
  readonly ok: boolean;
  readonly message?: string;
}

export function getPasswordLengthError(password: string): string | undefined {
  if (password.length < MIN_PASSWORD_LENGTH) {
    return `Mật khẩu phải có ít nhất ${MIN_PASSWORD_LENGTH} ký tự.`;
  }
  return undefined;
}

export function getNewPasswordError(
  password: string,
  confirmation: string,
): string | undefined {
  const lengthError = getPasswordLengthError(password);
  if (lengthError !== undefined) {
    return lengthError;
  }
  if (password !== confirmation) {
    return "Hai lần nhập mật khẩu không khớp.";
  }
  return undefined;
}
