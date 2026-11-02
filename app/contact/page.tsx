import Link from "next/link";
import { Logo } from "@/app/components/Logo";
import { SHOWROOM_CONFIG, buildGenericWhatsAppUrl } from "@/lib/config";
import { Phone, MessageCircle, MapPin, Video, Map } from "lucide-react";

export const metadata = {
  title: "Contact & Localisation | MAZIGH AUTO - El Khroub, Constantine",
  description:
    "Visitez notre showroom automobile Mazigh Auto à El Khroub, Constantine. Téléphone, WhatsApp, plan d'accès Google Maps et réseaux sociaux.",
};

export default function ContactPage() {
  return (
    <main className="page-shell">
      {/* Header */}
      <header className="site-header">
        <div className="content-width header-inner">
          <Logo href="/" size="md" />

          <nav className="main-nav" aria-label="Navigation principale">
            <Link href="/">Accueil</Link>
            <Link href="/voitures">Véhicules</Link>
            <Link href="/vendre-echanger">Vendre / Échanger</Link>
            <Link href="/contact" className="text-[var(--primary)] font-bold">
              Contact
            </Link>
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

      {/* Content */}
      <section className="inventory-section pt-8 pb-16">
        <div className="content-width space-y-12">
          <div className="max-w-2xl">
            <p className="eyebrow">{SHOWROOM_CONFIG.city}</p>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white mt-1">
              Contactez Mazigh Auto
            </h1>
            <p className="text-sm sm:text-base text-[var(--muted)] mt-2">
              Une question sur un modèle ? Vous souhaitez visiter le showroom ou essayer une voiture ? Notre équipe est à votre disposition 6 jours sur 7.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
            {/* Contact Cards */}
            <div className="space-y-4">
              <div className="bg-[#141414] border border-[#262626] rounded-2xl p-6 shadow-xl flex items-start gap-4">
                <span className="p-3 bg-[#1F1F1F] rounded-xl text-[var(--primary)]">
                  <Phone className="w-6 h-6" />
                </span>
                <div>
                  <h3 className="text-sm font-bold text-gray-400 uppercase">Téléphone Direct</h3>
                  <a
                    href={`tel:${SHOWROOM_CONFIG.phoneRaw}`}
                    className="text-2xl font-black text-white hover:text-[var(--primary)] transition-colors block mt-1"
                  >
                    {SHOWROOM_CONFIG.phoneDisplay}
                  </a>
                  <p className="text-xs text-gray-400 mt-1">Appel téléphonique direct en Algérie</p>
                </div>
              </div>

              <div className="bg-[#141414] border border-[#262626] rounded-2xl p-6 shadow-xl flex items-start gap-4">
                <span className="p-3 bg-[#1F1F1F] rounded-xl text-emerald-400">
                  <MessageCircle className="w-6 h-6" />
                </span>
                <div className="flex-1">
                  <h3 className="text-sm font-bold text-gray-400 uppercase">WhatsApp Showroom</h3>
                  <p className="text-lg font-bold text-white mt-1">Chattez en direct avec le responsable</p>
                  <p className="text-xs text-gray-400 mt-1">Réponse rapide garantie</p>
                  <a
                    href={buildGenericWhatsAppUrl()}
                    target="_blank"
                    rel="noreferrer"
                    className="whatsapp-button !py-2.5 !px-4 !text-xs inline-flex items-center gap-1.5 mt-3"
                  >
                    <MessageCircle className="w-4 h-4" />
                    Ouvrir WhatsApp
                  </a>
                </div>
              </div>

              <div className="bg-[#141414] border border-[#262626] rounded-2xl p-6 shadow-xl flex items-start gap-4">
                <span className="p-3 bg-[#1F1F1F] rounded-xl text-[var(--primary)]">
                  <MapPin className="w-6 h-6" />
                </span>
                <div>
                  <h3 className="text-sm font-bold text-gray-400 uppercase">Adresse du Showroom</h3>
                  <p className="text-base font-bold text-white mt-1">{SHOWROOM_CONFIG.fullAddress}</p>
                  <p className="text-xs text-gray-400 mt-1">El Khroub, Wilaya de Constantine, Algérie</p>
                  <a
                    href={SHOWROOM_CONFIG.googleMapsUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-[var(--primary)] font-bold hover:underline inline-block mt-2"
                  >
                    Itinéraire Google Maps ↗
                  </a>
                </div>
              </div>

              <div className="bg-[#141414] border border-[#262626] rounded-2xl p-6 shadow-xl flex items-start gap-4">
                <span className="p-3 bg-[#1F1F1F] rounded-xl text-cyan-400">
                  <Video className="w-6 h-6" />
                </span>
                <div>
                  <h3 className="text-sm font-bold text-gray-400 uppercase">Réseaux Sociaux & TikTok</h3>
                  <p className="text-base font-bold text-white mt-1">TikTok officiel : @{SHOWROOM_CONFIG.tiktokName}</p>
                  <a
                    href={SHOWROOM_CONFIG.tiktokUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-[var(--primary)] font-bold hover:underline inline-block mt-2"
                  >
                    Suivre sur TikTok ↗
                  </a>
                </div>
              </div>
            </div>

            {/* Google Maps Container */}
            <div className="bg-[#141414] border border-[#262626] rounded-2xl overflow-hidden shadow-2xl h-full min-h-[420px] flex flex-col">
              <div className="p-4 bg-[#1A1A1A] border-b border-[#262626]">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Map className="w-4 h-4 text-[var(--primary)]" /> Plan d&apos;accès - El Khroub, Constantine
                </h3>
              </div>
              <div className="flex-1 w-full min-h-[360px]">
                <iframe
                  title="Google Maps Mazigh Auto El Khroub"
                  src={SHOWROOM_CONFIG.googleMapsEmbedUrl}
                  width="100%"
                  height="100%"
                  style={{ border: 0, minHeight: "360px" }}
                  allowFullScreen={false}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
            </div>
          </div>
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
