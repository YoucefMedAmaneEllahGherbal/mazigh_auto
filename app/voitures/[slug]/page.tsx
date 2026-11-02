import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { VehicleGallery } from "@/app/components/VehicleGallery";
import { CarImage } from "@/app/components/CarImage";
import { getPublicVehicleBySlug, getPublicVehicles } from "@/app/data/vehicles.server";
import { VehicleAvailabilityState } from "@/app/components/VehicleAvailabilityState";
import { formatPriceDZD, formatKm, STATUS_LABELS } from "@/app/data/cars";
import { Logo } from "@/app/components/Logo";
import { SHOWROOM_CONFIG, buildCarWhatsAppUrl, buildGenericWhatsAppUrl } from "@/lib/config";
import { MessageCircle, Phone, CheckCircle2, Sparkles, Check, FileText } from "lucide-react";

type CarDetailPageProps = {
  params: Promise<{ slug: string }>;
};

export const instant = false;

export async function generateMetadata({ params }: CarDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const result = await getPublicVehicleBySlug(slug);
  const car = result.data;

  if (!car) {
    return { title: "Véhicule | MAZIGH AUTO" };
  }

  const carName = `${car.marque} ${car.modele} ${car.annee}`;
  const priceFormatted = formatPriceDZD(car.prix);
  const coverImage = car.cover_image_url || car.images[0]?.url;

  return {
    title: `${carName} à ${priceFormatted} | MAZIGH AUTO`,
    description: car.description || `Découvrez ce véhicule ${carName} au Showroom Kecherid Auto, El Khroub, Constantine.`,
    openGraph: {
      title: `${carName} - ${priceFormatted} | MAZIGH AUTO`,
      description: car.description || `${car.carburant} • ${car.boite} • ${formatKm(car.kilometrage)}`,
      images: coverImage ? [{ url: coverImage }] : [],
    },
  };
}

export default async function CarDetailPage({ params }: CarDetailPageProps) {
  const { slug } = await params;
  const [result, allResult] = await Promise.all([
    getPublicVehicleBySlug(slug),
    getPublicVehicles(),
  ]);

  if (result.error || allResult.error) {
    return (
      <main className="page-shell min-h-screen flex items-center justify-center px-4">
        <VehicleAvailabilityState status="error" />
      </main>
    );
  }

  if (!result.data) {
    if (allResult.data.length === 0) {
      return (
        <main className="page-shell min-h-screen flex items-center justify-center px-4">
          <VehicleAvailabilityState status="empty" />
        </main>
      );
    }

    notFound();
  }

  const car = result.data;
  // Load related cars
  const relatedCars = allResult.data
    .filter((c) => c.id !== car.id && (c.marque === car.marque || c.type_carrosserie === car.type_carrosserie))
    .slice(0, 3);

  const badge = STATUS_LABELS[car.statut] || STATUS_LABELS.disponible;
  const whatsappUrl = buildCarWhatsAppUrl(car);

  return (
    <main className="page-shell pb-24 md:pb-16">
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

      {/* Main Content */}
      <section className="inventory-section pt-6">
        <div className="content-width space-y-8">
          {/* Breadcrumbs */}
          <nav aria-label="Fil d'ariane" className="flex items-center gap-2 text-xs text-gray-400">
            <Link href="/" className="hover:text-white">Accueil</Link>
            <span>/</span>
            <Link href="/voitures" className="hover:text-white">Véhicules</Link>
            <span>/</span>
            <span className="text-white font-medium">{car.marque} {car.modele}</span>
          </nav>

          {/* Top layout: Gallery + Summary side card */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Gallery (Left Column) */}
            <div className="lg:col-span-7 space-y-4">
              <VehicleGallery
                images={car.images}
                vehicleName={`${car.marque} ${car.modele} ${car.annee}`}
              />
            </div>

            {/* Quick Summary Card (Right Column) */}
            <div className="lg:col-span-5 bg-[#141414] border border-[#262626] rounded-2xl p-6 shadow-xl space-y-6">
              <div>
                <div className="flex items-center justify-between gap-2">
                  <span className={`text-xs font-bold px-3 py-1 rounded-full ${badge.className}`}>
                    {badge.label}
                  </span>
                  <span className="text-xs text-gray-400">Réf: {car.id.substring(0, 8)}</span>
                </div>

                <h1 className="text-2xl sm:text-3xl font-black text-white mt-3 leading-tight">
                  {car.marque} {car.modele}
                </h1>
                {car.version && (
                  <p className="text-sm font-semibold text-[var(--primary)] mt-1">{car.version}</p>
                )}
              </div>

              {/* Price Banner */}
              <div className="p-4 bg-[#1A1A1A] rounded-xl border border-[#333] flex items-baseline justify-between">
                <div>
                  <span className="text-xs text-gray-400 uppercase font-semibold block">Prix de vente</span>
                  <span className="text-3xl font-black text-[var(--primary)]">
                    {formatPriceDZD(car.prix)}
                  </span>
                </div>
                {car.negotiable && (
                  <span className="text-xs font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-2.5 py-1 rounded-full">
                    Négociable
                  </span>
                )}
              </div>

              {/* Key Highlights Grid */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-[#1A1A1A] rounded-lg border border-[#262626]">
                  <span className="text-gray-400 block mb-0.5">Année</span>
                  <strong className="text-white text-sm">{car.annee}</strong>
                </div>
                <div className="p-3 bg-[#1A1A1A] rounded-lg border border-[#262626]">
                  <span className="text-gray-400 block mb-0.5">Kilométrage</span>
                  <strong className="text-white text-sm">{formatKm(car.kilometrage)}</strong>
                </div>
                <div className="p-3 bg-[#1A1A1A] rounded-lg border border-[#262626]">
                  <span className="text-gray-400 block mb-0.5">Carburant</span>
                  <strong className="text-white text-sm">{car.carburant}</strong>
                </div>
                <div className="p-3 bg-[#1A1A1A] rounded-lg border border-[#262626]">
                  <span className="text-gray-400 block mb-0.5">Boîte</span>
                  <strong className="text-white text-sm">{car.boite}</strong>
                </div>
              </div>

              {/* CTA Buttons */}
              <div className="space-y-3 pt-2">
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="whatsapp-button w-full text-center !py-3.5 !text-sm flex items-center justify-center gap-2 shadow-lg"
                >
                  <MessageCircle className="w-5 h-5" />
                  <span>Contacter sur WhatsApp</span>
                </a>

                <a
                  href={`tel:${SHOWROOM_CONFIG.phoneRaw}`}
                  className="secondary-button w-full text-center !py-3 !text-sm flex items-center justify-center gap-2"
                >
                  <Phone className="w-4 h-4" />
                  <span>Appeler ({SHOWROOM_CONFIG.phoneDisplay})</span>
                </a>
              </div>

              <p className="text-[11px] text-gray-500 text-center">
                Showroom situé à El Khroub, Constantine. Véhicule visible sur place 6j/7.
              </p>
            </div>
          </div>

          {/* Full Specifications Table */}
          <div className="bg-[#141414] border border-[#262626] rounded-2xl p-6 sm:p-8 shadow-xl space-y-6">
            <h2 className="text-xl font-bold text-white border-b border-[#262626] pb-3 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-[var(--primary)]" /> Caractéristiques Complètes
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-y-4 gap-x-8 text-sm">
              <div className="flex justify-between py-2 border-b border-[#222]">
                <span className="text-gray-400">Marque</span>
                <strong className="text-white">{car.marque}</strong>
              </div>
              <div className="flex justify-between py-2 border-b border-[#222]">
                <span className="text-gray-400">Modèle</span>
                <strong className="text-white">{car.modele}</strong>
              </div>
              {car.version && (
                <div className="flex justify-between py-2 border-b border-[#222]">
                  <span className="text-gray-400">Version / Finition</span>
                  <strong className="text-white">{car.version}</strong>
                </div>
              )}
              <div className="flex justify-between py-2 border-b border-[#222]">
                <span className="text-gray-400">Année</span>
                <strong className="text-white">{car.annee}</strong>
              </div>
              <div className="flex justify-between py-2 border-b border-[#222]">
                <span className="text-gray-400">Kilométrage</span>
                <strong className="text-white">{formatKm(car.kilometrage)}</strong>
              </div>
              <div className="flex justify-between py-2 border-b border-[#222]">
                <span className="text-gray-400">Carburant</span>
                <strong className="text-white">{car.carburant}</strong>
              </div>
              <div className="flex justify-between py-2 border-b border-[#222]">
                <span className="text-gray-400">Boîte de vitesses</span>
                <strong className="text-white">{car.boite}</strong>
              </div>
              {car.moteur && (
                <div className="flex justify-between py-2 border-b border-[#222]">
                  <span className="text-gray-400">Motorisation</span>
                  <strong className="text-white">{car.moteur}</strong>
                </div>
              )}
              {car.cylindree && (
                <div className="flex justify-between py-2 border-b border-[#222]">
                  <span className="text-gray-400">Cylindrée</span>
                  <strong className="text-white">{car.cylindree}</strong>
                </div>
              )}
              {car.puissance && (
                <div className="flex justify-between py-2 border-b border-[#222]">
                  <span className="text-gray-400">Puissance</span>
                  <strong className="text-white">{car.puissance}</strong>
                </div>
              )}
              {car.couleur && (
                <div className="flex justify-between py-2 border-b border-[#222]">
                  <span className="text-gray-400">Couleur</span>
                  <strong className="text-white">{car.couleur}</strong>
                </div>
              )}
              <div className="flex justify-between py-2 border-b border-[#222]">
                <span className="text-gray-400">Carrosserie</span>
                <strong className="text-white">{car.type_carrosserie}</strong>
              </div>
              <div className="flex justify-between py-2 border-b border-[#222]">
                <span className="text-gray-400">État du véhicule</span>
                <strong className="text-white">{car.etat}</strong>
              </div>
              {car.papiers && (
                <div className="flex justify-between py-2 border-b border-[#222]">
                  <span className="text-gray-400">Papiers administratifs</span>
                  <strong className="text-white">{car.papiers}</strong>
                </div>
              )}
              <div className="flex justify-between py-2 border-b border-[#222]">
                <span className="text-gray-400">Statut showroom</span>
                <strong className="text-white capitalize">{car.statut}</strong>
              </div>
            </div>
          </div>

          {/* Options & Features */}
          {car.options && car.options.length > 0 && (
            <div className="bg-[#141414] border border-[#262626] rounded-2xl p-6 sm:p-8 shadow-xl space-y-4">
              <h2 className="text-xl font-bold text-white border-b border-[#262626] pb-3 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[var(--primary)]" /> Équipements & Options Inclus
              </h2>
              <div className="flex flex-wrap gap-2 pt-2">
                {car.options.map((opt) => (
                  <span
                    key={opt}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold bg-[#1F1F1F] text-gray-200 border border-[#333] px-3.5 py-1.5 rounded-full"
                  >
                    <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>{opt}</span>
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Detailed Description & Defects/Accidents Section */}
          <div className="bg-[#141414] border border-[#262626] rounded-2xl p-6 sm:p-8 shadow-xl space-y-4">
            <h2 className="text-xl font-bold text-white border-b border-[#262626] pb-3 flex items-center gap-2">
              <FileText className="w-5 h-5 text-[var(--primary)]" /> Remarques sur l&apos;État & Description
            </h2>
            <div className="p-4 bg-[#1A1A1A] border-l-4 border-[var(--primary)] rounded-r-xl">
              <p className="text-sm text-gray-200 whitespace-pre-line leading-relaxed">
                {car.description || "Aucune remarque spécifique. Véhicule en excellent état général."}
              </p>
            </div>
          </div>

          {/* Related Cars */}
          {relatedCars.length > 0 && (
            <div className="space-y-4 pt-6">
              <h3 className="text-2xl font-bold text-white">Véhicules Similaires au Showroom</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {relatedCars.map((rc) => {
                  const cover = rc.cover_image_url || rc.images[0]?.url;
                  return (
                    <Link
                      key={rc.id}
                      href={`/voitures/${rc.slug || rc.id}`}
                      className="bg-[#141414] border border-[#262626] rounded-xl overflow-hidden group hover:border-[var(--primary)] transition-colors"
                    >
                      <div className="aspect-video relative bg-black overflow-hidden">
                        <CarImage
                          src={cover}
                          alt={`${rc.marque} ${rc.modele}`}
                          fill
                          sizes="(max-width: 768px) 100vw, 33vw"
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                      <div className="p-4">
                        <div className="font-bold text-white">{rc.marque} {rc.modele}</div>
                        <div className="text-xs text-gray-400 mt-0.5">{rc.annee} • {formatKm(rc.kilometrage)}</div>
                        <div className="text-[var(--primary)] font-extrabold text-base mt-2">
                          {formatPriceDZD(rc.prix)}
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Sticky Bottom Bar on Mobile */}
      <aside aria-label="Action rapide contact" className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0A0A0A]/95 backdrop-blur-md border-t border-[#262626] p-3 px-4 shadow-2xl flex items-center justify-between gap-3">
        <div>
          <span className="block text-[10px] text-gray-400 uppercase font-semibold">Prix de vente</span>
          <span className="text-lg font-black text-[var(--primary)] leading-none">
            {formatPriceDZD(car.prix)}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <a
            href={`tel:${SHOWROOM_CONFIG.phoneRaw}`}
            className="secondary-button !py-2.5 !px-3 text-xs flex items-center gap-1.5"
            title="Appeler le showroom"
          >
            <Phone className="w-3.5 h-3.5" />
            <span>Appeler</span>
          </a>
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noreferrer"
            className="whatsapp-button !py-2.5 !px-4 text-xs font-bold flex items-center gap-1.5"
          >
            <MessageCircle className="w-3.5 h-3.5" />
            <span>WhatsApp</span>
          </a>
        </div>
      </aside>

      {/* Footer */}
      <footer className="site-footer mt-16">
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
