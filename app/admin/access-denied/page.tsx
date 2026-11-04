import Link from "next/link";
import { ShieldAlert } from "lucide-react";
import { Logo } from "@/app/components/Logo";
import { signOutAction } from "../auth-actions";

export default function AdminAccessDeniedPage() {
  return (
    <main className="adm-auth-page">
      <section className="adm-auth-card" aria-labelledby="admin-denied-title">
        <Logo href="/" size="md" />
        <div className="mt-6 inline-grid h-10 w-10 place-items-center rounded-full bg-red-950/50 text-red-300">
          <ShieldAlert className="h-5 w-5" aria-hidden="true" />
        </div>
        <h1 id="admin-denied-title" className="!mt-3">
          Compte non autorisé
        </h1>
        <p>Ce compte est connecté, mais ne figure pas parmi les propriétaires autorisés du showroom.</p>

        <form action={signOutAction} className="mt-6">
          <button className="adm-btn is-lg is-block" type="submit">
            Se déconnecter
          </button>
        </form>

        <Link href="/" className="adm-auth-back">
          ← Retour au site
        </Link>
      </section>
    </main>
  );
}
