import { Suspense } from "react";
import Link from "next/link";
import { getPublicVehicles } from "@/app/data/vehicles.server";
import { CarsCatalogClient } from "./CarsCatalogClient";
import { Logo } from "@/app/components/Logo";
import { VehicleAvailabilityState } from "@/app/components/VehicleAvailabilityState";
import { SHOWROOM_CONFIG, buildGenericWhatsAppUrl } from "@/lib/config";

export const metadata = {
  title: "Catalogue des Véhicules | MAZIGH AUTO - El Khroub, Constantine",
  description:
    "Découvrez notre stock de voitures disponibles à la vente et à l'échange chez Mazigh Auto (Showroom Kecherid Auto) à El Khroub, Constantine.",
};

export const instant = false;

export default async function VoituresCataloguePage() {
  const result = await getPublicVehicles();

  return (
    <main className="page-shell">
      {/* Header */}
      <header className="site-header">
        <div className="content-width header-inner">
          <Logo href="/" size="md" />

          <nav className="main-nav" aria-label="Navigation principale">
            <Link href="/">Accueil</Link>
            <Link href="/voitures" className="text-[var(--primary)] font-bold">
              Véhicules
            </Link>
            <Link href="/vendre-echanger">Vendre / Échanger</Link>
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

      {/* Hero / Header Section */}
      <section className="inventory-section pt-8 pb-16">
        <div className="content-width">
          <div className="mb-8">
            <p className="eyebrow">{SHOWROOM_CONFIG.city} • Parc Automobile</p>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white mt-1">
              Nos Véhicules Disponibles
            </h1>
            <p className="text-sm sm:text-base text-[var(--muted)] mt-1.5 max-w-2xl">
              Consultez notre sélection de véhicules neufs et d&apos;occasion révisés. Contactez-nous directement sur WhatsApp pour vérifier la disponibilité ou réserver un essai.
            </p>
          </div>

          {result.error ? (
            <VehicleAvailabilityState status="error" />
          ) : result.data.length === 0 ? (
            <VehicleAvailabilityState status="empty" />
          ) : (
            <Suspense fallback={<p className="text-gray-400">Chargement des véhicules...</p>}>
              <CarsCatalogClient initialCars={result.data} />
            </Suspense>
          )}
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
