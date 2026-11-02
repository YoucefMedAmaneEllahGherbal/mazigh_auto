"use client";

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
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="sale-reversal-title"
        className="w-full max-w-md space-y-4 rounded-2xl border border-[#333] bg-[#1A1A1A] p-6 shadow-2xl"
      >
        <h2 id="sale-reversal-title" className="text-xl font-bold text-white">
          Annuler la vente ?
        </h2>
        <p className="text-sm text-gray-300">
          La voiture repassera au statut disponible. Souhaitez-vous effacer ses données de vente ?
        </p>
        <div className="flex flex-col-reverse justify-end gap-3 border-t border-[#333] pt-4 sm:flex-row sm:flex-wrap">
          <button
            type="button"
            disabled={pending}
            onClick={onCancel}
            className="secondary-button text-sm !px-4 !py-2"
          >
            Annuler
          </button>
          <button
            type="button"
            disabled={pending}
            onClick={() => onChoose(false)}
            className="secondary-button text-sm !px-4 !py-2"
          >
            Conserver les données
          </button>
          <button
            type="button"
            disabled={pending}
            onClick={() => onChoose(true)}
            className="primary-button text-sm !px-4 !py-2"
          >
            Effacer les données
          </button>
        </div>
      </section>
    </div>
  );
}
