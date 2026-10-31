import { SiteHeader } from "../_components/header/site-header";
import { SiteFooter } from "../_components/site-footer";

export default function SiteLayout({ children }: LayoutProps<"/">) {
  return (
    <>
      <SiteHeader />
      {children}
      <SiteFooter />
    </>
  );
}
