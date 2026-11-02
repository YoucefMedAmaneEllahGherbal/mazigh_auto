import Link from "next/link";

export default function NotFound() {
  return (
    <main className="page-shell">
      <section className="inventory-section">
        <div className="content-width" style={{ textAlign: "center" }}>
          <p className="eyebrow">404</p>
          <h1 style={{ marginTop: "1rem", fontSize: "clamp(2.2rem, 4vw, 4rem)" }}>
            Véhicule introuvable
          </h1>
          <p style={{ marginTop: "1rem", color: "#d4cab8" }}>
            Ce véhicule n&apos;est pas disponible dans notre catalogue de démonstration.
          </p>
          <div style={{ marginTop: "2rem" }}>
            <Link href="/vehicules" className="primary-button">
              Retour au catalogue
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
