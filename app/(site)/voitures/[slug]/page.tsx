import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { VehicleGallery } from "@/app/components/VehicleGallery";
import { getPublicVehicleBySlug, getPublicVehicles } from "@/app/data/vehicles.server";
import { VehicleAvailabilityState } from "@/app/components/VehicleAvailabilityState";
import { formatPriceDZD, formatKm, STATUS_LABELS } from "@/app/data/cars";
import { SHOWROOM_CONFIG, buildCarWhatsAppUrl } from "@/lib/config";
import { VehicleCard } from "@/app/components/site/VehicleCard";
import { MessageCircle, Phone, ListChecks, Sparkles, Check, FileText } from "lucide-react";

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
      <main className="section is-page">
        <div className="content-width">
          <VehicleAvailabilityState status="error" />
        </div>
      </main>
    );
  }

  if (!result.data) {
    if (allResult.data.length === 0) {
      return (
        <main className="section is-page">
          <div className="content-width">
            <VehicleAvailabilityState status="empty" />
          </div>
        </main>
      );
    }

    notFound();
  }

  const car = result.data;
  const relatedCars = allResult.data
    .filter((c) => c.id !== car.id && (c.marque === car.marque || c.type_carrosserie === car.type_carrosserie))
    .slice(0, 3);

  const badge = STATUS_LABELS[car.statut] || STATUS_LABELS.disponible;
  const whatsappUrl = buildCarWhatsAppUrl(car);

  const specs: [string, string | number | undefined | null][] = [
    ["Marque", car.marque],
    ["Modèle", car.modele],
    ["Version / Finition", car.version],
    ["Année", car.annee],
    ["Kilométrage", formatKm(car.kilometrage)],
    ["Carburant", car.carburant],
    ["Boîte de vitesses", car.boite],
    ["Motorisation", car.moteur],
    ["Cylindrée", car.cylindree],
    ["Puissance", car.puissance],
    ["Couleur", car.couleur],
    ["Carrosserie", car.type_carrosserie],
    ["État", car.etat],
    ["Papiers", car.papiers],
    ["Statut", badge.label],
  ];

  return (
    <main className="section is-page detail-page">
      <div className="content-width space-y-8">
        <nav aria-label="Fil d'ariane" className="breadcrumbs">
          <Link href="/">Accueil</Link>
          <span aria-hidden="true">/</span>
          <Link href="/voitures">Véhicules</Link>
          <span aria-hidden="true">/</span>
          <span aria-current="page">
            {car.marque} {car.modele}
          </span>
        </nav>

        <div className="detail-top">
          <div className="min-w-0">
            <VehicleGallery images={car.images} vehicleName={`${car.marque} ${car.modele} ${car.annee}`} />
          </div>

          <aside className="panel detail-summary">
            <div className="flex items-center justify-between gap-2">
              <span className={`status-badge ${badge.className}`}>{badge.label}</span>
              <span className="text-xs text-[var(--muted)]">Réf. {car.id.substring(0, 8)}</span>
            </div>

            <div>
              <h1>
                {car.marque} {car.modele}
              </h1>
              {car.version && <p className="detail-version">{car.version}</p>}
            </div>

            <div className="detail-price">
              <div>
                <span>Prix de vente</span>
                <strong>{formatPriceDZD(car.prix)}</strong>
              </div>
              {car.negotiable && <span className="tag is-success">Négociable</span>}
            </div>

            <dl className="detail-highlights">
              <div>
                <dt>Année</dt>
                <dd>{car.annee}</dd>
              </div>
              <div>
                <dt>Kilométrage</dt>
                <dd>{formatKm(car.kilometrage)}</dd>
              </div>
              <div>
                <dt>Carburant</dt>
                <dd>{car.carburant}</dd>
              </div>
              <div>
                <dt>Boîte</dt>
                <dd>{car.boite}</dd>
              </div>
            </dl>

            <div className="detail-actions">
              <a href={whatsappUrl} target="_blank" rel="noreferrer" className="whatsapp-button is-block">
                <MessageCircle className="h-5 w-5" aria-hidden="true" />
                Contacter sur WhatsApp
              </a>
              <a href={`tel:${SHOWROOM_CONFIG.phoneRaw}`} className="secondary-button is-block">
                <Phone className="h-4 w-4" aria-hidden="true" />
                Appeler le {SHOWROOM_CONFIG.phoneDisplay}
              </a>
            </div>

            <p className="detail-note">Showroom à El Khroub, Constantine. Véhicule visible sur place.</p>
          </aside>
        </div>

        <section className="panel" data-reveal>
          <h2 className="panel-title">
            <ListChecks className="h-5 w-5" aria-hidden="true" /> Caractéristiques complètes
          </h2>
          <dl className="spec-list">
            {specs
              .filter(([, value]) => value !== undefined && value !== null && value !== "")
              .map(([label, value]) => (
                <div key={label}>
                  <dt>{label}</dt>
                  <dd>{value}</dd>
                </div>
              ))}
          </dl>
        </section>

        {car.options && car.options.length > 0 && (
          <section className="panel" data-reveal>
            <h2 className="panel-title">
              <Sparkles className="h-5 w-5" aria-hidden="true" /> Équipements & options
            </h2>
            <ul className="chip-list">
              {car.options.map((opt) => (
                <li key={opt} className="chip">
                  <Check className="h-3.5 w-3.5 text-emerald-400" aria-hidden="true" />
                  {opt}
                </li>
              ))}
            </ul>
          </section>
        )}

        <section className="panel" data-reveal>
          <h2 className="panel-title">
            <FileText className="h-5 w-5" aria-hidden="true" /> État & description
          </h2>
          <p className="detail-description">
            {car.description || "Aucune remarque spécifique. Véhicule en excellent état général."}
          </p>
        </section>

        {relatedCars.length > 0 && (
          <section className="space-y-5 pt-4" data-reveal>
            <h2 className="section-subtitle">Véhicules similaires</h2>
            <div className="vehicle-grid">
              {relatedCars.map((rc) => (
                <VehicleCard key={rc.id} car={rc} compact />
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Sticky contact bar on mobile */}
      <aside aria-label="Action rapide contact" className="mobile-contact-bar">
        <div>
          <span>Prix</span>
          <strong>{formatPriceDZD(car.prix)}</strong>
        </div>
        <div className="flex items-center gap-2">
          <a href={`tel:${SHOWROOM_CONFIG.phoneRaw}`} className="secondary-button is-small" aria-label="Appeler le showroom">
            <Phone className="h-4 w-4" aria-hidden="true" />
          </a>
          <a href={whatsappUrl} target="_blank" rel="noreferrer" className="whatsapp-button is-small">
            <MessageCircle className="h-4 w-4" aria-hidden="true" />
            WhatsApp
          </a>
        </div>
      </aside>
    </main>
  );
}
