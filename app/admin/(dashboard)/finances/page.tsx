import { CircleAlert } from "lucide-react";
import { getAdminFinanceDashboardData } from "@/app/data/car-finances.server";
import { FinanceDashboardClient } from "../../FinanceDashboardClient";

export const instant = false;

export default async function AdminFinancesPage() {
  const result = await getAdminFinanceDashboardData();

  return (
    <main className="page-shell">
      <section className="inventory-section">
        <div className="content-width space-y-6">
          <div>
            <p className="eyebrow">Administration • Mazigh Auto</p>
            <h1 className="mt-1 text-3xl font-extrabold text-white">Finances</h1>
            <p className="mt-1 text-sm text-[var(--muted)]">
              Suivi privé des ventes, des coûts et de la rentabilité du showroom.
            </p>
          </div>

          {result.error || !result.data ? (
            <div
              role="alert"
              className="flex items-start gap-3 rounded-xl border border-red-500/40 bg-red-950/50 p-4 text-sm text-red-200"
            >
              <CircleAlert className="mt-0.5 h-5 w-5 shrink-0" />
              Impossible de charger les données financières. Réessayez plus tard.
            </div>
          ) : (
            <FinanceDashboardClient
              cars={result.data.cars}
              finances={result.data.finances}
            />
          )}
        </div>
      </section>
    </main>
  );
}
