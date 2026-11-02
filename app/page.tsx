import Link from "next/link";
import { CarImage } from "./components/CarImage";
import { getPublicVehicles } from "./data/vehicles.server";
import { formatPriceDZD, formatKm, STATUS_LABELS } from "./data/cars";
import { SHOWROOM_CONFIG, buildCarWhatsAppUrl, buildGenericWhatsAppUrl } from "@/lib/config";
import { Logo } from "./components/Logo";
import { MessageCircle } from "lucide-react";
import { VehicleAvailabilityState } from "./components/VehicleAvailabilityState";

const reasons = [
  {
    title: "Achat, Vente & Reprise",
    text: "Nous rachetons, vendons et échangeons vos véhicules au meilleur prix du marché, avec une estimation juste et rapide.",
  },
  {
    title: "Véhicules Sélectionnés & Vérifiés",
    text: "Chaque voiture proposée au showroom fait l'objet d'un contrôle rigoureux de son état mécanique, carrosserie et papiers.",
  },
  {
    title: "Transparence & Accompagnement",
    text: "Papiers en règle (carte grise, safia), historique limpide et assistance personnalisée jusqu'à la finalisation de votre transaction.",
  },
] as const;

export const instant = false;

export default async function Home() {
  const result = await getPublicVehicles();
  const cars = result.data ?? [];
  const featuredCars = cars.filter((c) => c.is_featured).slice(0, 3);
  const displayCars = featuredCars.length > 0 ? featuredCars : cars.slice(0, 3);

  return (
    <div className="page-shell">
      {/* Header */}
      <header className="site-header">
        <div className="content-width header-inner">
          <Logo href="/" size="md" />

          <nav className="main-nav" aria-label="Navigation principale">
            <Link href="/">Accueil</Link>
            <Link href="/voitures">Véhicules</Link>
            <Link href="/vendre-echanger">Vendre / Échanger</Link>
            <Link href="/contact">Contact</Link>
          </nav>

          <div className="flex items-center gap-3">
            <a
              className="whatsapp-button flex items-center gap-1.5"
              href={buildGenericWhatsAppUrl()}
              target="_blank"
              rel="noreferrer"
            >
              <MessageCircle className="w-4 h-4" />
              <span>WhatsApp</span>
            </a>
          </div>
        </div>
      </header>

      <main id="top">
        {/* Hero Section */}
        <section className="hero-section">
          <div className="content-width hero-layout">
            <div className="hero-copy">
              <p className="eyebrow">{SHOWROOM_CONFIG.city} • Algérie</p>
              <h1>{SHOWROOM_CONFIG.tagline}</h1>
              <p className="lead">
                Bienvenue chez <strong className="text-white">MAZIGH AUTO</strong> (Showroom Kecherid Auto). 
                Découvrez notre sélection de véhicules neufs et d&apos;occasion contrôlés, disponibles immédiatement à El Khroub, Constantine.
              </p>

              <div className="cta-row">
                <Link href="/voitures" className="primary-button">
                  Voir tout le catalogue
                </Link>
                <Link href="/vendre-echanger" className="secondary-button">
                  Vendre ou Échanger ma voiture
                </Link>
              </div>

              <ul className="hero-metrics" aria-label="Informations du showroom">
                <li>
                  <strong>{cars.length}+</strong>
                  <span>Véhicules au parc</span>
                </li>
                <li>
                  <strong>100%</strong>
                  <span>Papiers garantis</span>
                </li>
                <li>
                  <strong>24/7</strong>
                  <span>Contact WhatsApp</span>
                </li>
              </ul>
            </div>

            <div className="hero-spotlight" aria-label="Sélection vedette">
              {result.error ? (
                <VehicleAvailabilityState status="error" />
              ) : displayCars[0] ? (
                <div className="spotlight-card">
                  <p className="spotlight-label">Véhicule Vedette</p>
                  <h2>{displayCars[0].marque} {displayCars[0].modele}</h2>
                  <p className="spotlight-meta">
                    {displayCars[0].annee} • {formatKm(displayCars[0].kilometrage)} • {displayCars[0].carburant}
                  </p>
                  <div className="spotlight-price-row">
                    <span>Prix :</span>
                    <strong>{formatPriceDZD(displayCars[0].prix)}</strong>
                  </div>
                  <div className="mt-4">
                    <Link
                      href={`/voitures/${displayCars[0].slug || displayCars[0].id}`}
                      className="primary-button w-full text-center text-sm"
                    >
                      Consulter la fiche
                    </Link>
                  </div>
                </div>
              ) : (
                <VehicleAvailabilityState status="empty" />
              )}
            </div>
          </div>
        </section>

        {/* Featured Vehicles */}
        {cars.length > 0 && (
        <section id="vehicules" className="inventory-section">
          <div className="content-width">
            <div className="section-heading flex items-center justify-between flex-wrap gap-4">
              <div>
                <p className="eyebrow">Nos Véhicules Récents</p>
                <h2>Disponibles au Showroom</h2>
              </div>
              <Link href="/voitures" className="primary-button text-sm">
                Voir toutes les voitures ({cars.length}) →
              </Link>
            </div>

            <div className="vehicle-grid">
              {displayCars.map((car, index) => {
                const cover = car.cover_image_url || car.images[0]?.url;
                const badge = STATUS_LABELS[car.statut] || STATUS_LABELS.disponible;
                return (
                  <article key={car.id} className="vehicle-card vehicle-card-link">
                    <div className="relative h-56 w-full overflow-hidden bg-black">
                      <Link href={`/voitures/${car.slug || car.id}`}>
                        <CarImage
                          src={cover}
                          alt={`${car.marque} ${car.modele} à El Khroub`}
                          fill
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                          priority={index === 0}
                          loading={index === 0 ? "eager" : "lazy"}
                          className="object-cover transition-transform duration-300 hover:scale-105"
                        />
                      </Link>
                      <span className={`absolute top-3 right-3 text-xs font-bold px-2.5 py-1 rounded-full shadow z-10 ${badge.className}`}>
                        {badge.label}
                      </span>
                    </div>

                    <div className="vehicle-body">
                      <div className="vehicle-header-row">
                        <div>
                          <p className="vehicle-model">
                            {car.marque} {car.modele}
                          </p>
                          <p className="vehicle-year">{car.version ? `${car.version} • ` : ""}{car.annee}</p>
                        </div>
                        <span className="vehicle-price">{formatPriceDZD(car.prix)}</span>
                      </div>

                      <dl className="vehicle-specs" aria-label={`Détails ${car.marque} ${car.modele}`}>
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

                      <div className="mt-4 pt-3 border-t border-[var(--border)] flex items-center justify-between gap-2">
                        <Link
                          href={`/voitures/${car.slug || car.id}`}
                          className="text-sm font-semibold text-white hover:text-[var(--primary)] transition-colors"
                        >
                          Détails du véhicule
                        </Link>
                        <a
                          href={buildCarWhatsAppUrl(car)}
                          target="_blank"
                          rel="noreferrer"
                          className="whatsapp-button !py-2 !px-3 !text-xs flex items-center gap-1.5"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                          <span>WhatsApp</span>
                        </a>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </section>
        )}

        {/* Trade-in / Sell CTA */}
        <section className="inventory-section bg-[var(--background-soft)] border-y border-[var(--border)]">
          <div className="content-width flex flex-col md:flex-row items-center justify-between gap-8 py-4">
            <div className="max-w-xl">
              <p className="eyebrow">Service Rapide</p>
              <h2 className="text-2xl md:text-3xl font-extrabold text-white mt-1">
                Vous voulez Vendre ou Échanger votre voiture ?
              </h2>
              <p className="text-[var(--muted)] mt-2">
                Nous étudions toute proposition d&apos;achat cash ou d&apos;échange à El Khroub. Envoyez-nous les détails de votre véhicule pour une réponse immédiate.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
              <Link href="/vendre-echanger" className="primary-button text-center">
                Estimer mon véhicule
              </Link>
              <a
                href={buildGenericWhatsAppUrl("Bonjour MAZIGH AUTO, je souhaite avoir une estimation pour vendre/échanger mon véhicule.")}
                target="_blank"
                rel="noreferrer"
                className="whatsapp-button text-center"
              >
                Discuter sur WhatsApp
              </a>
            </div>
          </div>
        </section>

        {/* Why choose us */}
        <section id="about" className="trust-section">
          <div className="content-width">
            <div className="section-heading narrow-heading">
              <p className="eyebrow">Pourquoi Mazigh Auto</p>
              <h2>Le spécialiste de la voiture à El Khroub, Constantine.</h2>
            </div>

            <div className="reasons-grid">
              {reasons.map((reason, index) => (
                <article key={reason.title} className="reason-card">
                  <div className="reason-icon" aria-hidden="true">
                    0{index + 1}
                  </div>
                  <h3>{reason.title}</h3>
                  <p>{reason.text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Contact & Map Section */}
        <section id="contact" className="contact-section">
          <div className="content-width contact-panel">
            <div>
              <p className="eyebrow">Localisation & Contact</p>
              <h2>Rendez-nous visite au Showroom</h2>
              <p className="contact-copy">
                Notre équipe vous accueille à El Khroub pour vous conseiller et vous accompagner dans l&apos;achat ou la vente de votre prochain véhicule.
              </p>

              <div className="contact-card mt-6">
                <p>Téléphone & WhatsApp</p>
                <a href={`tel:${SHOWROOM_CONFIG.phoneRaw}`} className="text-lg font-bold text-white hover:text-[var(--primary)]">
                  {SHOWROOM_CONFIG.phoneDisplay}
                </a>

                <p className="mt-3">Adresse Showroom</p>
                <span>{SHOWROOM_CONFIG.fullAddress}</span>

                <p className="mt-3">TikTok Officiel</p>
                <a
                  href={SHOWROOM_CONFIG.tiktokUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-white hover:text-[var(--primary)] underline font-medium"
                >
                  @{SHOWROOM_CONFIG.tiktokName}
                </a>
              </div>
            </div>

            <div className="w-full h-80 rounded-2xl overflow-hidden border border-[var(--border)] shadow-xl">
              <iframe
                title="Google Maps Mazigh Auto El Khroub"
                src={SHOWROOM_CONFIG.googleMapsEmbedUrl}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen={false}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="site-footer">
        <div className="content-width footer-inner">
          <div>
            <Logo href="/" size="md" />
            <p className="footer-tagline mt-2">{SHOWROOM_CONFIG.tagline}</p>
            <p className="text-xs text-[var(--muted)] mt-1">{SHOWROOM_CONFIG.fullAddress}</p>
          </div>

          <nav className="footer-nav" aria-label="Navigation pied de page">
            <Link href="/">Accueil</Link>
            <Link href="/voitures">Véhicules</Link>
            <Link href="/vendre-echanger">Vendre / Échanger</Link>
            <Link href="/contact">Contact</Link>
            <Link href="/admin">Espace Admin</Link>
          </nav>

          <div className="footer-contact">
            <a href={`tel:${SHOWROOM_CONFIG.phoneRaw}`}>{SHOWROOM_CONFIG.phoneDisplay}</a>
            <a href={SHOWROOM_CONFIG.tiktokUrl} target="_blank" rel="noreferrer">
              TikTok : @{SHOWROOM_CONFIG.tiktokName}
            </a>
            <p className="text-xs text-[var(--muted)]">© {SHOWROOM_CONFIG.copyrightYear} Mazigh Auto - Showroom Kecherid Auto.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
