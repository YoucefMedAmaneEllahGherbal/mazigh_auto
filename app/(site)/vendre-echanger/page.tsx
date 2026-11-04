import { TradeInFormClient } from "./TradeInFormClient";
import { SHOWROOM_CONFIG } from "@/lib/config";

export const metadata = {
  title: "Vendre ou Échanger ma voiture | MAZIGH AUTO - El Khroub, Constantine",
  description:
    "Faites estimer votre véhicule pour un rachat cash rapide ou un échange chez Mazigh Auto (Showroom Kecherid Auto) à El Khroub, Constantine.",
};

export default function VendreEchangerPage() {
  return (
    <main className="section is-page">
      <div className="content-width is-narrow">
        <header className="page-heading is-centered">
          <p className="eyebrow">{SHOWROOM_CONFIG.city}</p>
          <h1>Vendez ou échangez votre voiture</h1>
          <p>
            Renseignez les informations de votre véhicule. Notre équipe vous recontacte sur WhatsApp avec une
            estimation claire et une offre concrète.
          </p>
        </header>

        <TradeInFormClient />
      </div>
    </main>
  );
}
