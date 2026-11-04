import { Suspense } from "react";
import { getPublicVehicles } from "@/app/data/vehicles.server";
import { CarsCatalogClient } from "./CarsCatalogClient";
import { VehicleAvailabilityState } from "@/app/components/VehicleAvailabilityState";
import { SHOWROOM_CONFIG } from "@/lib/config";

export const metadata = {
  title: "Catalogue des Véhicules | MAZIGH AUTO - El Khroub, Constantine",
  description:
    "Découvrez notre stock de voitures disponibles à la vente et à l'échange chez Mazigh Auto (Showroom Kecherid Auto) à El Khroub, Constantine.",
};

export const instant = false;

export default async function VoituresCataloguePage() {
  const result = await getPublicVehicles();

  return (
    <main className="section is-page">
      <div className="content-width">
        <header className="page-heading">
          <p className="eyebrow">{SHOWROOM_CONFIG.city} • Parc automobile</p>
          <h1>Nos véhicules disponibles</h1>
          <p>
            Véhicules neufs et d&apos;occasion révisés. Contactez-nous sur WhatsApp pour vérifier la disponibilité
            ou réserver un essai.
          </p>
        </header>

        {result.error ? (
          <VehicleAvailabilityState status="error" />
        ) : result.data.length === 0 ? (
          <VehicleAvailabilityState status="empty" />
        ) : (
          <Suspense fallback={<p className="text-sm text-[var(--muted)]">Chargement des véhicules…</p>}>
            <CarsCatalogClient initialCars={result.data} />
          </Suspense>
        )}
      </div>
    </main>
  );
}
