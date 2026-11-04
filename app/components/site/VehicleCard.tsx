import Link from "next/link";
import { Camera, MessageCircle } from "lucide-react";
import { CarImage } from "@/app/components/CarImage";
import { formatKm, formatPriceDZD, STATUS_LABELS, type Car } from "@/app/data/cars";
import { buildCarWhatsAppUrl } from "@/lib/config";

type VehicleCardProps = {
  car: Car;
  priority?: boolean;
  /** Smaller variant without the WhatsApp row (used for "similar cars"). */
  compact?: boolean;
};

export function VehicleCard({ car, priority = false, compact = false }: VehicleCardProps) {
  const href = `/voitures/${car.slug || car.id}`;
  const cover = car.cover_image_url || car.images[0]?.url;
  const badge = STATUS_LABELS[car.statut] || STATUS_LABELS.disponible;

  return (
    <article className={`vehicle-card${compact ? " is-compact" : ""}`}>
      <Link href={href} className="vehicle-card-media" aria-label={`${car.marque} ${car.modele} ${car.annee}`}>
        <CarImage
          src={cover}
          alt={`${car.marque} ${car.modele} ${car.annee}`}
          fill
          priority={priority}
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="vehicle-card-image"
        />
        <span className={`status-badge vehicle-card-status ${badge.className}`}>{badge.label}</span>
        <span className="vehicle-card-year">{car.annee}</span>
        {car.images.length > 1 && (
          <span className="vehicle-card-count">
            <Camera className="h-3 w-3" aria-hidden="true" />
            {car.images.length}
          </span>
        )}
      </Link>

      <div className="vehicle-card-body">
        <div>
          <h3 className="vehicle-card-title">
            <Link href={href}>
              {car.marque} {car.modele}
            </Link>
          </h3>
          <p className="vehicle-card-version">{car.version || car.type_carrosserie}</p>
        </div>

        <div className="vehicle-card-price">
          <strong>{formatPriceDZD(car.prix)}</strong>
          {car.negotiable && <span>Négociable</span>}
        </div>

        <dl className="vehicle-card-specs">
          <div>
            <dt>Km</dt>
            <dd>{formatKm(car.kilometrage)}</dd>
          </div>
          <div>
            <dt>Énergie</dt>
            <dd>{car.carburant}</dd>
          </div>
          <div>
            <dt>Boîte</dt>
            <dd>{car.boite}</dd>
          </div>
        </dl>

        {!compact && (
          <div className="vehicle-card-actions">
            <Link href={href} className="vehicle-card-link">
              Voir la fiche →
            </Link>
            <a
              href={buildCarWhatsAppUrl(car)}
              target="_blank"
              rel="noreferrer"
              className="whatsapp-button is-small"
            >
              <MessageCircle className="h-3.5 w-3.5" aria-hidden="true" />
              WhatsApp
            </a>
          </div>
        )}
      </div>
    </article>
  );
}
