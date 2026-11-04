"use client";

import { useState } from "react";
import { buildSellOrExchangeWhatsAppUrl, SHOWROOM_CONFIG } from "@/lib/config";
import { CARBURANT_OPTIONS, BOITE_OPTIONS } from "@/app/data/cars";
import { BadgeDollarSign, RefreshCw, MessageCircle } from "lucide-react";

export function TradeInFormClient() {
  const [actionType, setActionType] = useState<"vente" | "echange">("vente");
  const [marque, setMarque] = useState("");
  const [modele, setModele] = useState("");
  const [annee, setAnnee] = useState("");
  const [kilometrage, setKilometrage] = useState("");
  const [carburant, setCarburant] = useState("Essence");
  const [boite, setBoite] = useState("Manuelle");
  const [prixSouhaite, setPrixSouhaite] = useState("");
  const [details, setDetails] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const url = buildSellOrExchangeWhatsAppUrl({
      actionType,
      marque: marque.trim(),
      modele: modele.trim(),
      annee: annee.trim(),
      kilometrage: kilometrage.trim(),
      carburant,
      boite,
      prixSouhaite: prixSouhaite.trim(),
      details: details.trim(),
    });
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <form onSubmit={handleSubmit} className="panel trade-form">
      <div className="segmented" role="group" aria-label="Type de demande">
        <button type="button" aria-pressed={actionType === "vente"} onClick={() => setActionType("vente")}>
          <BadgeDollarSign className="h-4 w-4" aria-hidden="true" />
          Vendre (cash)
        </button>
        <button type="button" aria-pressed={actionType === "echange"} onClick={() => setActionType("echange")}>
          <RefreshCw className="h-4 w-4" aria-hidden="true" />
          Échanger
        </button>
      </div>

      <div className="form-grid">
        <div className="field-group">
          <label htmlFor="trade-marque">
            Marque <span className="required">*</span>
          </label>
          <input
            id="trade-marque"
            type="text"
            required
            value={marque}
            onChange={(e) => setMarque(e.target.value)}
            placeholder="ex : Renault, Volkswagen, Hyundai"
            className="field"
          />
        </div>

        <div className="field-group">
          <label htmlFor="trade-modele">
            Modèle exact <span className="required">*</span>
          </label>
          <input
            id="trade-modele"
            type="text"
            required
            value={modele}
            onChange={(e) => setModele(e.target.value)}
            placeholder="ex : Clio 4 GT Line, Golf 7 TDI"
            className="field"
          />
        </div>

        <div className="field-group">
          <label htmlFor="trade-annee">
            Année de mise en circulation <span className="required">*</span>
          </label>
          <input
            id="trade-annee"
            type="number"
            inputMode="numeric"
            required
            min={1990}
            max={SHOWROOM_CONFIG.copyrightYear + 1}
            value={annee}
            onChange={(e) => setAnnee(e.target.value)}
            placeholder="ex : 2019"
            className="field"
          />
        </div>

        <div className="field-group">
          <label htmlFor="trade-km">
            Kilométrage (km) <span className="required">*</span>
          </label>
          <input
            id="trade-km"
            type="number"
            inputMode="numeric"
            required
            min={0}
            value={kilometrage}
            onChange={(e) => setKilometrage(e.target.value)}
            placeholder="ex : 85000"
            className="field"
          />
        </div>

        <div className="field-group">
          <label htmlFor="trade-carburant">Carburant</label>
          <select id="trade-carburant" value={carburant} onChange={(e) => setCarburant(e.target.value)} className="field field-select">
            {CARBURANT_OPTIONS.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        <div className="field-group">
          <label htmlFor="trade-boite">Boîte de vitesses</label>
          <select id="trade-boite" value={boite} onChange={(e) => setBoite(e.target.value)} className="field field-select">
            {BOITE_OPTIONS.map((b) => (
              <option key={b} value={b}>{b}</option>
            ))}
          </select>
        </div>

        <div className="field-group is-full">
          <label htmlFor="trade-prix">Prix souhaité (DA)</label>
          <input
            id="trade-prix"
            type="text"
            value={prixSouhaite}
            onChange={(e) => setPrixSouhaite(e.target.value)}
            placeholder="ex : 2 400 000 ou À discuter"
            className="field"
          />
        </div>

        <div className="field-group is-full">
          <label htmlFor="trade-details">État général & remarques</label>
          <textarea
            id="trade-details"
            rows={4}
            value={details}
            onChange={(e) => setDetails(e.target.value)}
            placeholder="Retouches de peinture (sbigha), état mécanique, pièces neuves, carnet… ou le modèle recherché en cas d'échange."
            className="field"
          />
        </div>
      </div>

      <div className="trade-form-footer">
        <button type="submit" className="whatsapp-button is-large">
          <MessageCircle className="h-5 w-5" aria-hidden="true" />
          Envoyer sur WhatsApp pour estimation
        </button>
        <p>
          Ouvre une conversation WhatsApp avec le showroom ({SHOWROOM_CONFIG.phoneDisplay}) avec vos informations
          pré-remplies.
        </p>
      </div>
    </form>
  );
}
