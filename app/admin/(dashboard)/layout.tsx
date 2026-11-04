import { Suspense, type ReactNode } from "react";
import { LogOut } from "lucide-react";
import { requireShowroomOwner } from "@/app/data/admin-auth.server";
import { signOutAction } from "../auth-actions";
import { AdminShell } from "../AdminShell";

export const instant = false;

type ProtectedAdminLayoutProps = {
  children: ReactNode;
};

async function OwnerDashboard({ children }: ProtectedAdminLayoutProps) {
  const owner = await requireShowroomOwner();

  return (
    <AdminShell
      email={owner.email}
      signOut={
        <form action={signOutAction}>
          <button className="adm-icon-btn is-ghost" type="submit" aria-label="Se déconnecter" title="Se déconnecter">
            <LogOut className="h-4 w-4" aria-hidden="true" />
          </button>
        </form>
      }
    >
      {children}
    </AdminShell>
  );
}

export default function ProtectedAdminLayout({ children }: ProtectedAdminLayoutProps) {
  return (
    <Suspense
      fallback={
        <main className="adm-auth-page">
          <p className="adm-muted" role="status">
            Vérification de l’accès…
          </p>
        </main>
      }
    >
      <OwnerDashboard>{children}</OwnerDashboard>
    </Suspense>
  );
}
