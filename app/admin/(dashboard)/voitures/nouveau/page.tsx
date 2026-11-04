import { requireShowroomOwner } from "@/app/data/admin-auth.server";
import { CarFormClient } from "@/app/admin/CarFormClient";
import { AdminPageHeader } from "@/app/admin/ui";

export const instant = false;

export default async function NewCarPage() {
  await requireShowroomOwner();

  return (
    <main className="adm-page is-narrow">
      <AdminPageHeader
        back={{ href: "/admin", label: "Véhicules" }}
        title="Ajouter un véhicule"
        description="Renseignez les détails, ajoutez les photos et publiez-le sur le site."
      />
      <CarFormClient mode="create" />
    </main>
  );
}
