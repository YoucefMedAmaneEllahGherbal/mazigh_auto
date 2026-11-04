"use client";

import { AdminDialog } from "./ui";

type SaleReversalDialogProps = {
  pending?: boolean;
  onCancel: () => void;
  onChoose: (clearSaleData: boolean) => void;
};

export function SaleReversalDialog({
  pending = false,
  onCancel,
  onChoose,
}: SaleReversalDialogProps) {
  return (
    <AdminDialog
      title="Annuler la vente ?"
      description="La voiture repassera au statut « Disponible ». Souhaitez-vous effacer ses données de vente (prix, date, acheteur) ?"
      onClose={onCancel}
      busy={pending}
      role="alertdialog"
      footer={
        <>
          <button type="button" disabled={pending} onClick={onCancel} className="adm-btn is-ghost">
            Annuler
          </button>
          <button type="button" disabled={pending} onClick={() => onChoose(false)} className="adm-btn">
            Conserver les données
          </button>
          <button type="button" disabled={pending} onClick={() => onChoose(true)} className="adm-btn is-danger">
            Effacer les données
          </button>
        </>
      }
    />
  );
}
