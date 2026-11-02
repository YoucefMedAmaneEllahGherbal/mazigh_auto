"use client";

import {
  type ChangeEvent,
  type FormEvent,
  useEffect,
  useRef,
  useState,
  useTransition,
} from "react";
import { useRouter } from "next/navigation";
import { createVehicleAction } from "./actions";

const fuelOptions = [
  ["diesel", "Diesel"],
  ["essence", "Essence"],
  ["hybrid", "Hybride"],
  ["electric", "Électrique"],
] as const;

const transmissionOptions = ["Automatique", "Manuelle"] as const;
const statusOptions = ["draft", "available"] as const;

const featureOptions = [
  "Climatisation automatique",
  "Caméra de recul",
  "Capteurs de stationnement",
  "Régulateur de vitesse",
  "Écran multimédia",
  "Navigation GPS",
  "Toit ouvrant panoramique",
  "Sièges chauffants",
  "Entrée sans clé",
  "Aide au stationnement",
  "Apple CarPlay",
  "Android Auto",
  "Bluetooth",
  "ABS",
  "Airbags",
  "Jantes alliage",
  "Phares LED",
  "Caméra 360°",
  "Démarrage sans clé",
  "Sièges électriques",
];

const STORAGE_KEY = "mazigh-auto:admin:vehicle-create:v1";
const STORAGE_VERSION = 1;

type FormValues = {
  make: string;
  model: string;
  version: string;
  engine: string;
  year: string;
  slug: string;
  fuelType: string;
  transmission: string;
  mileageKm: string;
  color: string;
  priceDzd: string;
  status: string;
  description: string;
};

type FormDraft = {
  version: number;
  values: FormValues;
  features: string[];
  imageUrls: string[];
  coverImageUrl: string;
  customFeatureInput: string;
  imageUrlInput: string;
};

type FormField = keyof FormValues | "imageUrls" | "features";
type FieldErrors = Partial<Record<FormField, string>>;
type VehicleSuggestions = { make: string; models: string[] }[];

const emptyValues: FormValues = {
  make: "",
  model: "",
  version: "",
  engine: "",
  year: "",
  slug: "",
  fuelType: "",
  transmission: "",
  mileageKm: "",
  color: "",
  priceDzd: "",
  status: "draft",
  description: "",
};

function emptyDraft(): FormDraft {
  return {
    version: STORAGE_VERSION,
    values: { ...emptyValues },
    features: [],
    imageUrls: [],
    coverImageUrl: "",
    customFeatureInput: "",
    imageUrlInput: "",
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isHttpsUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" && !url.username && !url.password;
  } catch {
    return false;
  }
}

function parseSavedDraft(raw: string): FormDraft | null {
  if (raw.length > 500_000) return null;

  try {
    const parsed: unknown = JSON.parse(raw);
    if (
      !isRecord(parsed) ||
      parsed.version !== STORAGE_VERSION ||
      !isRecord(parsed.values) ||
      !Array.isArray(parsed.features) ||
      !parsed.features.every((item) => typeof item === "string") ||
      !Array.isArray(parsed.imageUrls) ||
      !parsed.imageUrls.every((item) => typeof item === "string") ||
      typeof parsed.coverImageUrl !== "string" ||
      typeof parsed.customFeatureInput !== "string" ||
      typeof parsed.imageUrlInput !== "string"
    ) {
      return null;
    }

    const values = { ...emptyValues };
    for (const key of Object.keys(emptyValues) as (keyof FormValues)[]) {
      const value = parsed.values[key];
      if (typeof value !== "string") return null;
      values[key] = value;
    }

    const imageUrls = [...new Set(
      parsed.imageUrls
        .filter((url): url is string => url.length <= 2048 && isHttpsUrl(url))
        .slice(0, 30),
    )];
    const features = [...new Set(
      parsed.features
        .filter((feature): feature is string => feature.trim().length > 0 && feature.length <= 120)
        .slice(0, 80),
    )];

    return {
      version: STORAGE_VERSION,
      values,
      features,
      imageUrls,
      coverImageUrl: imageUrls.includes(parsed.coverImageUrl)
        ? parsed.coverImageUrl
        : (imageUrls[0] ?? ""),
      customFeatureInput: parsed.customFeatureInput.slice(0, 120),
      imageUrlInput: parsed.imageUrlInput.slice(0, 2048),
    };
  } catch {
    return null;
  }
}

function hasProgress(draft: FormDraft) {
  return (
    Object.entries(draft.values).some(
      ([key, value]) => key !== "status" && value.trim() !== "",
    ) ||
    draft.values.status !== "draft" ||
    draft.features.length > 0 ||
    draft.imageUrls.length > 0 ||
    draft.customFeatureInput.trim() !== "" ||
    draft.imageUrlInput.trim() !== ""
  );
}

function validateDraft(draft: FormDraft): FieldErrors {
  const { values, imageUrls, coverImageUrl } = draft;
  const errors: FieldErrors = {};
  const year = Number(values.year);
  const price = Number(values.priceDzd);
  const mileage = Number(values.mileageKm);

  if (!values.make.trim()) errors.make = "Saisissez la marque du véhicule.";
  if (!values.model.trim()) errors.model = "Saisissez le modèle exact.";
  if (!values.year.trim()) {
    errors.year = "L’année est obligatoire.";
  } else if (
    !Number.isInteger(year) ||
    year < 1886 ||
    year > new Date().getUTCFullYear() + 1
  ) {
    errors.year = "Saisissez une année valide.";
  }
  if (!values.priceDzd.trim()) {
    errors.priceDzd = "Le prix est obligatoire.";
  } else if (!Number.isSafeInteger(price) || price < 0 || price > 999_999_999_999) {
    errors.priceDzd = "Saisissez un montant entier positif en DZD.";
  }
  if (!values.mileageKm.trim()) {
    errors.mileageKm = "Le kilométrage est obligatoire.";
  } else if (!Number.isSafeInteger(mileage) || mileage < 0 || mileage > 2_147_483_647) {
    errors.mileageKm = "Saisissez un kilométrage entier positif.";
  }
  if (!fuelOptions.some(([value]) => value === values.fuelType)) {
    errors.fuelType = "Sélectionnez un type de carburant.";
  }
  if (!transmissionOptions.includes(values.transmission as (typeof transmissionOptions)[number])) {
    errors.transmission = "Sélectionnez une transmission.";
  }
  if (!statusOptions.includes(values.status as (typeof statusOptions)[number])) {
    errors.status = "Sélectionnez un statut valide.";
  }
  if (values.slug.trim() && !/^[a-z0-9]+(-[a-z0-9]+)*$/i.test(values.slug.trim())) {
    errors.slug = "Utilisez des lettres sans accent, chiffres et tirets.";
  }
  if (imageUrls.some((url) => !isHttpsUrl(url))) {
    errors.imageUrls = "Chaque photo doit utiliser une adresse HTTPS valide.";
  } else if (coverImageUrl && !imageUrls.includes(coverImageUrl)) {
    errors.imageUrls = "Choisissez une couverture présente dans la galerie.";
  } else if (values.status === "available" && (!coverImageUrl || imageUrls.length === 0)) {
    errors.imageUrls = "Ajoutez une photo et choisissez une couverture pour publier.";
  }

  return errors;
}

function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return <p className="admin-field-error" id={`${id}-error`}>{message}</p>;
}

export function VehicleCreationForm({
  suggestions = [],
}: {
  suggestions?: VehicleSuggestions;
}) {
  const router = useRouter();
  const [draft, setDraft] = useState<FormDraft>(emptyDraft);
  const [isRestored, setIsRestored] = useState(false);
  const [storageAvailable, setStorageAvailable] = useState<boolean | null>(null);
  const [autosaveEnabled, setAutosaveEnabled] = useState(true);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [submissionError, setSubmissionError] = useState("");
  const [imageInputError, setImageInputError] = useState("");
  const [brokenPreviews, setBrokenPreviews] = useState<string[]>([]);
  const [isPending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);
  const submittingRef = useRef(false);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      try {
        const raw = window.localStorage.getItem(STORAGE_KEY);
        if (raw) {
          const restored = parseSavedDraft(raw);
          if (restored) {
            setDraft(restored);
          } else {
            window.localStorage.removeItem(STORAGE_KEY);
          }
        }
        setStorageAvailable(true);
      } catch {
        setStorageAvailable(false);
      }
      setIsRestored(true);
    });
    return () => window.cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    if (!isRestored || !autosaveEnabled) return;

    const timeout = window.setTimeout(() => {
      try {
        if (hasProgress(draft)) {
          window.localStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
        } else {
          window.localStorage.removeItem(STORAGE_KEY);
        }
        setStorageAvailable(true);
      } catch {
        setStorageAvailable(false);
      }
    }, 250);

    return () => window.clearTimeout(timeout);
  }, [autosaveEnabled, draft, isRestored]);

  useEffect(() => {
    if (!isRestored || !autosaveEnabled) return;

    function saveBeforePageHide() {
      try {
        if (hasProgress(draft)) {
          window.localStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
        } else {
          window.localStorage.removeItem(STORAGE_KEY);
        }
      } catch {
        // Storage may be disabled; the in-memory form remains usable.
      }
    }

    window.addEventListener("pagehide", saveBeforePageHide);
    return () => window.removeEventListener("pagehide", saveBeforePageHide);
  }, [autosaveEnabled, draft, isRestored]);

  useEffect(() => {
    if (Object.keys(fieldErrors).length === 0) return;
    const frame = window.requestAnimationFrame(() => {
      const firstInvalid = formRef.current?.querySelector<HTMLElement>(
        '[aria-invalid="true"]',
      );
      firstInvalid?.scrollIntoView({ behavior: "smooth", block: "center" });
      firstInvalid?.focus({ preventScroll: true });
    });
    return () => window.cancelAnimationFrame(frame);
  }, [fieldErrors]);

  function updateDraft(update: (current: FormDraft) => FormDraft) {
    setAutosaveEnabled(true);
    setDraft(update);
  }

  function updateField(field: keyof FormValues, value: string) {
    updateDraft((current) => ({
      ...current,
      values: { ...current.values, [field]: value },
    }));
    setFieldErrors((current) => {
      if (!current[field]) return current;
      const next = { ...current };
      delete next[field];
      return next;
    });
    setSubmissionError("");
  }

  function toggleFeature(feature: string) {
    updateDraft((current) => ({
      ...current,
      features: current.features.includes(feature)
        ? current.features.filter((item) => item !== feature)
        : [...current.features, feature],
    }));
  }

  function addCustomFeature() {
    const feature = draft.customFeatureInput.trim();
    if (feature && !draft.features.includes(feature)) {
      updateDraft((current) => ({
        ...current,
        features: [...current.features, feature],
        customFeatureInput: "",
      }));
    }
  }

  function addImageUrl() {
    const url = draft.imageUrlInput.trim();
    if (!isHttpsUrl(url)) {
      setImageInputError("Saisissez une URL HTTPS valide, sans identifiant ni mot de passe.");
      return;
    }
    if (draft.imageUrls.includes(url)) {
      setImageInputError("Cette photo est déjà dans la galerie.");
      return;
    }
    if (draft.imageUrls.length >= 30) {
      setImageInputError("La galerie est limitée à 30 photos.");
      return;
    }

    updateDraft((current) => ({
      ...current,
      imageUrls: [...current.imageUrls, url],
      coverImageUrl: current.coverImageUrl || url,
      imageUrlInput: "",
    }));
    setImageInputError("");
    setFieldErrors((current) => {
      if (!current.imageUrls) return current;
      const next = { ...current };
      delete next.imageUrls;
      return next;
    });
  }

  function removeImage(url: string) {
    updateDraft((current) => {
      const imageUrls = current.imageUrls.filter((item) => item !== url);
      return {
        ...current,
        imageUrls,
        coverImageUrl: current.coverImageUrl === url
          ? (imageUrls[0] ?? "")
          : current.coverImageUrl,
      };
    });
    setBrokenPreviews((current) => current.filter((item) => item !== url));
  }

  function removeSavedDraft() {
    setAutosaveEnabled(false);
    try {
      window.localStorage.removeItem(STORAGE_KEY);
      setStorageAvailable(true);
    } catch {
      setStorageAvailable(false);
    }
  }

  function discardDraft() {
    if (
      hasProgress(draft) &&
      !window.confirm("Effacer toutes les informations saisies pour ce véhicule ?")
    ) {
      return;
    }
    removeSavedDraft();
    setDraft(emptyDraft());
    setFieldErrors({});
    setSubmissionError("");
    setImageInputError("");
    setBrokenPreviews([]);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!isRestored || isPending || submittingRef.current) return;

    setSubmissionError("");
    const clientErrors = validateDraft(draft);
    if (Object.keys(clientErrors).length > 0) {
      setFieldErrors(clientErrors);
      return;
    }

    setFieldErrors({});
    submittingRef.current = true;
    const formData = new FormData(event.currentTarget);

    startTransition(async () => {
      try {
        const result = await createVehicleAction(formData);
        if (!result.success) {
          setFieldErrors(result.fieldErrors ?? {});
          setSubmissionError(result.message);
          return;
        }

        removeSavedDraft();
        setDraft(emptyDraft());
        router.replace("/admin?created=1");
      } catch {
        setSubmissionError(
          "La demande n’a pas abouti. Vos informations sont conservées ; vérifiez votre connexion puis réessayez.",
        );
      } finally {
        submittingRef.current = false;
      }
    });
  }

  const customFeatures = draft.features.filter(
    (feature) => !featureOptions.includes(feature),
  );
  const selectedMake = suggestions.find(
    (suggestion) => suggestion.make.toLowerCase() === draft.values.make.trim().toLowerCase(),
  );
  const modelSuggestions = selectedMake?.models ?? [];

  function fieldProps(field: keyof FormValues, id: string) {
    const message = fieldErrors[field];
    return {
      id,
      name: field,
      value: draft.values[field],
      onChange: (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
        updateField(field, event.target.value),
      "aria-invalid": Boolean(message),
      "aria-describedby": message ? `${id}-error` : undefined,
    };
  }

  return (
    <form
      ref={formRef}
      className="admin-vehicle-form"
      onSubmit={handleSubmit}
      noValidate
      aria-busy={!isRestored || isPending}
    >
      <div className="admin-draft-toolbar">
        <p className="admin-draft-status" role="status" aria-live="polite">
          {!isRestored
            ? "Restauration du brouillon…"
            : storageAvailable === false
              ? "Sauvegarde locale indisponible : le formulaire reste utilisable."
              : "Sauvegarde automatique activée sur cet appareil."}
        </p>
        <button
          className="admin-discard-button"
          type="button"
          onClick={discardDraft}
          disabled={!isRestored || isPending}
        >
          Effacer le formulaire
        </button>
      </div>

      <input type="hidden" name="featuresJson" value={JSON.stringify(draft.features)} />
      <input type="hidden" name="imageUrlsJson" value={JSON.stringify(draft.imageUrls)} />
      <input type="hidden" name="coverImageUrl" value={draft.coverImageUrl} />

      <fieldset className="admin-form-section" disabled={!isRestored || isPending}>
        <legend>Identification du véhicule</legend>
        <div className="admin-vehicle-form-grid">
          <div className="admin-form-field">
            <label htmlFor="vehicle-make">Marque <span className="admin-required">Obligatoire</span></label>
            <input
              {...fieldProps("make", "vehicle-make")}
              list="vehicle-make-suggestions"
              autoComplete="off"
              maxLength={120}
              aria-describedby={`vehicle-make-help${fieldErrors.make ? " vehicle-make-error" : ""}`}
            />
            <datalist id="vehicle-make-suggestions">
              {suggestions.map(({ make }) => <option key={make} value={make} />)}
            </datalist>
            <p className="admin-form-hint" id="vehicle-make-help">
              Saisie libre acceptée. Les suggestions viennent de l’inventaire et ne sont pas exhaustives.
            </p>
            <FieldError id="vehicle-make" message={fieldErrors.make} />
          </div>

          <div className="admin-form-field">
            <label htmlFor="vehicle-model">Modèle <span className="admin-required">Obligatoire</span></label>
            <input
              {...fieldProps("model", "vehicle-model")}
              list={modelSuggestions.length > 0 ? "vehicle-model-suggestions" : undefined}
              autoComplete="off"
              maxLength={120}
              placeholder="Saisissez le modèle exact"
            />
            {modelSuggestions.length > 0 && (
              <datalist id="vehicle-model-suggestions">
                {modelSuggestions.map((model) => <option key={model} value={model} />)}
              </datalist>
            )}
            <FieldError id="vehicle-model" message={fieldErrors.model} />
          </div>

          <div className="admin-form-field">
            <label htmlFor="vehicle-version">Version <span className="admin-optional">Facultatif</span></label>
            <input {...fieldProps("version", "vehicle-version")} maxLength={160} />
          </div>
          <div className="admin-form-field">
            <label htmlFor="vehicle-year">Année <span className="admin-required">Obligatoire</span></label>
            <input
              {...fieldProps("year", "vehicle-year")}
              type="number"
              min={1886}
              max={new Date().getUTCFullYear() + 1}
              step={1}
              placeholder={String(new Date().getUTCFullYear())}
            />
            <FieldError id="vehicle-year" message={fieldErrors.year} />
          </div>
          <div className="admin-form-field">
            <label htmlFor="vehicle-slug">Identifiant URL <span className="admin-optional">Facultatif</span></label>
            <input
              {...fieldProps("slug", "vehicle-slug")}
              maxLength={180}
              placeholder="Généré automatiquement si vide"
              aria-describedby={`vehicle-slug-help${fieldErrors.slug ? " vehicle-slug-error" : ""}`}
            />
            <p className="admin-form-hint" id="vehicle-slug-help">Les noms non latins peuvent nécessiter un identifiant URL latin.</p>
            <FieldError id="vehicle-slug" message={fieldErrors.slug} />
          </div>
          <div className="admin-form-field">
            <label htmlFor="vehicle-engine">Motorisation <span className="admin-optional">Facultatif</span></label>
            <input
              {...fieldProps("engine", "vehicle-engine")}
              maxLength={200}
              placeholder="Saisissez la spécification vérifiée"
              aria-describedby="vehicle-engine-help"
            />
            <p className="admin-form-hint" id="vehicle-engine-help">Aucune caractéristique n’est déduite des suggestions.</p>
          </div>
        </div>
      </fieldset>

      <fieldset className="admin-form-section" disabled={!isRestored || isPending}>
        <legend>Caractéristiques techniques</legend>
        <div className="admin-vehicle-form-grid">
          <div className="admin-form-field">
            <label htmlFor="vehicle-fuel">Carburant <span className="admin-required">Obligatoire</span></label>
            <select {...fieldProps("fuelType", "vehicle-fuel")}>
              <option value="">Sélectionner</option>
              {fuelOptions.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
            </select>
            <FieldError id="vehicle-fuel" message={fieldErrors.fuelType} />
          </div>
          <div className="admin-form-field">
            <label htmlFor="vehicle-transmission">Transmission <span className="admin-required">Obligatoire</span></label>
            <select {...fieldProps("transmission", "vehicle-transmission")}>
              <option value="">Sélectionner</option>
              {transmissionOptions.map((value) => <option key={value} value={value}>{value}</option>)}
            </select>
            <FieldError id="vehicle-transmission" message={fieldErrors.transmission} />
          </div>
          <div className="admin-form-field">
            <label htmlFor="vehicle-mileage">Kilométrage (km) <span className="admin-required">Obligatoire</span></label>
            <input
              {...fieldProps("mileageKm", "vehicle-mileage")}
              type="number"
              min={0}
              max={2147483647}
              step={1}
              placeholder="Ex. 32 000"
            />
            <FieldError id="vehicle-mileage" message={fieldErrors.mileageKm} />
          </div>
          <div className="admin-form-field">
            <label htmlFor="vehicle-color">Couleur <span className="admin-optional">Facultatif</span></label>
            <input {...fieldProps("color", "vehicle-color")} maxLength={120} />
          </div>
        </div>
      </fieldset>

      <fieldset className="admin-form-section" disabled={!isRestored || isPending}>
        <legend>Équipements</legend>
        <p className="admin-form-hint admin-section-hint">Sélectionnez uniquement les équipements vérifiés sur ce véhicule.</p>
        <div
          className="admin-feature-options"
          aria-invalid={Boolean(fieldErrors.features)}
          aria-describedby={fieldErrors.features ? "vehicle-features-error" : undefined}
          tabIndex={fieldErrors.features ? -1 : undefined}
        >
          {featureOptions.map((feature) => (
            <label
              className={`admin-equipment-chip${draft.features.includes(feature) ? " is-selected" : ""}`}
              key={feature}
            >
              <input
                type="checkbox"
                checked={draft.features.includes(feature)}
                onChange={() => toggleFeature(feature)}
              />
              <span>{feature}</span>
            </label>
          ))}
        </div>
        <FieldError id="vehicle-features" message={fieldErrors.features} />
        <div className="admin-inline-entry">
          <label className="admin-visually-hidden" htmlFor="custom-feature">Équipement personnalisé</label>
          <input
            id="custom-feature"
            value={draft.customFeatureInput}
            maxLength={120}
            onChange={(event) => updateDraft((current) => ({ ...current, customFeatureInput: event.target.value }))}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                addCustomFeature();
              }
            }}
            placeholder="Ajouter un équipement personnalisé"
          />
          <button
            className="secondary-button admin-action-button"
            type="button"
            onClick={addCustomFeature}
            disabled={!draft.customFeatureInput.trim()}
          >Ajouter</button>
        </div>
        {customFeatures.length > 0 && (
          <ul className="admin-custom-features" aria-label="Équipements personnalisés">
            {customFeatures.map((feature) => (
              <li key={feature}>
                <span>{feature}</span>
                <button
                  type="button"
                  className="admin-remove-button"
                  aria-label={`Retirer ${feature}`}
                  onClick={() => toggleFeature(feature)}
                >Retirer</button>
              </li>
            ))}
          </ul>
        )}
      </fieldset>

      <fieldset className="admin-form-section" disabled={!isRestored || isPending}>
        <legend>Prix et publication</legend>
        <div className="admin-vehicle-form-grid">
          <div className="admin-form-field">
            <label htmlFor="vehicle-price">Prix (DZD) <span className="admin-required">Obligatoire</span></label>
            <input
              {...fieldProps("priceDzd", "vehicle-price")}
              type="number"
              min={0}
              max={999999999999}
              step={1}
              placeholder="Ex. 4 490 000"
            />
            <FieldError id="vehicle-price" message={fieldErrors.priceDzd} />
          </div>
          <div className="admin-form-field">
            <label htmlFor="vehicle-status">Statut <span className="admin-required">Obligatoire</span></label>
            <select {...fieldProps("status", "vehicle-status")}>
              <option value="draft">Brouillon</option>
              <option value="available">Disponible à la vente</option>
            </select>
            <FieldError id="vehicle-status" message={fieldErrors.status} />
          </div>
          <div className="admin-form-field admin-form-span-2">
            <label htmlFor="vehicle-description">Description <span className="admin-optional">Facultatif</span></label>
            <textarea
              {...fieldProps("description", "vehicle-description")}
              rows={5}
              maxLength={10000}
              placeholder="Décrivez le véhicule et son état avec des informations vérifiées."
            />
          </div>
        </div>
      </fieldset>

      <fieldset className="admin-form-section" disabled={!isRestored || isPending}>
        <legend>Photos du véhicule</legend>
        <p className="admin-form-hint admin-section-hint">
          Import direct indisponible. Ajoutez des URL HTTPS accessibles publiquement ; aucune photo n’est téléversée depuis votre appareil.
        </p>
        <div
          className="admin-inline-entry"
          id="vehicle-images-field"
          aria-invalid={Boolean(fieldErrors.imageUrls)}
          tabIndex={fieldErrors.imageUrls ? -1 : undefined}
        >
          <label className="admin-visually-hidden" htmlFor="vehicle-image-url">URL de la photo</label>
          <input
            id="vehicle-image-url"
            type="url"
            value={draft.imageUrlInput}
            onChange={(event) => {
              updateDraft((current) => ({ ...current, imageUrlInput: event.target.value }));
              setImageInputError("");
            }}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                addImageUrl();
              }
            }}
            placeholder="https://exemple.com/photo.jpg"
            aria-describedby={fieldErrors.imageUrls ? "vehicle-images-error" : undefined}
          />
          <button
            className="secondary-button admin-action-button"
            type="button"
            onClick={addImageUrl}
            disabled={!draft.imageUrlInput.trim()}
          >Ajouter la photo</button>
        </div>
        {imageInputError && <p className="admin-field-error" role="alert">{imageInputError}</p>}
        <FieldError id="vehicle-images" message={fieldErrors.imageUrls} />

        {draft.imageUrls.length > 0 && (
          <ul className="admin-image-list" aria-label="Galerie du véhicule">
            {draft.imageUrls.map((url, index) => (
              <li className="admin-image-item" key={url}>
                <div className="admin-image-preview">
                  {brokenPreviews.includes(url)
                    ? <span>Aperçu indisponible</span>
                    : (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={url} alt={`Aperçu de la photo ${index + 1}`} onError={() => setBrokenPreviews((current) => current.includes(url) ? current : [...current, url])} />
                    )}
                  {draft.coverImageUrl === url && <span className="admin-cover-badge">Photo de couverture</span>}
                </div>
                <div className="admin-image-details">
                  <span className="admin-image-index">Photo {index + 1}</span>
                  <a href={url} target="_blank" rel="noreferrer">{url}</a>
                  <div className="admin-image-actions">
                    <button
                      className="secondary-button admin-action-button"
                      type="button"
                      aria-pressed={draft.coverImageUrl === url}
                      onClick={() => updateDraft((current) => ({ ...current, coverImageUrl: url }))}
                    >{draft.coverImageUrl === url ? "Couverture sélectionnée" : "Choisir comme couverture"}</button>
                    <button
                      className="admin-remove-button"
                      type="button"
                      onClick={() => removeImage(url)}
                      aria-label={`Retirer la photo ${index + 1}`}
                    >Retirer</button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </fieldset>

      {submissionError && <p className="admin-form-error" role="alert">{submissionError}</p>}

      <div className="admin-form-footer">
        <a href="/admin" className="secondary-button">Annuler</a>
        <button className="primary-button" type="submit" disabled={!isRestored || isPending}>
          {isPending ? "Enregistrement…" : "Créer le véhicule"}
        </button>
      </div>
      {isPending && <p className="admin-submit-status" role="status">Enregistrement du véhicule… Ne fermez pas cette page.</p>}
    </form>
  );
}