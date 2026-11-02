import { notFound } from "next/navigation";
import { requireShowroomOwner } from "@/app/data/admin-auth.server";
import { getCarById } from "@/app/data/vehicles.server";
import { getAdminCarFinance } from "@/app/data/car-finances.server";
import { CarFormClient } from "@/app/admin/CarFormClient";
import Link from "next/link";

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
      <main className="page-shell">
        <section className="inventory-section">
          <div className="content-width">
            <p className="rounded-xl border border-red-500/40 bg-red-950/50 p-4 text-sm text-red-200" role="alert">
              Impossible de charger les informations privées du véhicule. Réessayez plus tard.
            </p>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="page-shell">
      <section className="inventory-section">
        <div className="content-width">
          <div className="mb-8 flex items-center justify-between flex-wrap gap-4">
            <div>
              <p className="eyebrow">Administration • Mazigh Auto</p>
              <h1 className="text-3xl font-extrabold text-white mt-1">
                Modifier : {car.marque} {car.modele} ({car.annee})
              </h1>
              <p className="text-sm text-[var(--muted)] mt-1">
                Mettez à jour les caractéristiques, le prix, les photos ou le statut.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Link
                href={`/voitures/${car.slug || car.id}`}
                target="_blank"
                className="secondary-button text-sm !py-2 !px-4"
              >
                Voir la fiche publique ↗
              </Link>
              <Link href="/admin" className="secondary-button text-sm !py-2 !px-4">
                ← Tableau de bord
              </Link>
            </div>
          </div>

          <CarFormClient
            mode="edit"
            initialCar={car}
            initialFinance={financeResult.data}
          />
        </div>
      </section>
    </main>
  );
}
