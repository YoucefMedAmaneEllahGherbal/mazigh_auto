import { requireShowroomOwner } from "@/app/data/admin-auth.server";
import { CarFormClient } from "@/app/admin/CarFormClient";
import Link from "next/link";

export const instant = false;

export default async function NewCarPage() {
  await requireShowroomOwner();

  return (
    <main className="page-shell">
      <section className="inventory-section">
        <div className="content-width">
          <div className="mb-8 flex items-center justify-between flex-wrap gap-4">
            <div>
              <p className="eyebrow">Administration • Mazigh Auto</p>
              <h1 className="text-3xl font-extrabold text-white mt-1">
                Ajouter un Véhicule
              </h1>
              <p className="text-sm text-[var(--muted)] mt-1">
                Renseignez les détails, téléversez les photos du véhicule et publiez-le sur le site.
              </p>
            </div>

            <Link href="/admin" className="secondary-button text-sm !py-2 !px-4">
              ← Retour au tableau de bord
            </Link>
          </div>

          <CarFormClient mode="create" />
        </div>
      </section>
    </main>
  );
}
