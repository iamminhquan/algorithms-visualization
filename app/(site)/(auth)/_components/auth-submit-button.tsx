type AuthSubmitButtonProps = {
  label: string;
};

/*
 * Chưa có xử lý đăng nhập nên nút là `type="button"`: form không gửi đi, tránh việc trình duyệt
 * gửi GET và đưa mật khẩu lên URL.
 */
export function AuthSubmitButton({ label }: AuthSubmitButtonProps) {
  return (
    <button
      type="button"
      className="mt-2 inline-flex h-11 items-center justify-center rounded-lg bg-accent-default px-5 text-sm font-medium text-accent-on transition-colors hover:bg-accent-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-default"
    >
      {label}
    </button>
  );
}
