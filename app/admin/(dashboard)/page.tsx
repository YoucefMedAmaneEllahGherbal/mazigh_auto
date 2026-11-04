import Link from "next/link";
import { CircleAlert, CircleCheck, Plus } from "lucide-react";
import { requireShowroomOwner } from "@/app/data/admin-auth.server";
import { getAdminVehicles } from "@/app/data/vehicles.server";
import { getAdminCarFinances } from "@/app/data/car-finances.server";
import { AdminCarsTableClient } from "../AdminCarsTableClient";
import { AdminPageHeader } from "../ui";

type AdminDashboardProps = {
  searchParams: Promise<{ created?: string; updated?: string }>;
};

export const instant = false;

export default async function AdminDashboardPage({ searchParams }: AdminDashboardProps) {
  await requireShowroomOwner();
  const { created, updated } = await searchParams;

  const [result, financeResult] = await Promise.all([getAdminVehicles(), getAdminCarFinances()]);
  const cars = result.data ?? [];
  const pageError = result.error || financeResult.error;

  return (
    <main className="adm-page">
      <AdminPageHeader
        title="Véhicules"
        description="Gérez le parc, publiez les nouveaux arrivages et mettez à jour les statuts."
        actions={
          <Link href="/admin/voitures/nouveau" className="adm-btn is-primary">
            <Plus className="h-4 w-4" aria-hidden="true" />
            Nouveau véhicule
          </Link>
        }
      />

      <div className="adm-stack">
        {Boolean(created) && (
          <div className="adm-alert is-success" role="status">
            <CircleCheck aria-hidden="true" />
            Le véhicule a été ajouté au showroom.
          </div>
        )}
        {Boolean(updated) && (
          <div className="adm-alert is-info" role="status">
            <CircleCheck aria-hidden="true" />
            Le véhicule a été mis à jour.
          </div>
        )}

        {pageError ? (
          <div className="adm-alert is-error" role="alert">
            <CircleAlert aria-hidden="true" />
            Impossible de charger les données du tableau de bord. Réessayez plus tard.
          </div>
        ) : (
          <AdminCarsTableClient
            key={cars.map((c) => c.id + c.statut + c.is_featured).join(",")}
            initialCars={cars}
            initialFinances={financeResult.data ?? []}
          />
        )}
      </div>
    </main>
  );
}
