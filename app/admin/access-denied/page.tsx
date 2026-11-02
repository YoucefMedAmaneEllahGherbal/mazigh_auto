import Link from "next/link";
import { signOutAction } from "../auth-actions";

export default function AdminAccessDeniedPage() {
  return (
    <main className="admin-auth-page">
      <section className="admin-auth-panel" aria-labelledby="admin-denied-title">
        <Link href="/" className="brand-mark" aria-label="MAZIGH AUTO accueil">
          MAZIGH <span>AUTO</span>
        </Link>

        <p className="eyebrow admin-auth-eyebrow">Accès refusé</p>
        <h1 id="admin-denied-title">Compte non autorisé</h1>
        <p className="admin-auth-copy">
          Ce compte est connecté, mais ne figure pas parmi les propriétaires autorisés du showroom.
        </p>

        <form action={signOutAction}>
          <button className="secondary-button admin-submit-button" type="submit">
            Se déconnecter
          </button>
        </form>

        <Link href="/" className="admin-back-link">
          Retour au site
        </Link>
      </section>
    </main>
  );
}