import type { ReactNode } from "react";
import { SiteHeader } from "@/app/components/site/SiteHeader";
import { SiteFooter } from "@/app/components/site/SiteFooter";
import { SmoothScroll } from "@/app/components/site/SmoothScroll";

export default function PublicSiteLayout({ children }: { children: ReactNode }) {
  return (
    <div className="site-shell">
      <SmoothScroll />
      <SiteHeader />
      <div className="site-main">{children}</div>
      <SiteFooter />
    </div>
  );
}
