"use client";

import { useState, useTransition, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";
import { compressImage } from "@/lib/image-compression";
import { SHOWROOM_CONFIG } from "@/lib/config";
import { CarImage } from "@/app/components/CarImage";
import type { CarFinance, CarSaleDetails } from "@/app/data/car-finances";
import {
  type Car,
  type CarCondition,
  type CarFuel,
  type CarStatus,
  type CarTransmission,
  BOITE_OPTIONS,
  CARBURANT_OPTIONS,
  CARROSSERIE_OPTIONS,
  ETAT_OPTIONS,
  PAPIERS_OPTIONS,
  POPULAR_FEATURES,
} from "@/app/data/cars";
import { createCarAction, updateCarAction, type CarFormField } from "./car-actions";
import { SaleConfirmationDialog } from "./SaleConfirmationDialog";
import { SaleReversalDialog } from "./SaleReversalDialog";
import {
  ArrowLeft,
  ArrowRight,
  BadgeDollarSign,
  Camera,
  Car as CarIcon,
  Check,
  CheckCheck,
  CircleAlert,
  FileText,
  ImagePlus,
  Loader2,
  LockKeyhole,
  Plus,
  Settings2,
  SlidersHorizontal,
  Sparkles,
  Star,
  Trash2,
  X,
} from "lucide-react";

type CarFormImageItem = {
  id: string; // internal unique key
  url: string;
  is_cover: boolean;
  position: number;
  isUploading?: boolean;
  progress?: number;
};

type CarFormClientProps = {
  initialCar?: Car;
  initialFinance?: CarFinance | null;
  mode: "create" | "edit";
};

export function CarFormClient({ initialCar, initialFinance, mode }: CarFormClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form Fields State
  const [marque, setMarque] = useState(initialCar?.marque || "");
  const [modele, setModele] = useState(initialCar?.modele || "");
  const [version, setVersion] = useState(initialCar?.version || "");
  const [annee, setAnnee] = useState(
    initialCar?.annee?.toString() || SHOWROOM_CONFIG.copyrightYear.toString()
  );
  const [prix, setPrix] = useState(initialCar?.prix?.toString() || "");
  const [negotiable, setNegotiable] = useState(initialCar?.negotiable ?? false);
  const [kilometrage, setKilometrage] = useState(initialCar?.kilometrage?.toString() || "");
  const [carburant, setCarburant] = useState<CarFuel>(initialCar?.carburant || "Essence");
  const [boite, setBoite] = useState<CarTransmission>(initialCar?.boite || "Manuelle");
  const [moteur, setMoteur] = useState(initialCar?.moteur || "");
  const [cylindree, setCylindree] = useState(initialCar?.cylindree || "");
  const [puissance, setPuissance] = useState(initialCar?.puissance || "");
  const [couleur, setCouleur] = useState(initialCar?.couleur || "");
  const [typeCarrosserie, setTypeCarrosserie] = useState(initialCar?.type_carrosserie || "Berline");
  const [etat, setEtat] = useState<CarCondition>(initialCar?.etat || "Occasion");
  const [papiers, setPapiers] = useState(initialCar?.papiers || "Carte grise (Safia)");
  const [statut, setStatut] = useState<CarStatus>(initialCar?.statut || "disponible");
  const [isFeatured, setIsFeatured] = useState(initialCar?.is_featured ?? false);
  const [description, setDescription] = useState(initialCar?.description || "");
  const [slug, setSlug] = useState(initialCar?.slug || "");
  const [prixAchat, setPrixAchat] = useState(
    initialFinance?.prix_achat == null ? "" : String(initialFinance.prix_achat),
  );
  const [frais, setFrais] = useState(
    initialFinance?.frais == null ? "" : String(initialFinance.frais),
  );
  const [financeNotes, setFinanceNotes] = useState(initialFinance?.notes || "");
  const [saleDialogOpen, setSaleDialogOpen] = useState(false);
  const [saleDetails, setSaleDetails] = useState<CarSaleDetails | null>(null);
  const [reversalDialogOpen, setReversalDialogOpen] = useState(false);
  const [clearSaleData, setClearSaleData] = useState<boolean | null>(null);

  // Options / Features
  const [selectedOptions, setSelectedOptions] = useState<string[]>(initialCar?.options || []);
  const [customOptionInput, setCustomOptionInput] = useState("");

  // Images state
  const initialImages: CarFormImageItem[] = (initialCar?.images || []).map((img, idx) => ({
    id: img.id || `init-${idx}`,
    url: img.url,
    is_cover: img.is_cover,
    position: img.position ?? idx,
  }));
  const [images, setImages] = useState<CarFormImageItem[]>(initialImages);
  const [isUploadingFiles, setIsUploadingFiles] = useState(false);
  const [isDraggingFiles, setIsDraggingFiles] = useState(false);

  // Errors & Feedback
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<CarFormField, string>>>({});
  const [generalError, setGeneralError] = useState("");
  const formTopRef = useRef<HTMLDivElement>(null);

  const showError = (message: string) => {
    setGeneralError(message);
    requestAnimationFrame(() =>
      formTopRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }),
    );
  };

  const errorProps = (field: CarFormField) =>
    fieldErrors[field]
      ? { "aria-invalid": true as const, "aria-describedby": `car-${field}-error` }
      : {};

  const renderFieldError = (field: CarFormField) =>
    fieldErrors[field] ? (
      <p id={`car-${field}-error`} className="adm-error-text" role="alert">
        {fieldErrors[field]}
      </p>
    ) : null;

  const handleStatusChange = (nextStatus: CarStatus) => {
    if (nextStatus === "vendue" && statut !== "vendue") {
      if (mode === "create") {
        showError("Créez d'abord le véhicule, puis confirmez sa vente depuis sa fiche.");
        return;
      }
      setSaleDialogOpen(true);
      return;
    }

    if (statut === "vendue" && nextStatus === "disponible") {
      setReversalDialogOpen(true);
      return;
    }

    setStatut(nextStatus);
  };

  const confirmSale = (details: CarSaleDetails) => {
    setPrixAchat(details.prix_achat == null ? "" : String(details.prix_achat));
    setFrais(details.frais == null ? "" : String(details.frais));
    setFinanceNotes(details.notes);
    setSaleDetails(details);
    setClearSaleData(null);
    setStatut("vendue");
    setSaleDialogOpen(false);
  };

  const confirmSaleReversal = (clear: boolean) => {
    setClearSaleData(clear);
    setStatut("disponible");
    setReversalDialogOpen(false);
  };

  // Toggle option tag
  const toggleOption = (opt: string) => {
    setSelectedOptions((prev) =>
      prev.includes(opt) ? prev.filter((o) => o !== opt) : [...prev, opt]
    );
  };

  const allSuggestedOptionsSelected = POPULAR_FEATURES.every((option) =>
    selectedOptions.includes(option)
  );
  const toggleAllSuggestedOptions = () => {
    setSelectedOptions((prev) => {
      const allSelected = POPULAR_FEATURES.every((option) => prev.includes(option));
      return allSelected
        ? prev.filter((option) => !(POPULAR_FEATURES as readonly string[]).includes(option))
        : Array.from(new Set([...prev, ...POPULAR_FEATURES]));
    });
  };

  const addCustomOption = () => {
    const trimmed = customOptionInput.trim();
    if (trimmed && !selectedOptions.includes(trimmed)) {
      setSelectedOptions((prev) => [...prev, trimmed]);
      setCustomOptionInput("");
    }
  };

  // Upload files from device to Supabase Storage
  const uploadFiles = async (files: File[]) => {
    if (files.length === 0) return;

    setIsUploadingFiles(true);
    setGeneralError("");
    const supabase = createClient();

    try {
      const newItems: CarFormImageItem[] = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
          setGeneralError(`Le fichier ${file.name} doit être au format JPG, PNG ou WebP.`);
          continue;
        }
        if (file.size > 10 * 1024 * 1024) {
          setGeneralError(`Le fichier ${file.name} dépasse la limite de 10 Mo.`);
          continue;
        }

        // 1. Client-side compression
        const { file: compressed } = await compressImage(file);

        // 2. Generate clean storage path
        const randomKey = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
        const cleanExt = compressed.type === "image/webp" ? "webp" : "jpg";
        const filePath = `${randomKey}.${cleanExt}`;

        // 3. Upload to 'car-images' bucket
        const { data, error } = await supabase.storage
          .from("car-images")
          .upload(filePath, compressed, {
            contentType: compressed.type,
            upsert: false,
          });

        if (error) {
          console.error("Storage upload error:", error);
          setGeneralError(`Erreur lors de l'envoi de ${file.name}: ${error.message}`);
          continue;
        }

        // 4. Get public URL
        const {
          data: { publicUrl },
        } = supabase.storage.from("car-images").getPublicUrl(data.path);

        newItems.push({
          id: `upload-${Date.now()}-${i}`,
          url: publicUrl,
          is_cover: images.length === 0 && newItems.length === 0,
          position: images.length + newItems.length,
        });
      }

      setImages((prev) => [...prev, ...newItems]);
    } catch (err: unknown) {
      console.error("Upload error:", err);
      setGeneralError("Une erreur est survenue lors de l'envoi des photos.");
    } finally {
      setIsUploadingFiles(false);
    }
  };

  const handleDeviceFilesSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    await uploadFiles(Array.from(e.target.files ?? []));
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleFileDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDraggingFiles(false);
    if (!isUploadingFiles) {
      void uploadFiles(Array.from(e.dataTransfer.files));
    }
  };

  const removeImage = (id: string) => {
    setImages((prev) => {
      const filtered = prev.filter((img) => img.id !== id);
      // If we removed the cover, set the first image as cover
      if (filtered.length > 0 && !filtered.some((img) => img.is_cover)) {
        filtered[0].is_cover = true;
      }
      return filtered.map((img, idx) => ({ ...img, position: idx }));
    });
  };

  const setCoverImage = (id: string) => {
    setImages((prev) =>
      prev.map((img) => ({
        ...img,
        is_cover: img.id === id,
      }))
    );
  };

  const moveImage = (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= images.length) return;

    setImages((prev) => {
      const updated = [...prev];
      const temp = updated[index];
      updated[index] = updated[targetIndex];
      updated[targetIndex] = temp;
      return updated.map((img, idx) => ({ ...img, position: idx }));
    });
  };

  // Form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError("");
    setFieldErrors({});

    // Client pre-validation
    const errors: Partial<Record<CarFormField, string>> = {};
    if (!marque.trim()) errors.marque = "La marque est obligatoire.";
    if (!modele.trim()) errors.modele = "Le modèle est obligatoire.";
    if (!annee || isNaN(Number(annee))) errors.annee = "L'année est invalide.";
    if (!prix || isNaN(Number(prix)) || Number(prix) < 0) errors.prix = "Le prix est invalide.";
    if (!kilometrage || isNaN(Number(kilometrage)) || Number(kilometrage) < 0) {
      errors.kilometrage = "Le kilométrage est invalide.";
    }
    if (prixAchat && (!Number.isFinite(Number(prixAchat)) || Number(prixAchat) < 0)) {
      errors.prix_achat = "Saisissez un prix d'achat valide.";
    }
    if (frais && (!Number.isFinite(Number(frais)) || Number(frais) < 0)) {
      errors.frais = "Saisissez un montant de frais valide.";
    }
    if (financeNotes.length > 5000) {
      errors.finance_notes = "Les notes privées sont trop longues.";
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      showError("Veuillez corriger les champs signalés en rouge.");
      return;
    }

    const formData = new FormData();
    formData.append("marque", marque.trim());
    formData.append("modele", modele.trim());
    formData.append("version", version.trim());
    formData.append("annee", annee.trim());
    formData.append("prix", prix.trim());
    formData.append("negotiable", String(negotiable));
    formData.append("kilometrage", kilometrage.trim());
    formData.append("carburant", carburant);
    formData.append("boite", boite);
    formData.append("moteur", moteur.trim());
    formData.append("cylindree", cylindree.trim());
    formData.append("puissance", puissance.trim());
    formData.append("couleur", couleur.trim());
    formData.append("type_carrosserie", typeCarrosserie);
    formData.append("etat", etat);
    formData.append("papiers", papiers);
    formData.append("statut", statut);
    formData.append("is_featured", String(isFeatured));
    formData.append("description", description.trim());
    formData.append("slug", slug.trim());
    formData.append("prix_achat", prixAchat.trim());
    formData.append("frais", frais.trim());
    formData.append("finance_notes", financeNotes.trim());
    if (saleDetails && statut === "vendue") {
      formData.append("saleDetailsJson", JSON.stringify(saleDetails));
    }
    if (clearSaleData !== null && statut === "disponible") {
      formData.append("clearSaleData", String(clearSaleData));
    }
    formData.append("optionsJson", JSON.stringify(selectedOptions));
    formData.append(
      "imagesJson",
      JSON.stringify(
        images.map((img, idx) => ({
          url: img.url,
          is_cover: img.is_cover,
          position: idx,
        }))
      )
    );

    startTransition(async () => {
      let result;
      if (mode === "edit" && initialCar) {
        result = await updateCarAction(initialCar.id, formData);
      } else {
        result = await createCarAction(formData);
      }

      if (result.success) {
        router.refresh();
        router.replace(mode === "edit" ? `/admin?updated=${Date.now()}` : `/admin?created=${Date.now()}`);
      } else {
        showError(result.message || "Une erreur est survenue lors de l'enregistrement.");
        if (result.fieldErrors) setFieldErrors(result.fieldErrors);
      }
    });
  };

  const customOptions = selectedOptions.filter(
    (o) => !(POPULAR_FEATURES as readonly string[]).includes(o),
  );
  const purchaseLocked = Boolean(saleDetails?.achat_inconnu && statut === "vendue");
  const feesLocked = Boolean(saleDetails?.frais_inconnus && statut === "vendue");
  const saving = isPending || isUploadingFiles;

  return (
    <form onSubmit={handleSubmit} noValidate className="adm-stack">
      <div ref={formTopRef} className="scroll-mt-20" />
      {generalError && (
        <div className="adm-alert is-error" role="alert">
          <CircleAlert aria-hidden="true" />
          {generalError}
        </div>
      )}

      <div className="adm-form-layout">
        {/* ============ MAIN COLUMN ============ */}
        <div className="adm-stack">
          {/* Identification */}
          <section className="adm-card">
            <header className="adm-card-header">
              <h2 className="adm-card-title">
                <CarIcon className="h-[18px] w-[18px]" aria-hidden="true" /> Identification
              </h2>
            </header>
            <div className="adm-card-body adm-stack">
              <div className="adm-grid cols-3">
                <div className="adm-field">
                  <label htmlFor="car-marque" className="adm-label">
                    Marque <span className="adm-req">*</span>
                  </label>
                  <input
                    id="car-marque"
                    type="text"
                    required
                    value={marque}
                    onChange={(e) => setMarque(e.target.value)}
                    placeholder="ex : Volkswagen"
                    className="adm-input"
                    {...errorProps("marque")}
                  />
                  {renderFieldError("marque")}
                </div>
                <div className="adm-field">
                  <label htmlFor="car-modele" className="adm-label">
                    Modèle <span className="adm-req">*</span>
                  </label>
                  <input
                    id="car-modele"
                    type="text"
                    required
                    value={modele}
                    onChange={(e) => setModele(e.target.value)}
                    placeholder="ex : Golf 8"
                    className="adm-input"
                    {...errorProps("modele")}
                  />
                  {renderFieldError("modele")}
                </div>
                <div className="adm-field">
                  <label htmlFor="car-version" className="adm-label">Version / finition</label>
                  <input
                    id="car-version"
                    type="text"
                    value={version}
                    onChange={(e) => setVersion(e.target.value)}
                    placeholder="ex : R-Line, GT Line"
                    className="adm-input"
                  />
                </div>
              </div>

              <div className="adm-grid cols-4">
                <div className="adm-field">
                  <label htmlFor="car-annee" className="adm-label">
                    Année <span className="adm-req">*</span>
                  </label>
                  <input
                    id="car-annee"
                    type="number"
                    inputMode="numeric"
                    required
                    min={1970}
                    max={SHOWROOM_CONFIG.copyrightYear + 2}
                    value={annee}
                    onChange={(e) => setAnnee(e.target.value)}
                    className="adm-input"
                    {...errorProps("annee")}
                  />
                  {renderFieldError("annee")}
                </div>
                <div className="adm-field">
                  <label htmlFor="car-carrosserie" className="adm-label">Carrosserie</label>
                  <select id="car-carrosserie" value={typeCarrosserie} onChange={(e) => setTypeCarrosserie(e.target.value)} className="adm-input">
                    {CARROSSERIE_OPTIONS.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div className="adm-field">
                  <label htmlFor="car-etat" className="adm-label">État</label>
                  <select id="car-etat" value={etat} onChange={(e) => setEtat(e.target.value as CarCondition)} className="adm-input">
                    {ETAT_OPTIONS.map((option) => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                </div>
                <div className="adm-field">
                  <label htmlFor="car-papiers" className="adm-label">Papiers</label>
                  <select id="car-papiers" value={papiers} onChange={(e) => setPapiers(e.target.value)} className="adm-input">
                    {PAPIERS_OPTIONS.map((p) => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </section>

          {/* Technique */}
          <section className="adm-card">
            <header className="adm-card-header">
              <h2 className="adm-card-title">
                <Settings2 className="h-[18px] w-[18px]" aria-hidden="true" /> Caractéristiques techniques
              </h2>
            </header>
            <div className="adm-card-body adm-stack">
              <div className="adm-grid cols-3">
                <div className="adm-field">
                  <label htmlFor="car-km" className="adm-label">
                    Kilométrage <span className="adm-req">*</span>
                  </label>
                  <div className="adm-input-affix">
                    <input
                      id="car-km"
                      type="number"
                      inputMode="numeric"
                      required
                      min={0}
                      value={kilometrage}
                      onChange={(e) => setKilometrage(e.target.value)}
                      placeholder="45000"
                      className="adm-input"
                      {...errorProps("kilometrage")}
                    />
                    <span>km</span>
                  </div>
                  {renderFieldError("kilometrage")}
                </div>
                <div className="adm-field">
                  <label htmlFor="car-carburant" className="adm-label">
                    Carburant <span className="adm-req">*</span>
                  </label>
                  <select id="car-carburant" value={carburant} onChange={(e) => setCarburant(e.target.value as CarFuel)} className="adm-input">
                    {CARBURANT_OPTIONS.map((fuel) => (
                      <option key={fuel} value={fuel}>{fuel}</option>
                    ))}
                  </select>
                </div>
                <div className="adm-field">
                  <label htmlFor="car-boite" className="adm-label">
                    Boîte de vitesses <span className="adm-req">*</span>
                  </label>
                  <select id="car-boite" value={boite} onChange={(e) => setBoite(e.target.value as CarTransmission)} className="adm-input">
                    {BOITE_OPTIONS.map((b) => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="adm-grid cols-4">
                <div className="adm-field">
                  <label htmlFor="car-moteur" className="adm-label">Moteur</label>
                  <input id="car-moteur" type="text" value={moteur} onChange={(e) => setMoteur(e.target.value)} placeholder="ex : 2.0 TDI" className="adm-input" />
                </div>
                <div className="adm-field">
                  <label htmlFor="car-cylindree" className="adm-label">Cylindrée</label>
                  <input id="car-cylindree" type="text" value={cylindree} onChange={(e) => setCylindree(e.target.value)} placeholder="ex : 1968 cc" className="adm-input" />
                </div>
                <div className="adm-field">
                  <label htmlFor="car-puissance" className="adm-label">Puissance</label>
                  <input id="car-puissance" type="text" value={puissance} onChange={(e) => setPuissance(e.target.value)} placeholder="ex : 150 ch" className="adm-input" />
                </div>
                <div className="adm-field">
                  <label htmlFor="car-couleur" className="adm-label">Couleur</label>
                  <input id="car-couleur" type="text" value={couleur} onChange={(e) => setCouleur(e.target.value)} placeholder="ex : Gris Nardo" className="adm-input" />
                </div>
              </div>
            </div>
          </section>

          {/* Photos */}
          <section className="adm-card">
            <header className="adm-card-header">
              <div>
                <h2 className="adm-card-title">
                  <Camera className="h-[18px] w-[18px]" aria-hidden="true" /> Photos
                  <span className="text-sm font-normal text-[var(--adm-subtle)]">({images.length})</span>
                </h2>
                <p className="adm-card-desc">La photo de couverture est affichée en premier sur le site.</p>
              </div>
            </header>
            <div className="adm-card-body">
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDraggingFiles(true);
                }}
                onDragLeave={() => setIsDraggingFiles(false)}
                onDrop={handleFileDrop}
                className={`adm-dropzone${isDraggingFiles ? " is-dragging" : ""}`}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  multiple
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleDeviceFilesSelected}
                  className="sr-only"
                  id="car-device-file-input"
                />
                {isUploadingFiles ? (
                  <Loader2 className="h-7 w-7 animate-spin" aria-hidden="true" />
                ) : (
                  <ImagePlus className="h-7 w-7" aria-hidden="true" />
                )}
                <p>{isUploadingFiles ? "Compression et envoi en cours…" : "Glissez vos photos ici"}</p>
                <p className="adm-hint">JPG, PNG ou WebP — 10 Mo max. Compression automatique.</p>
                <label
                  htmlFor="car-device-file-input"
                  className={`adm-btn is-sm${isUploadingFiles ? " pointer-events-none opacity-50" : ""}`}
                >
                  Choisir des fichiers
                </label>
              </div>

              {renderFieldError("images")}

              {images.length > 0 && (
                <ul className="adm-images">
                  {images.map((img, index) => (
                    <li key={img.id} className={`adm-image${img.is_cover ? " is-cover" : ""}`}>
                      <div className="adm-image-media">
                        <CarImage src={img.url} alt={`Photo ${index + 1}`} fill sizes="200px" className="object-cover" />
                        {img.is_cover && <span className="adm-image-badge">Couverture</span>}
                        <span className="adm-image-index">{index + 1}</span>
                      </div>
                      <div className="adm-image-bar">
                        <div className="flex gap-1">
                          <button
                            type="button"
                            disabled={index === 0}
                            onClick={() => moveImage(index, "up")}
                            className="adm-icon-btn is-ghost"
                            aria-label="Déplacer avant"
                            title="Déplacer avant"
                          >
                            <ArrowLeft className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            disabled={index === images.length - 1}
                            onClick={() => moveImage(index, "down")}
                            className="adm-icon-btn is-ghost"
                            aria-label="Déplacer après"
                            title="Déplacer après"
                          >
                            <ArrowRight className="h-4 w-4" />
                          </button>
                        </div>
                        <div className="flex gap-1">
                          {!img.is_cover && (
                            <button
                              type="button"
                              onClick={() => setCoverImage(img.id)}
                              className="adm-icon-btn is-ghost"
                              aria-label="Définir comme couverture"
                              title="Définir comme couverture"
                            >
                              <Star className="h-4 w-4" />
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => removeImage(img.id)}
                            className="adm-icon-btn is-ghost is-danger"
                            aria-label="Supprimer la photo"
                            title="Supprimer la photo"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </section>

          {/* Équipements */}
          <section className="adm-card">
            <header className="adm-card-header">
              <h2 className="adm-card-title">
                <Sparkles className="h-[18px] w-[18px]" aria-hidden="true" /> Équipements & options
              </h2>
              <button type="button" onClick={toggleAllSuggestedOptions} className="adm-btn is-sm is-ghost">
                {allSuggestedOptionsSelected ? (
                  <>
                    <X className="h-4 w-4" aria-hidden="true" /> Tout retirer
                  </>
                ) : (
                  <>
                    <CheckCheck className="h-4 w-4" aria-hidden="true" /> Tout cocher
                  </>
                )}
              </button>
            </header>
            <div className="adm-card-body adm-stack">
              <div className="adm-options">
                {POPULAR_FEATURES.map((opt) => {
                  const selected = selectedOptions.includes(opt);
                  return (
                    <button key={opt} type="button" aria-pressed={selected} onClick={() => toggleOption(opt)} className="adm-option">
                      {selected ? <Check className="h-3.5 w-3.5" aria-hidden="true" /> : <Plus className="h-3.5 w-3.5" aria-hidden="true" />}
                      {opt}
                    </button>
                  );
                })}
                {customOptions.map((custom) => (
                  <button
                    key={custom}
                    type="button"
                    aria-pressed
                    onClick={() => toggleOption(custom)}
                    className="adm-option is-custom"
                    aria-label={`Retirer ${custom}`}
                  >
                    {custom}
                    <X className="h-3.5 w-3.5" aria-hidden="true" />
                  </button>
                ))}
              </div>

              <div className="flex max-w-md gap-2">
                <label htmlFor="car-custom-option" className="sr-only">
                  Option personnalisée
                </label>
                <input
                  id="car-custom-option"
                  type="text"
                  value={customOptionInput}
                  onChange={(e) => setCustomOptionInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addCustomOption();
                    }
                  }}
                  placeholder="Ajouter une option personnalisée…"
                  className="adm-input"
                />
                <button type="button" onClick={addCustomOption} className="adm-btn">
                  Ajouter
                </button>
              </div>
            </div>
          </section>

          {/* Description */}
          <section className="adm-card">
            <header className="adm-card-header">
              <div>
                <h2 className="adm-card-title">
                  <FileText className="h-[18px] w-[18px]" aria-hidden="true" /> Description & état
                </h2>
                <p className="adm-card-desc">
                  Retouches de peinture (sbigha), pièces changées, carnet d&apos;entretien, pneus…
                </p>
              </div>
            </header>
            <div className="adm-card-body">
              <label htmlFor="car-description" className="sr-only">
                Description
              </label>
              <textarea
                id="car-description"
                rows={6}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Ex : Première main, carnet à jour. Zéro retouche, pneus neufs. Rien à prévoir…"
                className="adm-input"
              />
            </div>
          </section>

          {/* Advanced */}
          <details className="adm-card adm-details" open={Boolean(fieldErrors.slug) || undefined}>
            <summary className="adm-card-header">
              <h2 className="adm-card-title">
                <SlidersHorizontal className="h-[18px] w-[18px]" aria-hidden="true" /> Paramètres avancés
              </h2>
              <span className="adm-hint">Optionnel</span>
            </summary>
            <div className="adm-card-body">
              <div className="adm-field">
                <label htmlFor="car-slug" className="adm-label">Identifiant d&apos;URL (slug)</label>
                <input
                  id="car-slug"
                  type="text"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="volkswagen-golf-8-2022"
                  className="adm-input is-mono"
                  {...errorProps("slug")}
                />
                {renderFieldError("slug")}
                <p className="adm-hint">Laissez vide pour le générer depuis la marque, le modèle et l&apos;année.</p>
              </div>
            </div>
          </details>
        </div>

        {/* ============ SIDEBAR ============ */}
        <aside className="adm-form-aside">
          <section className="adm-card">
            <header className="adm-card-header">
              <h2 className="adm-card-title">
                <BadgeDollarSign className="h-[18px] w-[18px]" aria-hidden="true" /> Prix & publication
              </h2>
            </header>
            <div className="adm-card-body adm-stack">
              <div className="adm-field">
                <label htmlFor="car-prix" className="adm-label">
                  Prix affiché <span className="adm-req">*</span>
                </label>
                <div className="adm-input-affix">
                  <input
                    id="car-prix"
                    type="number"
                    inputMode="numeric"
                    required
                    min={0}
                    value={prix}
                    onChange={(e) => setPrix(e.target.value)}
                    placeholder="3500000"
                    className="adm-input font-semibold"
                    {...errorProps("prix")}
                  />
                  <span>DA</span>
                </div>
                {renderFieldError("prix")}
              </div>

              <div className="adm-field">
                <label htmlFor="car-statut" className="adm-label">
                  Statut <span className="adm-req">*</span>
                </label>
                <select
                  id="car-statut"
                  value={statut}
                  onChange={(e) => handleStatusChange(e.target.value as CarStatus)}
                  className="adm-input"
                  {...errorProps("statut")}
                >
                  <option value="disponible">Disponible — visible</option>
                  <option value="reservee">Réservée — badge réservée</option>
                  <option value="vendue" disabled={mode === "create"}>
                    Vendue — badge vendue
                  </option>
                  <option value="brouillon">Brouillon — masquée</option>
                </select>
                {renderFieldError("statut")}
              </div>

              <label className="adm-check">
                <input type="checkbox" checked={negotiable} onChange={(e) => setNegotiable(e.target.checked)} />
                <span>
                  <strong>Prix négociable</strong>
                  <span>Affiche le badge « Négociable ».</span>
                </span>
              </label>

              <label className="adm-check">
                <input type="checkbox" checked={isFeatured} onChange={(e) => setIsFeatured(e.target.checked)} />
                <span>
                  <strong>En vedette</strong>
                  <span>Mise en avant sur la page d&apos;accueil.</span>
                </span>
              </label>
            </div>
          </section>

          <section className="adm-card is-private">
            <header className="adm-card-header">
              <div>
                <h2 className="adm-card-title">
                  <LockKeyhole className="h-[18px] w-[18px]" aria-hidden="true" /> Informations privées
                </h2>
                <p className="adm-card-desc">Jamais affichées sur le site public.</p>
              </div>
            </header>
            <div className="adm-card-body adm-stack">
              <div className="adm-field">
                <label htmlFor="car-purchase-price" className="adm-label">Prix d&apos;achat</label>
                <div className="adm-input-affix">
                  <input
                    id="car-purchase-price"
                    type="number"
                    inputMode="numeric"
                    min="0"
                    step="1"
                    disabled={purchaseLocked}
                    value={prixAchat}
                    onChange={(event) => {
                      const value = event.target.value;
                      setPrixAchat(value);
                      setSaleDetails((previous) =>
                        previous
                          ? {
                              ...previous,
                              prix_achat: value === "" ? null : Number(value),
                              achat_inconnu: value === "" ? previous.achat_inconnu : false,
                            }
                          : previous,
                      );
                    }}
                    className="adm-input"
                    {...errorProps("prix_achat")}
                  />
                  <span>DA</span>
                </div>
                {renderFieldError("prix_achat")}
                {saleDetails && statut === "vendue" && (
                  <label className="adm-check-inline">
                    <input
                      type="checkbox"
                      checked={saleDetails.achat_inconnu}
                      onChange={(event) => {
                        const checked = event.target.checked;
                        if (checked) setPrixAchat("");
                        setSaleDetails((previous) =>
                          previous
                            ? {
                                ...previous,
                                achat_inconnu: checked,
                                prix_achat: checked ? null : previous.prix_achat,
                              }
                            : previous,
                        );
                      }}
                    />
                    Je ne sais pas
                  </label>
                )}
              </div>

              <div className="adm-field">
                <label htmlFor="car-fees" className="adm-label">Frais (réparations, papiers)</label>
                <div className="adm-input-affix">
                  <input
                    id="car-fees"
                    type="number"
                    inputMode="numeric"
                    min="0"
                    step="1"
                    disabled={feesLocked}
                    value={frais}
                    onChange={(event) => {
                      const value = event.target.value;
                      setFrais(value);
                      setSaleDetails((previous) =>
                        previous
                          ? {
                              ...previous,
                              frais: value === "" ? null : Number(value),
                              frais_inconnus: value === "" ? previous.frais_inconnus : false,
                            }
                          : previous,
                      );
                    }}
                    className="adm-input"
                    {...errorProps("frais")}
                  />
                  <span>DA</span>
                </div>
                {renderFieldError("frais")}
                {saleDetails && statut === "vendue" && (
                  <label className="adm-check-inline">
                    <input
                      type="checkbox"
                      checked={saleDetails.frais_inconnus}
                      onChange={(event) => {
                        const checked = event.target.checked;
                        if (checked) setFrais("");
                        setSaleDetails((previous) =>
                          previous
                            ? {
                                ...previous,
                                frais_inconnus: checked,
                                frais: checked ? null : previous.frais,
                              }
                            : previous,
                        );
                      }}
                    />
                    Je ne sais pas
                  </label>
                )}
              </div>

              <div className="adm-field">
                <label htmlFor="car-finance-notes" className="adm-label">Notes privées</label>
                <textarea
                  id="car-finance-notes"
                  rows={3}
                  maxLength={5000}
                  value={financeNotes}
                  onChange={(event) => {
                    setFinanceNotes(event.target.value);
                    setSaleDetails((previous) =>
                      previous ? { ...previous, notes: event.target.value } : previous,
                    );
                  }}
                  className="adm-input"
                  {...errorProps("finance_notes")}
                />
                {renderFieldError("finance_notes")}
              </div>
            </div>
          </section>
        </aside>
      </div>

      {/* Sticky save bar */}
      <div className="adm-savebar">
        <p className="adm-savebar-status">
          {isUploadingFiles
            ? "Envoi des photos en cours…"
            : mode === "edit"
              ? "Les modifications seront visibles immédiatement sur le site."
              : "Le véhicule sera publié selon le statut choisi."}
        </p>
        <div className="flex gap-2">
          <Link href="/admin" className="adm-btn is-lg">
            Annuler
          </Link>
          <button type="submit" disabled={saving} className="adm-btn is-primary is-lg">
            {isPending && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
            {isPending ? "Enregistrement…" : mode === "edit" ? "Enregistrer" : "Créer le véhicule"}
          </button>
        </div>
      </div>

      {saleDialogOpen && initialCar && (
        <SaleConfirmationDialog
          key={initialCar.id}
          listedPrice={prix.trim() ? Number(prix) : initialCar.prix}
          initialFinance={{
            car_id: initialCar.id,
            prix_achat: prixAchat ? Number(prixAchat) : null,
            frais: frais ? Number(frais) : null,
            prix_vente: initialFinance?.prix_vente ?? null,
            date_vente: initialFinance?.date_vente ?? null,
            acheteur: initialFinance?.acheteur ?? null,
            notes: financeNotes,
          }}
          pending={isPending}
          onCancel={() => setSaleDialogOpen(false)}
          onConfirm={confirmSale}
        />
      )}
      {reversalDialogOpen && (
        <SaleReversalDialog
          pending={isPending}
          onCancel={() => setReversalDialogOpen(false)}
          onChoose={confirmSaleReversal}
        />
      )}
    </form>
  );
}
