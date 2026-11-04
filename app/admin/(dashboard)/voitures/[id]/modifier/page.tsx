import { notFound } from "next/navigation";
import { requireShowroomOwner } from "@/app/data/admin-auth.server";
import { getCarById } from "@/app/data/vehicles.server";
import { getAdminCarFinance } from "@/app/data/car-finances.server";
import { CarFormClient } from "@/app/admin/CarFormClient";
import Link from "next/link";
import { CircleAlert, ExternalLink } from "lucide-react";
import { AdminPageHeader } from "@/app/admin/ui";

type EditCarPageProps = {
  params: Promise<{ id: string }>;
};

export const instant = false;

export default async function EditCarPage({ params }: EditCarPageProps) {
  await requireShowroomOwner();
  const { id } = await params;

  const [result, financeResult] = await Promise.all([
    getCarById(id),
    getAdminCarFinance(id),
  ]);
  const car = result.data;

  if (!car) {
    notFound();
  }

  if (financeResult.error) {
    return (
      <main className="adm-page is-narrow">
        <div className="adm-alert is-error" role="alert">
          <CircleAlert aria-hidden="true" />
          Impossible de charger les informations privées du véhicule. Réessayez plus tard.
        </div>
      </main>
    );
  }

  return (
    <main className="adm-page is-narrow">
      <AdminPageHeader
        back={{ href: "/admin", label: "Véhicules" }}
        title={`${car.marque} ${car.modele} (${car.annee})`}
        description="Mettez à jour les caractéristiques, le prix, les photos ou le statut."
        actions={
          <Link href={`/voitures/${car.slug || car.id}`} target="_blank" className="adm-btn">
            <ExternalLink className="h-4 w-4" aria-hidden="true" />
            Fiche publique
          </Link>
        }
      />
      <CarFormClient mode="edit" initialCar={car} initialFinance={financeResult.data} />
    </main>
  );
}
