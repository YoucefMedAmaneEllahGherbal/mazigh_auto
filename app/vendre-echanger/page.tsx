import Link from "next/link";
import { Logo } from "@/app/components/Logo";
import { TradeInFormClient } from "./TradeInFormClient";
import { SHOWROOM_CONFIG, buildGenericWhatsAppUrl } from "@/lib/config";

export const metadata = {
  title: "Vendre ou Échanger ma voiture | MAZIGH AUTO - El Khroub, Constantine",
  description:
    "Faites estimer votre véhicule pour un rachat cash rapide ou un échange chez Mazigh Auto (Showroom Kecherid Auto) à El Khroub, Constantine.",
};

export default function VendreEchangerPage() {
  return (
    <main className="page-shell">
      {/* Header */}
      <header className="site-header">
        <div className="content-width header-inner">
          <Logo href="/" size="md" />

          <nav className="main-nav" aria-label="Navigation principale">
            <Link href="/">Accueil</Link>
            <Link href="/voitures">Véhicules</Link>
            <Link href="/vendre-echanger" className="text-[var(--primary)] font-bold">
              Vendre / Échanger
            </Link>
            <Link href="/contact">Contact</Link>
          </nav>

          <a
            className="whatsapp-button"
            href={buildGenericWhatsAppUrl()}
            target="_blank"
            rel="noreferrer"
          >
            WhatsApp
          </a>
        </div>
      </header>

      {/* Main Section */}
      <section className="inventory-section pt-8 pb-16">
        <div className="content-width max-w-4xl space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <p className="eyebrow">{SHOWROOM_CONFIG.city}</p>
            <h1 className="text-3xl sm:text-4xl font-black text-white">
              Vendez ou Échangez Votre Voiture
            </h1>
            <p className="text-sm sm:text-base text-[var(--muted)]">
              Remplissez les informations de votre véhicule. Notre équipe vous recontacte immédiatement sur WhatsApp avec une estimation claire et une offre concrète.
            </p>
          </div>

          <TradeInFormClient />
        </div>
      </section>

      {/* Footer */}
      <footer className="site-footer">
        <div className="content-width footer-inner">
          <div>
            <Logo href="/" size="md" />
            <p className="footer-tagline mt-2">{SHOWROOM_CONFIG.tagline}</p>
            <p className="text-xs text-[var(--muted)] mt-1">{SHOWROOM_CONFIG.fullAddress}</p>
          </div>

          <nav className="footer-nav">
            <Link href="/">Accueil</Link>
            <Link href="/voitures">Véhicules</Link>
            <Link href="/vendre-echanger">Vendre / Échanger</Link>
            <Link href="/contact">Contact</Link>
            <Link href="/admin">Administration</Link>
          </nav>

          <div className="footer-contact">
            <a href={`tel:${SHOWROOM_CONFIG.phoneRaw}`}>{SHOWROOM_CONFIG.phoneDisplay}</a>
            <p className="text-xs text-[var(--muted)]">© {SHOWROOM_CONFIG.copyrightYear} Mazigh Auto.</p>
          </div>
        </div>
      </footer>
    </main>
  );
}
