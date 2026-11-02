export type CarFinance = {
  car_id: string;
  prix_achat: number | null;
  frais: number | null;
  prix_vente: number | null;
  date_vente: string | null;
  acheteur: string | null;
  notes: string | null;
};

export type CarSaleDetails = {
  prix_achat: number | null;
  frais: number | null;
  prix_vente: number;
  date_vente: string;
  acheteur: string;
  notes: string;
  achat_inconnu: boolean;
  frais_inconnus: boolean;
};

export type FinanceCarSummary = {
  id: string;
  marque: string;
  modele: string;
  version: string;
  annee: number;
  prix: number;
  statut: string;
  slug: string | null;
};
