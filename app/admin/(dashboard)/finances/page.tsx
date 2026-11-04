import { CircleAlert } from "lucide-react";
import { getAdminFinanceDashboardData } from "@/app/data/car-finances.server";
import { FinanceDashboardClient } from "../../FinanceDashboardClient";
import { AdminPageHeader } from "../../ui";

export const instant = false;

export default async function AdminFinancesPage() {
  const result = await getAdminFinanceDashboardData();

  return (
    <main className="adm-page">
      <AdminPageHeader
        title="Finances"
        description="Suivi privé des ventes, des coûts et de la rentabilité du showroom."
      />

      {result.error || !result.data ? (
        <div role="alert" className="adm-alert is-error">
          <CircleAlert aria-hidden="true" />
          Impossible de charger les données financières. Réessayez plus tard.
        </div>
      ) : (
        <FinanceDashboardClient cars={result.data.cars} finances={result.data.finances} />
      )}
    </main>
  );
}
