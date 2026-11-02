import { Suspense, type ReactNode } from "react";
import Link from "next/link";
import { requireShowroomOwner } from "@/app/data/admin-auth.server";
import { Logo } from "@/app/components/Logo";
import { signOutAction } from "../auth-actions";
import { ChartNoAxesCombined } from "lucide-react";

export const instant = false;

type ProtectedAdminLayoutProps = {
  children: ReactNode;
};

async function OwnerDashboard({ children }: ProtectedAdminLayoutProps) {
  const owner = await requireShowroomOwner();

  return (
    <>
      <header className="site-header">
        <div className="content-width header-inner admin-header-inner">
          <Logo href="/admin" size="md" />

          <nav className="main-nav" aria-label="Navigation administration">
            <Link href="/admin">Tableau de bord</Link>
            <Link href="/admin/voitures/nouveau">Ajouter un véhicule</Link>
            <Link href="/admin/finances" className="inline-flex items-center gap-1.5">
              <ChartNoAxesCombined className="h-4 w-4" />
              Finances
            </Link>
            <Link href="/" target="_blank">Voir le site public ↗</Link>
          </nav>

          <div className="admin-header-actions">
            {owner.email && <span className="admin-owner-email">{owner.email}</span>}
            <form action={signOutAction}>
              <button className="secondary-button" type="submit">
                Se déconnecter
              </button>
            </form>
          </div>
        </div>
      </header>
      {children}
    </>
  );
}

export default function ProtectedAdminLayout({
  children,
}: ProtectedAdminLayoutProps) {
  return (
    <Suspense
      fallback={
        <main className="admin-auth-page">
          <p className="vehicle-data-message" role="status">
            Vérification de l’accès...
          </p>
        </main>
      }
    >
      <OwnerDashboard>{children}</OwnerDashboard>
    </Suspense>
  );
}
