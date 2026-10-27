import { Mail } from "lucide-react";
import Link from "next/link";
import { CATEGORIES } from "@/features/catalog/categories";
import { getCategoryHref } from "@/features/catalog/routes";
import { SITE_NAME } from "@/lib/site";
import { Logo } from "./logo";

interface IFooterColumn {
  readonly id: string;
  readonly title: string;
  readonly links: readonly { readonly label: string; readonly href: string }[];
}

const FOOTER_COLUMNS: readonly IFooterColumn[] = [
  {
    id: "footer-kham-pha",
    title: "Khám phá",
    links: CATEGORIES.map(({ name, slug }) => ({
      label: name,
      href: getCategoryHref(slug),
    })),
  },
  {
    id: "footer-tai-nguyen",
    title: "Tài nguyên",
    links: [
      { label: "Hướng dẫn sử dụng", href: "#" },
      { label: "Bảng độ phức tạp Big-O", href: "#" },
      { label: "Câu hỏi thường gặp", href: "#" },
    ],
  },
  {
    id: "footer-lien-he",
    title: "Liên hệ",
    links: [
      { label: "Email liên hệ", href: "#" },
      { label: "GitHub dự án", href: "#" },
      { label: "Gửi góp ý", href: "#" },
    ],
  },
];

const LEGAL_LINKS = [
  { label: "Điều khoản sử dụng", href: "#" },
  { label: "Chính sách bảo mật", href: "#" },
];

const LINK_CLASS_NAME =
  "rounded-sm text-text-muted transition-colors hover:text-text-inverse focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-default dark:text-text-secondary dark:hover:text-text-primary";

const SOCIAL_CLASS_NAME =
  "flex size-10 items-center justify-center rounded-full bg-text-inverse/10 text-text-muted transition-colors hover:text-text-inverse focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-default dark:bg-bg-subtle dark:text-text-secondary dark:hover:text-text-primary";

export function SiteFooter() {
  return (
    <footer className="bg-bg-inverse dark:border-t dark:border-border-default dark:bg-bg-surface">
      <div className="mx-auto flex max-w-360 flex-col gap-12 px-4 pt-18 pb-8 sm:px-8 lg:px-20">
        <div className="flex flex-col gap-10 lg:flex-row lg:gap-16">
          <div className="flex flex-col items-start gap-5 lg:w-90 lg:shrink-0">
            <Logo className="text-text-inverse dark:text-text-primary" />
            <p className="max-w-90 text-sm leading-5.5 text-text-muted dark:text-text-secondary">
              Nền tảng học thuật toán và cấu trúc dữ liệu qua mô phỏng trực
              quan, giúp bạn hiểu từng bước chạy thay vì chỉ đọc lý thuyết.
            </p>
            <div className="flex gap-3">
              <Link href="#" aria-label="GitHub" className={SOCIAL_CLASS_NAME}>
                <GithubIcon />
              </Link>
              <Link href="#" aria-label="Email" className={SOCIAL_CLASS_NAME}>
                <Mail aria-hidden="true" className="size-4.5" />
              </Link>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-x-8 gap-y-10 sm:grid-cols-3 lg:flex-1 lg:gap-16">
            {FOOTER_COLUMNS.map((column) => (
              <nav key={column.id} aria-labelledby={column.id}>
                <h2
                  id={column.id}
                  className="text-base font-semibold text-text-inverse dark:text-text-primary"
                >
                  {column.title}
                </h2>
                <ul className="mt-7.5 flex flex-col items-start gap-3.5 text-sm">
                  {column.links.map((link) => (
                    <li key={link.label}>
                      <Link href={link.href} className={LINK_CLASS_NAME}>
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            ))}
          </div>
        </div>
        <hr className="border-text-inverse/15 dark:border-border-default" />
        <div className="flex flex-col gap-3 text-xs text-text-muted sm:flex-row sm:items-center sm:justify-between dark:text-text-secondary">
          <p>© 2026 {SITE_NAME}. Xây dựng cho mục đích học tập.</p>
          <ul className="flex gap-6">
            {LEGAL_LINKS.map((link) => (
              <li key={link.label}>
                <Link href={link.href} className={LINK_CLASS_NAME}>
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
}

function GithubIcon() {
  return (
    <svg
      viewBox="0 0 18 18"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="size-4.5"
      aria-hidden="true"
    >
      <path d="M11.25 16.5V13.5C11.3543 12.5605 11.0849 11.6176 10.5 10.875C12.75 10.875 15 9.375 15 6.75C15.06 5.8125 14.7975 4.89 14.25 4.125C14.46 3.2625 14.46 2.3625 14.25 1.5C14.25 1.5 13.5 1.5 12 2.625C10.02 2.25 7.98 2.25 6 2.625C4.5 1.5 3.75 1.5 3.75 1.5C3.525 2.3625 3.525 3.2625 3.75 4.125C3.20391 4.88691 2.93885 5.81459 3 6.75C3 9.375 5.25 10.875 7.5 10.875C7.2075 11.2425 6.99 11.6625 6.8625 12.1125C6.735 12.5625 6.6975 13.035 6.75 13.5V16.5" />
      <path d="M6.75 13.5C3.3675 15 3 12 1.5 12" />
    </svg>
  );
}
