export const LOGIN_PATH = "/login";
export const REGISTER_PATH = "/register";
export const VERIFY_EMAIL_PATH = "/verify-email";
export const RESET_PASSWORD_PATH = "/reset-password";
export const PROFILE_PATH = "/profile";
export const AFTER_SIGN_IN_PATH = "/";

export function getVerifyEmailHref(email: string): string {
  return `${VERIFY_EMAIL_PATH}?${new URLSearchParams({ email })}`;
}

export function getResetPasswordHref(email: string): string {
  return `${RESET_PASSWORD_PATH}?${new URLSearchParams({ email })}`;
}
