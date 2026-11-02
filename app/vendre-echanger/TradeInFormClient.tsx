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
    <form onSubmit={handleSubmit} className="bg-[#141414] border border-[#262626] rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6">
      {/* Radio Switch: Vente vs Échange */}
      <div className="flex rounded-xl bg-[#1E1E1E] p-1 border border-[#333] max-w-sm mx-auto">
        <button
          type="button"
          onClick={() => setActionType("vente")}
          className={`flex-1 py-2.5 text-xs sm:text-sm font-bold rounded-lg transition-all inline-flex items-center justify-center gap-1.5 ${
            actionType === "vente"
              ? "bg-[var(--primary)] text-white shadow-md"
              : "text-gray-400 hover:text-white"
          }`}
        >
          <BadgeDollarSign className="w-4 h-4" />
          <span>Vendre ma voiture (Cash)</span>
        </button>
        <button
          type="button"
          onClick={() => setActionType("echange")}
          className={`flex-1 py-2.5 text-xs sm:text-sm font-bold rounded-lg transition-all inline-flex items-center justify-center gap-1.5 ${
            actionType === "echange"
              ? "bg-[var(--primary)] text-white shadow-md"
              : "text-gray-400 hover:text-white"
          }`}
        >
          <RefreshCw className="w-4 h-4" />
          <span>Échanger ma voiture</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label className="block text-xs font-semibold text-gray-300 mb-1.5">
            Marque de votre voiture <span className="text-[var(--primary)]">*</span>
          </label>
          <input
            type="text"
            required
            value={marque}
            onChange={(e) => setMarque(e.target.value)}
            placeholder="ex: Renault, Volkswagen, Hyundai"
            className="w-full bg-[#1E1E1E] border border-[#333] rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-[var(--primary)]"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-300 mb-1.5">
            Modèle exact <span className="text-[var(--primary)]">*</span>
          </label>
          <input
            type="text"
            required
            value={modele}
            onChange={(e) => setModele(e.target.value)}
            placeholder="ex: Clio 4 GT Line, Golf 7 TDI, Tucson"
            className="w-full bg-[#1E1E1E] border border-[#333] rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-[var(--primary)]"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-300 mb-1.5">
            Année de mise en circulation <span className="text-[var(--primary)]">*</span>
          </label>
          <input
            type="number"
            required
            min={1990}
            max={SHOWROOM_CONFIG.copyrightYear + 1}
            value={annee}
            onChange={(e) => setAnnee(e.target.value)}
            placeholder="ex: 2019"
            className="w-full bg-[#1E1E1E] border border-[#333] rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-[var(--primary)]"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-300 mb-1.5">
            Kilométrage actuel (km) <span className="text-[var(--primary)]">*</span>
          </label>
          <input
            type="number"
            required
            min={0}
            value={kilometrage}
            onChange={(e) => setKilometrage(e.target.value)}
            placeholder="ex: 85000"
            className="w-full bg-[#1E1E1E] border border-[#333] rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-[var(--primary)]"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-300 mb-1.5">Carburant</label>
          <select
            value={carburant}
            onChange={(e) => setCarburant(e.target.value)}
            className="w-full bg-[#1E1E1E] border border-[#333] rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-[var(--primary)]"
          >
            {CARBURANT_OPTIONS.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-300 mb-1.5">Boîte de vitesses</label>
          <select
            value={boite}
            onChange={(e) => setBoite(e.target.value)}
            className="w-full bg-[#1E1E1E] border border-[#333] rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-[var(--primary)]"
          >
            {BOITE_OPTIONS.map((b) => (
              <option key={b} value={b}>{b}</option>
            ))}
          </select>
        </div>

        <div className="sm:col-span-2">
          <label className="block text-xs font-semibold text-gray-300 mb-1.5">
            Prix souhaité en Dinars (DA)
          </label>
          <input
            type="text"
            value={prixSouhaite}
            onChange={(e) => setPrixSouhaite(e.target.value)}
            placeholder="ex: 2 400 000 ou À discuter"
            className="w-full bg-[#1E1E1E] border border-[#333] rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-[var(--primary)]"
          />
        </div>

        <div className="sm:col-span-2">
          <label className="block text-xs font-semibold text-gray-300 mb-1.5">
            État général & Remarques (Peinture, sbigha, retouches, carnet...)
          </label>
          <textarea
            rows={3}
            value={details}
            onChange={(e) => setDetails(e.target.value)}
            placeholder="Précisez si vous avez des retouches de peinture, état mécanique, pièces neuves ou le modèle recherché en cas d'échange..."
            className="w-full bg-[#1E1E1E] border border-[#333] rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-[var(--primary)]"
          />
        </div>
      </div>

      <div className="pt-2 text-center">
        <button
          type="submit"
          className="whatsapp-button w-full sm:w-auto sm:min-w-[280px] !py-3.5 !text-sm flex items-center justify-center gap-2 mx-auto"
        >
          <MessageCircle className="w-5 h-5" />
          <span>Envoyer sur WhatsApp pour estimation</span>
        </button>
        <p className="text-xs text-gray-400 mt-2.5">
          Ce formulaire ouvre une conversation WhatsApp avec le showroom ({SHOWROOM_CONFIG.phoneDisplay}) contenant vos informations pré-remplies.
        </p>
      </div>
    </form>
  );
}
