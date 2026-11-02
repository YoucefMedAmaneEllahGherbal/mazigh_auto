export const SHOWROOM_CONFIG = {
  name: "MAZIGH AUTO",
  subtitle: "Showroom Kecherid Auto",
  tagline: "Achat, Vente et Échange de voitures",
  phoneDisplay: "0783 82 78 09",
  phoneRaw: "0783827809",
  phoneInternational: "213783827809",
  whatsappNumber: "213783827809",
  tiktokName: "mazigh cars",
  tiktokUrl: "https://www.tiktok.com/@kecherid_auto",
  city: "El Khroub, Constantine",
  fullAddress: "Showroom Kecherid Auto, El Khroub, Constantine, Algérie",
  copyrightYear: 2026,
  googleMapsUrl: "https://maps.google.com/?q=El+Khroub,+Constantine,+Algeria",
  googleMapsEmbedUrl:
    "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d51448.24823908985!2d6.6438676!3d36.2625292!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x12f170cf84c8a777%3A0xc3160b73c24b9142!2sEl%20Khroub%2C%20Algeria!5e0!3m2!1sfr!2sdz!4v1700000000000",
} as const;

export type CarWhatsAppParams = {
  marque: string;
  modele: string;
  version?: string;
  annee: number;
  kilometrage: number;
  carburant: string;
  boite: string;
  couleur: string;
  prix: number;
  slug?: string;
  id?: string;
};

export function buildCarWhatsAppUrl(car: CarWhatsAppParams, origin?: string): string {
  const currentOrigin =
    origin ||
    (typeof window !== "undefined" && window.location.origin
      ? window.location.origin
      : "https://mazighauto.dz");

  const carUrl = `${currentOrigin}/voitures/${car.slug || car.id}`;
  const formattedPrice = new Intl.NumberFormat("fr-DZ", {
    maximumFractionDigits: 0,
  }).format(car.prix);
  const formattedKm = new Intl.NumberFormat("fr-DZ", {
    maximumFractionDigits: 0,
  }).format(car.kilometrage);

  const versionString = car.version && car.version.trim().length > 0 ? ` ${car.version.trim()}` : "";

  const message = `Bonjour, je suis intéressé(e) par cette voiture :
Véhicule : ${car.marque} ${car.modele}${versionString}
Année : ${car.annee}
Kilométrage : ${formattedKm} km
Carburant : ${car.carburant} | Boîte : ${car.boite}
Couleur : ${car.couleur}
Prix : ${formattedPrice} DA
Lien : ${carUrl}
Est-elle toujours disponible ?`;

  return `https://wa.me/${SHOWROOM_CONFIG.whatsappNumber}?text=${encodeURIComponent(message)}`;
}

export function buildGenericWhatsAppUrl(customMessage?: string): string {
  const message =
    customMessage ||
    `Bonjour MAZIGH AUTO, je souhaite avoir des informations sur vos véhicules disponibles au showroom.`;
  return `https://wa.me/${SHOWROOM_CONFIG.whatsappNumber}?text=${encodeURIComponent(message)}`;
}

export function buildSellOrExchangeWhatsAppUrl(info: {
  actionType: "vente" | "echange";
  marque?: string;
  modele?: string;
  annee?: string;
  kilometrage?: string;
  carburant?: string;
  boite?: string;
  prixSouhaite?: string;
  details?: string;
}): string {
  const actionWord = info.actionType === "echange" ? "échanger" : "vendre";
  const formattedCar = [info.marque, info.modele, info.annee ? `(${info.annee})` : ""]
    .filter(Boolean)
    .join(" ");

  const message = `Bonjour MAZIGH AUTO, je souhaite ${actionWord} mon véhicule :
Modèle : ${formattedCar || "Non spécifié"}
Kilométrage : ${info.kilometrage ? `${info.kilometrage} km` : "Non spécifié"}
Carburant : ${info.carburant || "Non spécifié"} | Boîte : ${info.boite || "Non spécifié"}
Prix souhaité : ${info.prixSouhaite ? `${info.prixSouhaite} DA` : "À discuter"}
Remarques / État : ${info.details || "Véhicule en bon état"}`;

  return `https://wa.me/${SHOWROOM_CONFIG.whatsappNumber}?text=${encodeURIComponent(message)}`;
}
