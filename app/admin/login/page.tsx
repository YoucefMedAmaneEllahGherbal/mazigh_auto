import Link from "next/link";
import { Logo } from "@/app/components/Logo";
import { LoginForm } from "./LoginForm";

export default function AdminLoginPage() {
  return (
    <main className="admin-auth-page">
      <section className="admin-auth-panel" aria-labelledby="admin-login-title">
        <div className="mb-4">
          <Logo href="/" size="md" />
        </div>

        <p className="eyebrow admin-auth-eyebrow">Espace Administration</p>
        <h1 id="admin-login-title">Connexion</h1>
        <p className="admin-auth-copy">
          Accès réservé aux administrateurs de Mazigh Auto (Showroom Kecherid Auto).
        </p>

        <LoginForm />

        <Link href="/" className="admin-back-link">
          Retour au site public
        </Link>
      </section>
    </main>
  );
}
