import Link from "next/link";
import { ArrowRight, MapPin, MessageCircle, Phone, Video } from "lucide-react";
import { CarImage } from "@/app/components/CarImage";
import { getPublicVehicles } from "@/app/data/vehicles.server";
import { formatKm, formatPriceDZD } from "@/app/data/cars";
import { SHOWROOM_CONFIG, buildGenericWhatsAppUrl } from "@/lib/config";
import { VehicleAvailabilityState } from "@/app/components/VehicleAvailabilityState";
import { VehicleCard } from "@/app/components/site/VehicleCard";
import { HeroStreaks } from "@/app/components/site/HeroStreaks";

const reasons = [
  {
    title: "Achat, vente & reprise",
    text: "Nous rachetons, vendons et échangeons vos véhicules au juste prix du marché, avec une estimation rapide.",
  },
  {
    title: "Véhicules contrôlés",
    text: "Chaque voiture du showroom est vérifiée : mécanique, carrosserie et papiers.",
  },
  {
    title: "Transparence totale",
    text: "Papiers en règle (carte grise, safia), historique clair et accompagnement jusqu'à la signature.",
  },
] as const;

export const instant = false;

export default async function Home() {
  const result = await getPublicVehicles();
  const cars = result.data ?? [];
  const featuredCars = cars.filter((c) => c.is_featured).slice(0, 3);
  const displayCars = featuredCars.length > 0 ? featuredCars : cars.slice(0, 3);
  const spotlight = displayCars[0];
  const spotlightCover = spotlight ? spotlight.cover_image_url || spotlight.images[0]?.url : null;

  return (
    <main id="top">
      {/* Hero */}
      <section className="hero-section">
        <HeroStreaks className="hero-canvas" />
        <div className="hero-vignette" aria-hidden="true" />

        <div className="content-width hero-layout">
          <div className="hero-copy">
            <p className="eyebrow">{SHOWROOM_CONFIG.city} • Algérie</p>
            <h1>
              Achat, vente <br className="hidden sm:block" />
              &amp; échange <span className="text-[var(--primary)]">de voitures.</span>
            </h1>
            <p className="lead">
              Bienvenue chez <strong>MAZIGH AUTO</strong> ({SHOWROOM_CONFIG.subtitle}). Des véhicules neufs et
              d&apos;occasion contrôlés, disponibles immédiatement à El Khroub.
            </p>

            <div className="cta-row">
              <Link href="/voitures" className="primary-button">
                Voir le catalogue
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
              <Link href="/vendre-echanger" className="secondary-button">
                Vendre ou échanger ma voiture
              </Link>
            </div>

            <ul className="hero-metrics" aria-label="Informations du showroom">
              <li>
                <strong>{cars.length}</strong>
                <span>Véhicules au parc</span>
              </li>
              <li>
                <strong>100%</strong>
                <span>Papiers en règle</span>
              </li>
              <li>
                <strong>24/7</strong>
                <span>Contact WhatsApp</span>
              </li>
            </ul>
          </div>

          <div className="hero-spotlight" aria-label="Véhicule vedette">
            {result.error ? (
              <VehicleAvailabilityState status="error" />
            ) : spotlight ? (
              <Link href={`/voitures/${spotlight.slug || spotlight.id}`} className="spotlight-card">
                <div className="spotlight-media">
                  <CarImage
                    src={spotlightCover}
                    alt={`${spotlight.marque} ${spotlight.modele}`}
                    fill
                    priority
                    sizes="(max-width: 900px) 100vw, 420px"
                    className="object-cover"
                  />
                  <span className="spotlight-label">Véhicule vedette</span>
                </div>
                <div className="spotlight-body">
                  <h2>
                    {spotlight.marque} {spotlight.modele}
                  </h2>
                  <p className="spotlight-meta">
                    {spotlight.annee} • {formatKm(spotlight.kilometrage)} • {spotlight.carburant}
                  </p>
                  <div className="spotlight-price-row">
                    <strong>{formatPriceDZD(spotlight.prix)}</strong>
                    <span className="spotlight-cta">
                      Voir la fiche <ArrowRight className="h-4 w-4" aria-hidden="true" />
                    </span>
                  </div>
                </div>
              </Link>
            ) : (
              <VehicleAvailabilityState status="empty" />
            )}
          </div>
        </div>
      </section>

      {/* Featured vehicles */}
      {displayCars.length > 0 && (
        <section id="vehicules" className="section">
          <div className="content-width">
            <div className="section-heading is-split" data-reveal>
              <div>
                <p className="eyebrow">Nos véhicules récents</p>
                <h2>Disponibles au showroom</h2>
              </div>
              <Link href="/voitures" className="secondary-button">
                Tout voir ({cars.length})
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>

            <div className="vehicle-grid">
              {displayCars.map((car, index) => (
                <div key={car.id} data-reveal data-reveal-delay={index + 1}>
                  <VehicleCard car={car} />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Sell / trade-in band */}
      <section className="section is-tight">
        <div className="content-width">
          <div className="cta-band" data-reveal>
            <div className="cta-band-copy">
              <p className="eyebrow">Service rapide</p>
              <h2>Vous voulez vendre ou échanger votre voiture&nbsp;?</h2>
              <p>
                Rachat cash ou échange à El Khroub. Envoyez-nous les détails de votre véhicule et recevez une
                réponse rapide.
              </p>
            </div>
            <div className="cta-band-actions">
              <Link href="/vendre-echanger" className="primary-button">
                Estimer mon véhicule
              </Link>
              <a
                href={buildGenericWhatsAppUrl(
                  "Bonjour MAZIGH AUTO, je souhaite avoir une estimation pour vendre/échanger mon véhicule.",
                )}
                target="_blank"
                rel="noreferrer"
                className="whatsapp-button"
              >
                <MessageCircle className="h-4 w-4" aria-hidden="true" />
                Discuter sur WhatsApp
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Why us */}
      <section id="about" className="section">
        <div className="content-width">
          <div className="section-heading" data-reveal>
            <p className="eyebrow">Pourquoi Mazigh Auto</p>
            <h2>Le spécialiste de la voiture à El Khroub, Constantine.</h2>
          </div>

          <div className="reasons-grid">
            {reasons.map((reason, index) => (
              <article key={reason.title} className="reason-card" data-reveal data-reveal-delay={index + 1}>
                <span className="reason-index" aria-hidden="true">
                  0{index + 1}
                </span>
                <h3>{reason.title}</h3>
                <p>{reason.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Contact & map */}
      <section id="contact" className="section">
        <div className="content-width contact-panel" data-reveal>
          <div className="contact-panel-copy">
            <p className="eyebrow">Localisation & contact</p>
            <h2>Rendez-nous visite au showroom</h2>
            <p className="contact-copy">
              Notre équipe vous accueille à El Khroub pour vous conseiller dans l&apos;achat ou la vente de votre
              prochain véhicule.
            </p>

            <ul className="contact-list">
              <li>
                <Phone className="h-4 w-4" aria-hidden="true" />
                <a href={`tel:${SHOWROOM_CONFIG.phoneRaw}`}>{SHOWROOM_CONFIG.phoneDisplay}</a>
              </li>
              <li>
                <MapPin className="h-4 w-4" aria-hidden="true" />
                <span>{SHOWROOM_CONFIG.fullAddress}</span>
              </li>
              <li>
                <Video className="h-4 w-4" aria-hidden="true" />
                <a href={SHOWROOM_CONFIG.tiktokUrl} target="_blank" rel="noreferrer">
                  TikTok @{SHOWROOM_CONFIG.tiktokName}
                </a>
              </li>
            </ul>
          </div>

          <div className="map-frame" data-lenis-prevent>
            <iframe
              title="Google Maps Mazigh Auto El Khroub"
              src={SHOWROOM_CONFIG.googleMapsEmbedUrl}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </section>
    </main>
  );
}
