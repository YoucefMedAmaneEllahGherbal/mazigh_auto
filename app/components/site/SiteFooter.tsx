import Link from "next/link";
import { Logo } from "@/app/components/Logo";
import { SHOWROOM_CONFIG } from "@/lib/config";
import { SITE_LINKS } from "./links";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="content-width footer-inner">
        <div className="footer-brand">
          <Logo href="/" size="md" />
          <p className="footer-tagline">{SHOWROOM_CONFIG.tagline}</p>
          <p className="footer-address">{SHOWROOM_CONFIG.fullAddress}</p>
        </div>

        <nav className="footer-nav" aria-label="Navigation pied de page">
          <p className="footer-title">Navigation</p>
          {SITE_LINKS.map((link) => (
            <Link key={link.href} href={link.href}>
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="footer-contact">
          <p className="footer-title">Contact</p>
          <a href={`tel:${SHOWROOM_CONFIG.phoneRaw}`}>{SHOWROOM_CONFIG.phoneDisplay}</a>
          <a href={SHOWROOM_CONFIG.tiktokUrl} target="_blank" rel="noreferrer">
            TikTok : @{SHOWROOM_CONFIG.tiktokName}
          </a>
          <a href={SHOWROOM_CONFIG.googleMapsUrl} target="_blank" rel="noreferrer">
            Itinéraire Google Maps
          </a>
        </div>
      </div>

      <div className="content-width footer-bottom">
        <p>
          © {SHOWROOM_CONFIG.copyrightYear} Mazigh Auto — {SHOWROOM_CONFIG.subtitle}
        </p>
        <Link href="/admin" className="footer-admin-link">
          Espace admin
        </Link>
      </div>
    </footer>
  );
}
