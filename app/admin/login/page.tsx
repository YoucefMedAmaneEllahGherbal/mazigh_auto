import Link from "next/link";
import { Logo } from "@/app/components/Logo";
import { LoginForm } from "./LoginForm";

export default function AdminLoginPage() {
  return (
    <main className="adm-auth-page">
      <section className="adm-auth-card" aria-labelledby="admin-login-title">
        <Logo href="/" size="md" />
        <h1 id="admin-login-title">Connexion administrateur</h1>
        <p>Accès réservé aux propriétaires de Mazigh Auto (Showroom Kecherid Auto).</p>

        <LoginForm />

        <Link href="/" className="adm-auth-back">
          ← Retour au site public
        </Link>
      </section>
    </main>
  );
}
