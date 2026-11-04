"use client";

import { useState } from "react";
import { formatPriceDZD } from "@/app/data/cars";
import type { CarFinance, CarSaleDetails } from "@/app/data/car-finances";
import { AdminDialog } from "./ui";

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

  return (
    <AdminDialog
      title="Marquer comme vendue"
      description={<>Prix affiché : {formatPriceDZD(listedPrice)}</>}
      onClose={onCancel}
      busy={pending}
      wide
      footer={
        <>
          <button type="button" disabled={pending} onClick={onCancel} className="adm-btn">
            Annuler
          </button>
          <button type="button" disabled={pending} onClick={handleConfirm} className="adm-btn is-primary">
            {pending ? "Enregistrement…" : "Confirmer la vente"}
          </button>
        </>
      }
    >
      <div className="adm-grid cols-2">
        <div className="adm-field">
          <label htmlFor="sale-price" className="adm-label">
            Prix de vente <span className="adm-req">*</span>
          </label>
          <div className="adm-input-affix">
            <input
              id="sale-price"
              type="number"
              inputMode="numeric"
              min="0"
              step="1"
              required
              value={salePrice}
              onChange={(event) => setSalePrice(event.target.value)}
              className="adm-input"
            />
            <span>DA</span>
          </div>
        </div>
        <div className="adm-field">
          <label htmlFor="sale-date" className="adm-label">
            Date de vente <span className="adm-req">*</span>
          </label>
          <input
            id="sale-date"
            type="date"
            required
            value={saleDate}
            onChange={(event) => setSaleDate(event.target.value)}
            className="adm-input"
          />
        </div>
        <div className="adm-field">
          <label htmlFor="sale-purchase-price" className="adm-label">
            Prix d&apos;achat
          </label>
          <div className="adm-input-affix">
            <input
              id="sale-purchase-price"
              type="number"
              inputMode="numeric"
              min="0"
              step="1"
              disabled={purchaseUnknown}
              value={purchasePrice}
              onChange={(event) => setPurchasePrice(event.target.value)}
              className="adm-input"
            />
            <span>DA</span>
          </div>
          <label className="adm-check-inline">
            <input
              type="checkbox"
              checked={purchaseUnknown}
              onChange={(event) => setPurchaseUnknown(event.target.checked)}
            />
            Je ne sais pas
          </label>
        </div>
        <div className="adm-field">
          <label htmlFor="sale-fees" className="adm-label">
            Frais
          </label>
          <div className="adm-input-affix">
            <input
              id="sale-fees"
              type="number"
              inputMode="numeric"
              min="0"
              step="1"
              disabled={feesUnknown}
              value={fees}
              onChange={(event) => setFees(event.target.value)}
              className="adm-input"
            />
            <span>DA</span>
          </div>
          <label className="adm-check-inline">
            <input
              type="checkbox"
              checked={feesUnknown}
              onChange={(event) => setFeesUnknown(event.target.checked)}
            />
            Je ne sais pas
          </label>
        </div>
        <div className="adm-field adm-span-full">
          <label htmlFor="sale-buyer" className="adm-label">
            Acheteur <span className="adm-hint">(facultatif)</span>
          </label>
          <input
            id="sale-buyer"
            value={buyer}
            onChange={(event) => setBuyer(event.target.value)}
            maxLength={200}
            className="adm-input"
          />
        </div>
        <div className="adm-field adm-span-full">
          <label htmlFor="sale-notes" className="adm-label">
            Notes privées <span className="adm-hint">(facultatif)</span>
          </label>
          <textarea
            id="sale-notes"
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            maxLength={5000}
            rows={3}
            className="adm-input"
          />
        </div>
      </div>

      <div
        className={`adm-profit ${
          profit === null ? "is-unknown" : profit > 0 ? "is-positive" : profit < 0 ? "is-negative" : ""
        }`}
        aria-live="polite"
      >
        <span>Bénéfice prévisionnel</span>
        <strong>{profit === null ? "coût manquant" : formatPriceDZD(profit)}</strong>
      </div>

      {error && (
        <p className="adm-alert is-error" role="alert">
          {error}
        </p>
      )}
    </AdminDialog>
  );
}
