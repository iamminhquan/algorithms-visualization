import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { SITE_NAME } from "@/lib/site";
import { THEME_SCRIPT } from "@/lib/theme";
import { SiteFooter } from "./_components/site-footer";
import { SiteHeader } from "./_components/site-header";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: SITE_NAME,
    template: `%s | ${SITE_NAME}`,
  },
  description:
    "Nền tảng học thuật toán và cấu trúc dữ liệu qua mô phỏng trực quan.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="vi"
      data-scroll-behavior="smooth"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full scroll-smooth antialiased motion-reduce:scroll-auto`}
    >
      <head>
        {/*
         * `THEME_SCRIPT` đặt `data-theme` trên `<html>` trước khi React hydrate, nên `<html>` cần
         * `suppressHydrationWarning`.
         */}
        <script
          // biome-ignore lint/security/noDangerouslySetInnerHtml: chuỗi hằng trong lib/theme.ts, không có dữ liệu người dùng.
          dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }}
        />
      </head>
      <body className="min-h-full flex flex-col">
        <SiteHeader />
        {children}
        <SiteFooter />
      </body>
    </html>
  );
}
