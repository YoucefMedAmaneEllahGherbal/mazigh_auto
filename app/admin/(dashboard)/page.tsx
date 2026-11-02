import { requireShowroomOwner } from "@/app/data/admin-auth.server";
import { getAdminVehicles } from "@/app/data/vehicles.server";
import { AdminCarsTableClient } from "../AdminCarsTableClient";
import { getAdminCarFinances } from "@/app/data/car-finances.server";
import Link from "next/link";
import { Check } from "lucide-react";

type AdminDashboardProps = {
  searchParams: Promise<{ created?: string; updated?: string }>;
};

export const instant = false;

export default async function AdminDashboardPage({ searchParams }: AdminDashboardProps) {
  await requireShowroomOwner();
  const { created, updated } = await searchParams;

  const [result, financeResult] = await Promise.all([
    getAdminVehicles(),
    getAdminCarFinances(),
  ]);
  const cars = result.data ?? [];
  const pageError = result.error || financeResult.error;

  return (
    <main className="page-shell">
      <section className="inventory-section">
        <div className="content-width">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <p className="eyebrow">Administration • Mazigh Auto</p>
              <h1 className="text-3xl font-extrabold text-white mt-1">
                Gestion des Véhicules
              </h1>
              <p className="text-sm text-[var(--muted)] mt-1">
                Gérez le parc automobile, ajoutez de nouveaux arrivages et mettez à jour les statuts.
              </p>
            </div>

            {pageError && (
              <p className="mb-6 rounded-xl border border-red-500/40 bg-red-950/50 p-4 text-sm text-red-200" role="alert">
                Impossible de charger les données du tableau de bord. Réessayez plus tard.
              </p>
            )}

            <Link href="/admin/voitures/nouveau" className="primary-button text-sm self-start sm:self-auto">
              + Nouveau Véhicule
            </Link>
          </div>

          {/* Flash notices */}
          {Boolean(created) && (
            <div className="mb-6 p-4 rounded-xl bg-emerald-950/60 border border-emerald-500/50 text-emerald-200 text-sm flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Le véhicule a été ajouté au showroom avec succès !</span>
            </div>
          )}
          {Boolean(updated) && (
            <div className="mb-6 p-4 rounded-xl bg-blue-950/60 border border-blue-500/50 text-blue-200 text-sm flex items-center gap-2">
              <Check className="w-4 h-4 text-blue-400 shrink-0" />
              <span>Le véhicule a été mis à jour avec succès !</span>
            </div>
          )}

          {/* Cars Interactive Table */}
          {!pageError && (
            <AdminCarsTableClient
              key={cars.map((c) => c.id + c.statut + c.is_featured).join(",")}
              initialCars={cars}
              initialFinances={financeResult.data ?? []}
            />
          )}
        </div>
      </section>
    </main>
  );
}
