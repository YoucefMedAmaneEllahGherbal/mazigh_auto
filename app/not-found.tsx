import Link from "next/link";
import { Logo } from "@/app/components/Logo";

export default function NotFound() {
  return (
    <main className="not-found">
      <Logo href="/" size="md" />
      <p className="eyebrow">Erreur 404</p>
      <h1>Page introuvable</h1>
      <p className="not-found-copy">
        Ce véhicule a peut-être été vendu, ou l&apos;adresse n&apos;existe plus.
      </p>
      <div className="cta-row is-centered">
        <Link href="/voitures" className="primary-button">
          Voir le catalogue
        </Link>
        <Link href="/" className="secondary-button">
          Accueil
        </Link>
      </div>
    </main>
  );
}
