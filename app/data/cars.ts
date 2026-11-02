export type CarStatus = "disponible" | "reservee" | "vendue" | "brouillon";

export type CarFuel = "Essence" | "Diesel" | "GPL" | "Hybride" | "Électrique";
export type CarTransmission = "Manuelle" | "Automatique";
export type CarCondition = "Neuve" | "Occasion";

export type CarImage = {
  id: string;
  car_id: string;
  url: string;
  position: number;
  is_cover: boolean;
  created_at?: string;
};

export type Car = {
  id: string;
  created_at: string;
  updated_at?: string;
  marque: string;
  modele: string;
  version: string;
  annee: number;
  prix: number;
  negotiable: boolean;
  kilometrage: number;
  carburant: CarFuel;
  boite: CarTransmission;
  moteur: string;
  cylindree?: string;
  puissance?: string;
  couleur: string;
  type_carrosserie: string;
  options: string[];
  description: string;
  etat: CarCondition;
  papiers?: string;
  statut: CarStatus;
  is_featured: boolean;
  slug: string;
  images: CarImage[];
  cover_image_url?: string;

  // Compatibility aliases for existing components
  make?: string;
  model?: string;
  year?: number;
  price?: number;
  mileage?: string;
  fuel?: string;
  transmission?: string;
  color?: string;
  features?: string[];
  coverImageUrl?: string;
  status?: string;
};

export const CARBURANT_OPTIONS: CarFuel[] = [
  "Essence",
  "Diesel",
  "GPL",
  "Hybride",
  "Électrique",
];

export const BOITE_OPTIONS: CarTransmission[] = [
  "Manuelle",
  "Automatique",
];

export const ETAT_OPTIONS: CarCondition[] = [
  "Occasion",
  "Neuve",
];

export const CARROSSERIE_OPTIONS = [
  "Berline",
  "SUV",
  "Citadine",
  "Coupé",
  "Break",
  "Pick-up",
  "Utilitaire",
  "Autre",
] as const;

export const PAPIERS_OPTIONS = [
  "Carte grise (Safia)",
  "Licence",
  "Dédouanée",
  "Autre",
] as const;

export const POPULAR_FEATURES = [
  "Climatisation automatique",
  "Caméra de recul",
  "Caméra 360°",
  "Capteurs de stationnement",
  "Régulateur de vitesse",
  "Écran tactile multimédia",
  "Navigation GPS",
  "Toit ouvrant panoramique",
  "Sièges chauffants",
  "Sièges électriques",
  "Entrée & démarrage sans clé",
  "Apple CarPlay",
  "Android Auto",
  "Bluetooth",
  "Jantes alliage",
  "Phares Full LED",
  "Vitres teintées",
  "Détecteur d'angle mort",
] as const;

export const STATUS_LABELS: Record<CarStatus, { label: string; className: string }> = {
  disponible: { label: "Disponible", className: "status-badge-disponible" },
  reservee: { label: "Réservée", className: "status-badge-reservee" },
  vendue: { label: "Vendue", className: "status-badge-vendue" },
  brouillon: { label: "Brouillon", className: "status-badge-brouillon" },
};

export const formatPriceDZD = (value: number) =>
  `${new Intl.NumberFormat("fr-DZ", { maximumFractionDigits: 0 }).format(value)} DA`;

export const formatKm = (value: number) =>
  `${new Intl.NumberFormat("fr-DZ", { maximumFractionDigits: 0 }).format(value)} km`;
