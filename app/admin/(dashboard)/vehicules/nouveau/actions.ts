"use server";

import { requireShowroomOwner } from "@/app/data/admin-auth.server";
import { createClient } from "@/utils/supabase/server";

export type VehicleField =
  | "make"
  | "model"
  | "version"
  | "engine"
  | "year"
  | "slug"
  | "fuelType"
  | "transmission"
  | "mileageKm"
  | "color"
  | "priceDzd"
  | "status"
  | "description"
  | "imageUrls"
  | "features";

export type CreateVehicleResult =
  | { success: true }
  | {
      success: false;
      message: string;
      fieldErrors?: Partial<Record<VehicleField, string>>;
    };

const fuelTypes = ["diesel", "essence", "hybrid", "electric"] as const;
const transmissions = ["Automatique", "Manuelle"] as const;
const statuses = ["draft", "available"] as const;

function textValue(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : null;
}

function isHttpsUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" && !url.username && !url.password;
  } catch {
    return false;
  }
}

function parseStringArray(value: string | null): string[] | null {
  if (value === null || value.length > 100_000) return null;

  try {
    const parsed: unknown = JSON.parse(value);
    if (!Array.isArray(parsed) || !parsed.every((item) => typeof item === "string")) {
      return null;
    }
    return parsed.map((item) => item.trim()).filter(Boolean);
  } catch {
    return null;
  }
}

function createSlug(value: string) {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function createVehicleAction(
  formData: FormData,
): Promise<CreateVehicleResult> {
  await requireShowroomOwner();

  const makeValue = textValue(formData, "make");
  const modelValue = textValue(formData, "model");
  const version = textValue(formData, "version");
  const engine = textValue(formData, "engine");
  const yearValue = textValue(formData, "year");
  const requestedSlug = textValue(formData, "slug");
  const fuelType = textValue(formData, "fuelType");
  const transmission = textValue(formData, "transmission");
  const mileageValue = textValue(formData, "mileageKm");
  const color = textValue(formData, "color");
  const priceValue = textValue(formData, "priceDzd");
  const status = textValue(formData, "status");
  const description = textValue(formData, "description");
  const imageUrls = parseStringArray(textValue(formData, "imageUrlsJson"));
  const features = parseStringArray(textValue(formData, "featuresJson"));
  const coverValue = textValue(formData, "coverImageUrl");
  const fieldErrors: Partial<Record<VehicleField, string>> = {};

  if (!makeValue) fieldErrors.make = "Saisissez la marque du véhicule.";
  else if (makeValue.length > 120) fieldErrors.make = "La marque ne peut pas dépasser 120 caractères.";
  if (!modelValue) fieldErrors.model = "Saisissez le modèle exact.";
  else if (modelValue.length > 120) fieldErrors.model = "Le modèle ne peut pas dépasser 120 caractères.";
  if (version === null || version.length > 160) fieldErrors.version = "La version ne peut pas dépasser 160 caractères.";
  if (engine === null || engine.length > 200) fieldErrors.engine = "La motorisation ne peut pas dépasser 200 caractères.";
  if (!yearValue) {
    fieldErrors.year = "L’année est obligatoire.";
  } else {
    const year = Number(yearValue);
    if (!Number.isInteger(year) || year < 1886 || year > new Date().getUTCFullYear() + 1) {
      fieldErrors.year = "Saisissez une année valide.";
    }
  }
  if (requestedSlug === null || requestedSlug.length > 180) {
    fieldErrors.slug = "L’identifiant URL ne peut pas dépasser 180 caractères.";
  }
  if (!fuelTypes.includes(fuelType as (typeof fuelTypes)[number])) {
    fieldErrors.fuelType = "Sélectionnez un type de carburant valide.";
  }
  if (!transmissions.includes(transmission as (typeof transmissions)[number])) {
    fieldErrors.transmission = "Sélectionnez une transmission valide.";
  }
  if (!mileageValue) {
    fieldErrors.mileageKm = "Le kilométrage est obligatoire.";
  } else {
    const mileage = Number(mileageValue);
    if (!Number.isSafeInteger(mileage) || mileage < 0 || mileage > 2_147_483_647) {
      fieldErrors.mileageKm = "Saisissez un kilométrage entier positif.";
    }
  }
  if (color === null || color.length > 120) fieldErrors.color = "La couleur ne peut pas dépasser 120 caractères.";
  if (!priceValue) {
    fieldErrors.priceDzd = "Le prix en DZD est obligatoire.";
  } else {
    const price = Number(priceValue);
    if (!Number.isSafeInteger(price) || price < 0 || price > 999_999_999_999) {
      fieldErrors.priceDzd = "Saisissez un montant entier positif en DZD.";
    }
  }
  if (!statuses.includes(status as (typeof statuses)[number])) {
    fieldErrors.status = "Sélectionnez un statut valide.";
  }
  if (description === null || description.length > 10_000) {
    fieldErrors.description = "La description ne peut pas dépasser 10 000 caractères.";
  }

  if (!imageUrls || imageUrls.length > 30 || imageUrls.some((url) => url.length > 2048 || !isHttpsUrl(url))) {
    fieldErrors.imageUrls = "La galerie doit contenir au maximum 30 URL HTTPS valides.";
  }
  if (!features || features.length > 80 || features.some((feature) => feature.length > 120)) {
    fieldErrors.features = "La liste des équipements est invalide.";
  }
  const uniqueImageUrls = imageUrls ? [...new Set(imageUrls)] : [];
  const uniqueFeatures = features ? [...new Set(features)] : [];
  const coverImageUrl = coverValue || null;

  if (coverImageUrl && !uniqueImageUrls.includes(coverImageUrl)) {
    fieldErrors.imageUrls = "La photo de couverture doit faire partie de la galerie.";
  }
  if (status === "available" && (!coverImageUrl || uniqueImageUrls.length === 0)) {
    fieldErrors.imageUrls = "Ajoutez une photo et choisissez une couverture pour publier.";
  }

  const make = makeValue ?? "";
  const model = modelValue ?? "";
  const year = Number(yearValue);
  const slug = (requestedSlug || createSlug(`${make} ${model} ${version ?? ""} ${year}`)).toLowerCase();
  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug)) {
    fieldErrors.slug = "Utilisez un identifiant en lettres sans accent, chiffres et tirets.";
  }

  if (Object.keys(fieldErrors).length > 0) {
    return {
      success: false,
      message: "Vérifiez les champs signalés avant de créer le véhicule.",
      fieldErrors,
    };
  }

  try {
    const supabase = await createClient();
    const { error } = await supabase.from("vehicles").insert({
      slug,
      make,
      model,
      version: version ?? "",
      year,
      price_dzd: Number(priceValue),
      mileage_km: Number(mileageValue),
      engine: engine ?? "",
      fuel_type: fuelType,
      transmission,
      color: color ?? "",
      description: description ?? "",
      features: uniqueFeatures,
      image_urls: uniqueImageUrls,
      cover_image_url: coverImageUrl,
      status,
    });

    if (error) {
      console.error("Vehicle creation failed:", { code: error.code });
      if (error.code === "23505") {
        return {
          success: false,
          message: "Un véhicule avec cet identifiant existe déjà. Modifiez l’identifiant URL.",
          fieldErrors: { slug: "Cet identifiant URL est déjà utilisé." },
        };
      }
      if (error.code === "42501") {
        return {
          success: false,
          message: "Vous n’êtes pas autorisé à ajouter des véhicules.",
        };
      }
      return {
        success: false,
        message: "Le véhicule n’a pas pu être enregistré. Vos informations sont conservées ; réessayez.",
      };
    }

    return { success: true };
  } catch (error) {
    console.error("Vehicle creation request failed:", {
      name: error instanceof Error ? error.name : "UnknownError",
    });
    return {
      success: false,
      message: "Le service est temporairement indisponible. Vos informations sont conservées ; réessayez.",
    };
  }
}