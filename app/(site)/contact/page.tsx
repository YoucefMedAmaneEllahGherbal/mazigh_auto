import { SHOWROOM_CONFIG, buildGenericWhatsAppUrl } from "@/lib/config";
import { Phone, MessageCircle, MapPin, Video, Map } from "lucide-react";

export const metadata = {
  title: "Contact & Localisation | MAZIGH AUTO - El Khroub, Constantine",
  description:
    "Visitez notre showroom automobile Mazigh Auto à El Khroub, Constantine. Téléphone, WhatsApp, plan d'accès Google Maps et réseaux sociaux.",
};

export default function ContactPage() {
  const cards = [
    {
      icon: <Phone className="h-5 w-5" />,
      tone: "text-[var(--primary)]",
      title: "Téléphone direct",
      content: (
        <a href={`tel:${SHOWROOM_CONFIG.phoneRaw}`} className="contact-card-value">
          {SHOWROOM_CONFIG.phoneDisplay}
        </a>
      ),
      hint: "Appel direct en Algérie",
    },
    {
      icon: <MessageCircle className="h-5 w-5" />,
      tone: "text-emerald-400",
      title: "WhatsApp showroom",
      content: (
        <a
          href={buildGenericWhatsAppUrl()}
          target="_blank"
          rel="noreferrer"
          className="whatsapp-button is-small mt-1"
        >
          <MessageCircle className="h-4 w-4" aria-hidden="true" />
          Ouvrir WhatsApp
        </a>
      ),
      hint: "Discutez directement avec le responsable",
    },
    {
      icon: <MapPin className="h-5 w-5" />,
      tone: "text-[var(--primary)]",
      title: "Adresse",
      content: <p className="contact-card-value is-small">{SHOWROOM_CONFIG.fullAddress}</p>,
      hint: (
        <a href={SHOWROOM_CONFIG.googleMapsUrl} target="_blank" rel="noreferrer" className="text-link">
          Itinéraire Google Maps ↗
        </a>
      ),
    },
    {
      icon: <Video className="h-5 w-5" />,
      tone: "text-cyan-400",
      title: "TikTok officiel",
      content: <p className="contact-card-value is-small">@{SHOWROOM_CONFIG.tiktokName}</p>,
      hint: (
        <a href={SHOWROOM_CONFIG.tiktokUrl} target="_blank" rel="noreferrer" className="text-link">
          Suivre sur TikTok ↗
        </a>
      ),
    },
  ];

  return (
    <main className="section is-page">
      <div className="content-width">
        <header className="page-heading">
          <p className="eyebrow">{SHOWROOM_CONFIG.city}</p>
          <h1>Contactez Mazigh Auto</h1>
          <p>
            Une question sur un modèle ? Vous souhaitez visiter le showroom ou essayer une voiture ? Notre équipe
            est à votre disposition 6 jours sur 7.
          </p>
        </header>

        <div className="contact-layout">
          <div className="contact-cards">
            {cards.map((card) => (
              <article key={card.title} className="panel contact-card" data-reveal>
                <span className={`contact-card-icon ${card.tone}`} aria-hidden="true">
                  {card.icon}
                </span>
                <div className="min-w-0">
                  <h2 className="contact-card-title">{card.title}</h2>
                  {card.content}
                  <div className="contact-card-hint">{card.hint}</div>
                </div>
              </article>
            ))}
          </div>

          <div className="panel map-panel">
            <h2 className="panel-title is-compact">
              <Map className="h-4 w-4" aria-hidden="true" /> Plan d&apos;accès — El Khroub
            </h2>
            <div className="map-frame is-tall" data-lenis-prevent>
              <iframe
                title="Google Maps Mazigh Auto El Khroub"
                src={SHOWROOM_CONFIG.googleMapsEmbedUrl}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
