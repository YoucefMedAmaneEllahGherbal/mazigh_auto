"use client";

import { useState } from "react";
import { formatPriceDZD } from "@/app/data/cars";
import type { CarFinance, CarSaleDetails } from "@/app/data/car-finances";

type SaleConfirmationDialogProps = {
  listedPrice: number;
  initialFinance?: CarFinance | null;
  pending?: boolean;
  onCancel: () => void;
  onConfirm: (details: CarSaleDetails) => void;
};

function todayInAlgiers() {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Africa/Algiers",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());
  const part = (type: string) => parts.find((value) => value.type === type)?.value ?? "";
  return `${part("year")}-${part("month")}-${part("day")}`;
}

export function SaleConfirmationDialog({
  listedPrice,
  initialFinance,
  pending = false,
  onCancel,
  onConfirm,
}: SaleConfirmationDialogProps) {
  const [salePrice, setSalePrice] = useState(String(listedPrice));
  const [saleDate, setSaleDate] = useState(todayInAlgiers);
  const [purchasePrice, setPurchasePrice] = useState(
    initialFinance?.prix_achat == null ? "" : String(initialFinance.prix_achat),
  );
  const [fees, setFees] = useState(
    initialFinance?.frais == null ? "" : String(initialFinance.frais),
  );
  const [purchaseUnknown, setPurchaseUnknown] = useState(false);
  const [feesUnknown, setFeesUnknown] = useState(false);
  const [buyer, setBuyer] = useState(initialFinance?.acheteur ?? "");
  const [notes, setNotes] = useState(initialFinance?.notes ?? "");
  const [error, setError] = useState("");

  const saleValue = Number(salePrice);
  const purchaseValue = Number(purchasePrice);
  const feesValue = Number(fees);
  const profit =
    Number.isFinite(saleValue) &&
    salePrice !== "" &&
    !purchaseUnknown &&
    purchasePrice !== "" &&
    Number.isFinite(purchaseValue) &&
    !feesUnknown &&
    fees !== "" &&
    Number.isFinite(feesValue)
      ? saleValue - purchaseValue - feesValue
      : null;

  const handleConfirm = () => {
    if (
      salePrice === "" ||
      !Number.isFinite(saleValue) ||
      saleValue < 0 ||
      !saleDate ||
      (!purchaseUnknown &&
        (purchasePrice === "" || !Number.isFinite(purchaseValue) || purchaseValue < 0)) ||
      (!feesUnknown && (fees === "" || !Number.isFinite(feesValue) || feesValue < 0))
    ) {
      setError("Saisissez des montants valides ou choisissez « Je ne sais pas » pour les coûts inconnus.");
      return;
    }

    onConfirm({
      prix_achat: purchaseUnknown ? null : purchaseValue,
      frais: feesUnknown ? null : feesValue,
      prix_vente: saleValue,
      date_vente: saleDate,
      acheteur: buyer.trim(),
      notes: notes.trim(),
      achat_inconnu: purchaseUnknown,
      frais_inconnus: feesUnknown,
    });
  };

  const fieldClass =
    "w-full rounded-lg border border-[#333] bg-[#1E1E1E] p-2.5 text-sm text-white focus:border-[var(--primary)] focus:outline-none";

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center overflow-y-auto bg-black/80 p-4 backdrop-blur-sm">
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="sale-dialog-title"
        className="my-auto max-h-[calc(100vh-2rem)] w-full max-w-xl space-y-4 overflow-y-auto rounded-2xl border border-[#333] bg-[#1A1A1A] p-5 shadow-2xl sm:p-6"
      >
        <div>
          <h2 id="sale-dialog-title" className="text-xl font-bold text-white">
            Marquer comme vendue
          </h2>
          <p className="mt-1 text-sm text-gray-400">
            Prix affiché : {formatPriceDZD(listedPrice)}
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="space-y-1.5 text-sm text-gray-300">
            Prix de vente (DA)
            <input
              type="number"
              min="0"
              step="1"
              required
              value={salePrice}
              onChange={(event) => setSalePrice(event.target.value)}
              className={fieldClass}
            />
          </label>
          <label className="space-y-1.5 text-sm text-gray-300">
            Date de vente
            <input
              type="date"
              required
              value={saleDate}
              onChange={(event) => setSaleDate(event.target.value)}
              className={fieldClass}
            />
          </label>
          <div className="space-y-1.5 text-sm text-gray-300">
            <label htmlFor="sale-purchase-price">Prix d&apos;achat (DA)</label>
            <input
              id="sale-purchase-price"
              type="number"
              min="0"
              step="1"
              disabled={purchaseUnknown}
              value={purchasePrice}
              onChange={(event) => setPurchasePrice(event.target.value)}
              className={fieldClass}
            />
            <label className="flex items-center gap-2 text-xs text-gray-400">
              <input
                type="checkbox"
                checked={purchaseUnknown}
                onChange={(event) => setPurchaseUnknown(event.target.checked)}
              />
              Je ne sais pas
            </label>
          </div>
          <div className="space-y-1.5 text-sm text-gray-300">
            <label htmlFor="sale-fees">Frais (DA)</label>
            <input
              id="sale-fees"
              type="number"
              min="0"
              step="1"
              disabled={feesUnknown}
              value={fees}
              onChange={(event) => setFees(event.target.value)}
              className={fieldClass}
            />
            <label className="flex items-center gap-2 text-xs text-gray-400">
              <input
                type="checkbox"
                checked={feesUnknown}
                onChange={(event) => setFeesUnknown(event.target.checked)}
              />
              Je ne sais pas
            </label>
          </div>
          <label className="space-y-1.5 text-sm text-gray-300 sm:col-span-2">
            Acheteur (facultatif)
            <input
              value={buyer}
              onChange={(event) => setBuyer(event.target.value)}
              maxLength={200}
              className={fieldClass}
            />
          </label>
          <label className="space-y-1.5 text-sm text-gray-300 sm:col-span-2">
            Notes privées (facultatif)
            <textarea
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              maxLength={5000}
              rows={3}
              className={fieldClass}
            />
          </label>
        </div>

        <p
          className={`rounded-lg border border-[#333] bg-[#111] p-3 text-sm ${
            profit === null
              ? "text-gray-400"
              : profit > 0
                ? "text-emerald-400"
                : profit < 0
                  ? "text-red-400"
                  : "text-white"
          }`}
          aria-live="polite"
        >
          Bénéfice prévisionnel :{" "}
          {profit === null ? "coût manquant" : formatPriceDZD(profit)}
        </p>

        {error && (
          <p className="text-sm text-red-300" role="alert">
            {error}
          </p>
        )}

        <div className="flex flex-col-reverse justify-end gap-3 border-t border-[#333] pt-4 sm:flex-row">
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
            onClick={handleConfirm}
            className="primary-button text-sm !px-4 !py-2"
          >
            {pending ? "Enregistrement..." : "Confirmer la vente"}
          </button>
        </div>
      </section>
    </div>
  );
}
