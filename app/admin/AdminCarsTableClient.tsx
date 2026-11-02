"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CarImage } from "@/app/components/CarImage";
import type { Car, CarFuel, CarStatus, CarTransmission } from "@/app/data/cars";
import {
  formatPriceDZD,
  formatKm,
  STATUS_LABELS,
} from "@/app/data/cars";
import type { CarFinance, CarSaleDetails } from "@/app/data/car-finances";
import { deleteCarAction, toggleCarFeaturedAction, updateCarStatusAction } from "./car-actions";
import { ChevronDown, Eye, Filter, Pencil, RotateCcw, Star, Trash2, X } from "lucide-react";
import { SaleConfirmationDialog } from "./SaleConfirmationDialog";
import { SaleReversalDialog } from "./SaleReversalDialog";

type AdminCarsTableClientProps = {
  initialCars: Car[];
  initialFinances: CarFinance[];
};

type CarFilters = {
  q: string;
  marque: string;
  carburant: string;
  boite: string;
  carrosserie: string;
  statut: string;
  vedette: string;
  prixMin: string;
  prixMax: string;
  anneeMin: string;
  anneeMax: string;
  tri: string;
};

const DEFAULT_FILTERS: CarFilters = {
  q: "",
  marque: "",
  carburant: "",
  boite: "",
  carrosserie: "",
  statut: "",
  vedette: "",
  prixMin: "",
  prixMax: "",
  anneeMin: "",
  anneeMax: "",
  tri: "recentes",
};

const FILTER_PARAMS = Object.keys(DEFAULT_FILTERS) as (keyof CarFilters)[];
const SORT_OPTIONS = [
  ["recentes", "Plus récentes"],
  ["prix_asc", "Prix croissant"],
  ["prix_desc", "Prix décroissant"],
  ["annee_desc", "Année"],
  ["anciennes_stock", "Plus anciennes en stock"],
] as const;

function readFilters(params: URLSearchParams): CarFilters {
  const filters = { ...DEFAULT_FILTERS };
  for (const key of FILTER_PARAMS) {
    const value = params.get(key);
    if (value !== null) filters[key] = value;
  }
  if (!SORT_OPTIONS.some(([value]) => value === filters.tri)) {
    filters.tri = DEFAULT_FILTERS.tri;
  }
  return filters;
}

function dateInAlgiers(date: Date) {
  const parts = new Intl.DateTimeFormat("en", {
    timeZone: "Africa/Algiers",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const part = (type: string) => parts.find((value) => value.type === type)?.value ?? "";
  return `${part("year")}-${part("month")}-${part("day")}`;
}

function getStockDays(car: Car, finance?: CarFinance) {
  const startedAt = dateInAlgiers(new Date(car.created_at));
  const endedAt =
    car.statut === "vendue" && finance?.date_vente
      ? finance.date_vente.slice(0, 10)
      : dateInAlgiers(new Date());
  const start = Date.parse(`${startedAt}T00:00:00Z`);
  const end = Date.parse(`${endedAt}T00:00:00Z`);
  if (!Number.isFinite(start)) return null;
  return Math.max(0, Math.floor((end - start) / 86_400_000));
}

export function AdminCarsTableClient({
  initialCars,
  initialFinances,
}: AdminCarsTableClientProps) {
  const searchParams = useSearchParams();
  const searchParamsKey = searchParams.toString();
  const filters = useMemo(
    () => readFilters(new URLSearchParams(searchParamsKey)),
    [searchParamsKey],
  );
  const [showFiltersMobile, setShowFiltersMobile] = useState(false);
  const [cars, setCars] = useState<Car[]>(initialCars);
  const [prevInitialCars, setPrevInitialCars] = useState<Car[]>(initialCars);
  const [finances, setFinances] = useState<CarFinance[]>(initialFinances);
  const [prevInitialFinances, setPrevInitialFinances] =
    useState<CarFinance[]>(initialFinances);
  const [confirmSaleCar, setConfirmSaleCar] = useState<Car | null>(null);
  const [confirmSaleReversalCar, setConfirmSaleReversalCar] = useState<Car | null>(null);

  if (initialCars !== prevInitialCars) {
    setPrevInitialCars(initialCars);
    setCars(initialCars);
  }
  if (initialFinances !== prevInitialFinances) {
    setPrevInitialFinances(initialFinances);
    setFinances(initialFinances);
  }

  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDeleteCar, setConfirmDeleteCar] = useState<Car | null>(null);
  const [actionError, setActionError] = useState("");
  const [isPending, startTransition] = useTransition();

  const updateFilters = (
    patch: Partial<CarFilters>,
    history: "push" | "replace" = "push",
  ) => {
    const next = { ...filters, ...patch };
    const params = new URLSearchParams(searchParamsKey);
    for (const key of FILTER_PARAMS) {
      const value = next[key].trim();
      if (!value || (key === "tri" && value === DEFAULT_FILTERS.tri)) {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    }
    const url = new URL(window.location.href);
    url.search = params.toString();
    window.history[history === "push" ? "pushState" : "replaceState"](
      null,
      "",
      `${url.pathname}${url.search}${url.hash}`,
    );
  };

  const resetFilters = () => updateFilters(DEFAULT_FILTERS, "push");

  // Stats calculation
  const totalCars = cars.length;
  const availableCount = cars.filter((c) => c.statut === "disponible").length;
  const reservedCount = cars.filter((c) => c.statut === "reservee").length;
  const soldCount = cars.filter((c) => c.statut === "vendue").length;

  const brands = useMemo(
    () => Array.from(new Set(cars.map((car) => car.marque).filter(Boolean))).sort(),
    [cars],
  );
  const carburants = useMemo(
    () => Array.from(new Set(cars.map((car) => car.carburant).filter(Boolean))).sort(),
    [cars],
  );
  const transmissions = useMemo(
    () => Array.from(new Set(cars.map((car) => car.boite).filter(Boolean))).sort(),
    [cars],
  );
  const carrosseries = useMemo(
    () => Array.from(new Set(cars.map((car) => car.type_carrosserie).filter(Boolean))).sort(),
    [cars],
  );
  const financeByCar = useMemo(
    () => new Map(finances.map((finance) => [finance.car_id, finance])),
    [finances],
  );
  const filteredCars = useMemo(() => {
    const query = filters.q.trim().toLocaleLowerCase("fr");
    const priceMin = filters.prixMin === "" ? null : Number(filters.prixMin);
    const priceMax = filters.prixMax === "" ? null : Number(filters.prixMax);
    const yearMin = filters.anneeMin === "" ? null : Number(filters.anneeMin);
    const yearMax = filters.anneeMax === "" ? null : Number(filters.anneeMax);

    return cars
      .filter((car) => {
        if (
          query &&
          ![car.marque, car.modele, car.slug, car.couleur]
            .filter(Boolean)
            .some((value) => value.toLocaleLowerCase("fr").includes(query))
        ) {
          return false;
        }
        if (filters.marque && car.marque !== filters.marque) return false;
        if (filters.carburant && car.carburant !== filters.carburant) return false;
        if (filters.boite && car.boite !== filters.boite) return false;
        if (filters.carrosserie && car.type_carrosserie !== filters.carrosserie) return false;
        if (filters.statut && car.statut !== filters.statut) return false;
        if (filters.vedette && String(car.is_featured) !== filters.vedette) return false;
        if (priceMin !== null && Number.isFinite(priceMin) && car.prix < priceMin) return false;
        if (priceMax !== null && Number.isFinite(priceMax) && car.prix > priceMax) return false;
        if (yearMin !== null && Number.isFinite(yearMin) && car.annee < yearMin) return false;
        if (yearMax !== null && Number.isFinite(yearMax) && car.annee > yearMax) return false;
        return true;
      })
      .sort((a, b) => {
        if (filters.tri === "prix_asc") return a.prix - b.prix;
        if (filters.tri === "prix_desc") return b.prix - a.prix;
        if (filters.tri === "annee_desc") return b.annee - a.annee;
        if (filters.tri === "anciennes_stock") {
          return (
            (getStockDays(b, financeByCar.get(b.id)) ?? -1) -
            (getStockDays(a, financeByCar.get(a.id)) ?? -1)
          );
        }
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });
  }, [cars, filters, financeByCar]);

  const activeFilters = FILTER_PARAMS.filter(
    (key) => filters[key] && !(key === "tri" && filters.tri === DEFAULT_FILTERS.tri),
  );

  const filterLabels: Record<keyof CarFilters, string> = {
    q: "Recherche",
    marque: "Marque",
    carburant: "Carburant",
    boite: "Boîte",
    carrosserie: "Carrosserie",
    statut: "Statut",
    vedette: "Vedette",
    prixMin: "Prix min.",
    prixMax: "Prix max.",
    anneeMin: "Année min.",
    anneeMax: "Année max.",
    tri: "Tri",
  };

  const filterValueLabel = (key: keyof CarFilters) => {
    if (key === "vedette") return filters.vedette === "true" ? "Oui" : "Non";
    if (key === "statut") return STATUS_LABELS[filters.statut as CarStatus]?.label ?? filters.statut;
    if (key === "tri") return SORT_OPTIONS.find(([value]) => value === filters.tri)?.[1] ?? filters.tri;
    return filters[key];
  };

  const handleToggleFeatured = (car: Car) => {
    setActionError("");
    startTransition(async () => {
      const result = await toggleCarFeaturedAction(car.id, car.is_featured);
      if (result.success) {
        setCars((prev) =>
          prev.map((c) => (c.id === car.id ? { ...c, is_featured: !c.is_featured } : c))
        );
      } else {
        setActionError(result.message);
      }
    });
  };

  const persistStatusChange = (
    car: Car,
    newStatus: CarStatus,
    sale?: CarSaleDetails,
    clearSaleData?: boolean,
    privateFinance?: Pick<CarSaleDetails, "prix_achat" | "frais" | "notes">,
    onSuccess?: () => void,
  ) => {
    setActionError("");
    startTransition(async () => {
      const result = await updateCarStatusAction(
        car.id,
        newStatus,
        sale,
        clearSaleData,
        privateFinance,
      );
      if (result.success) {
        setCars((prev) =>
          prev.map((c) => (c.id === car.id ? { ...c, statut: newStatus } : c))
        );
        if (sale) {
          setFinances((prev) => [
            ...prev.filter((finance) => finance.car_id !== car.id),
            {
              car_id: car.id,
              prix_achat: sale.prix_achat,
              frais: sale.frais,
              prix_vente: sale.prix_vente,
              date_vente: sale.date_vente,
              acheteur: sale.acheteur || null,
              notes: sale.notes || null,
            },
          ]);
        } else if (newStatus === "disponible" && typeof clearSaleData === "boolean") {
          setFinances((prev) =>
            prev.map((finance) =>
              finance.car_id === car.id && clearSaleData
                ? { ...finance, prix_vente: null, date_vente: null, acheteur: null }
                : finance,
            )
          );
        }
        onSuccess?.();
      } else {
        setActionError(result.message);
      }
    });
  };

  const handleStatusChange = (car: Car, newStatus: CarStatus) => {
    if (newStatus === "vendue" && car.statut !== "vendue") {
      setConfirmSaleCar(car);
      return;
    }
    if (newStatus === "disponible" && car.statut === "vendue") {
      setConfirmSaleReversalCar(car);
      return;
    }
    persistStatusChange(car, newStatus);
  };

  const confirmSale = (sale: CarSaleDetails) => {
    if (!confirmSaleCar) return;
    persistStatusChange(confirmSaleCar, "vendue", sale, undefined, undefined, () => {
      setConfirmSaleCar(null);
    });
  };

  const confirmSaleReversal = (clearSaleData: boolean) => {
    if (!confirmSaleReversalCar) return;
    const finance = finances.find(
      (record) => record.car_id === confirmSaleReversalCar.id,
    );
    persistStatusChange(
      confirmSaleReversalCar,
      "disponible",
      undefined,
      clearSaleData,
      {
        prix_achat: finance?.prix_achat ?? null,
        frais: finance?.frais ?? null,
        notes: finance?.notes ?? "",
      },
      () => setConfirmSaleReversalCar(null),
    );
  };

  const executeDelete = () => {
    if (!confirmDeleteCar) return;
    const carId = confirmDeleteCar.id;
    setDeletingId(carId);
    setActionError("");

    startTransition(async () => {
      const result = await deleteCarAction(carId);
      if (result.success) {
        setCars((prev) => prev.filter((c) => c.id !== carId));
        setConfirmDeleteCar(null);
      } else {
        setActionError(result.message);
      }
      setDeletingId(null);
    });
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#141414] border border-[#262626] rounded-xl p-4 flex flex-col justify-between">
          <span className="text-xs uppercase tracking-wider text-[var(--muted)] font-medium">Total Véhicules</span>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-3xl font-extrabold text-white">{totalCars}</span>
            <span className="text-xs text-[var(--muted)]">au showroom</span>
          </div>
        </div>

        <div className="bg-[#141414] border border-[#262626] rounded-xl p-4 flex flex-col justify-between">
          <span className="text-xs uppercase tracking-wider text-[#15803D] font-medium">Disponibles</span>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-3xl font-extrabold text-[#22C55E]">{availableCount}</span>
            <span className="text-xs text-[var(--muted)]">en vente</span>
          </div>
        </div>

        <div className="bg-[#141414] border border-[#262626] rounded-xl p-4 flex flex-col justify-between">
          <span className="text-xs uppercase tracking-wider text-[#9CA3AF] font-medium">Réservées</span>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-3xl font-extrabold text-gray-300">{reservedCount}</span>
            <span className="text-xs text-[var(--muted)]">en attente</span>
          </div>
        </div>

        <div className="bg-[#141414] border border-[#262626] rounded-xl p-4 flex flex-col justify-between">
          <span className="text-xs uppercase tracking-wider text-[#B91C1C] font-medium">Vendues</span>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-3xl font-extrabold text-[#EF4444]">{soldCount}</span>
            <span className="text-xs text-[var(--muted)]">conclues</span>
          </div>
        </div>
      </div>

      {actionError && (
        <div className="p-3 bg-red-950/60 border border-red-500/50 rounded-lg text-red-200 text-sm">
          {actionError}
        </div>
      )}

      {/* Search, filters and sorting */}
      <section className="space-y-4 rounded-xl border border-[#262626] bg-[#141414] p-4 sm:p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full sm:max-w-md">
            <input
              type="search"
              placeholder="Rechercher marque, modèle, slug ou couleur..."
              value={filters.q}
              onChange={(event) => updateFilters({ q: event.target.value }, "replace")}
              className="min-h-11 w-full touch-manipulation rounded-lg border border-[#333] bg-[#1E1E1E] px-3.5 py-2.5 pr-10 text-sm text-white placeholder-gray-500 focus:border-[var(--primary)] focus:outline-none"
            />
            {filters.q && (
              <button
                type="button"
                onClick={() => updateFilters({ q: "" })}
                className="absolute right-3 top-3 flex min-h-11 min-w-11 touch-manipulation items-center justify-center text-gray-400 hover:text-white"
                aria-label="Effacer la recherche"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:justify-end">
            <label htmlFor="admin-car-sort" className="text-xs text-gray-400">
              Trier par
            </label>
            <select
              id="admin-car-sort"
              value={filters.tri}
              onChange={(event) => updateFilters({ tri: event.target.value })}
              className="min-h-11 min-w-40 touch-manipulation rounded-lg border border-[#333] bg-[#1E1E1E] px-3 py-2.5 text-sm text-white"
            >
              {SORT_OPTIONS.map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
            <Link
              href="/admin/voitures/nouveau"
              className="primary-button whitespace-nowrap text-sm !px-4 !py-2.5"
            >
              + Ajouter une voiture
            </Link>
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-[#262626] pt-3">
          <button
            type="button"
            aria-expanded={showFiltersMobile}
            aria-controls="admin-car-filters"
            onClick={() => setShowFiltersMobile((visible) => !visible)}
            className="inline-flex min-h-11 touch-manipulation items-center gap-2 rounded-lg border border-[#333] px-3 py-2 text-sm text-gray-200 sm:hidden"
          >
            <Filter className="h-4 w-4" />
            Filtres
            {activeFilters.length > 0 && (
              <span className="rounded-full bg-[var(--primary)] px-1.5 text-xs text-white">
                {activeFilters.length}
              </span>
            )}
            <ChevronDown
              className={`h-4 w-4 transition-transform ${showFiltersMobile ? "rotate-180" : ""}`}
            />
          </button>
          <p className="text-sm text-gray-300" aria-live="polite">
            <strong className="text-white">{filteredCars.length} voiture{filteredCars.length !== 1 ? "s" : ""}</strong>
            {" "}sur {totalCars}
          </p>
        </div>

        <div id="admin-car-filters" className={`${showFiltersMobile ? "grid" : "hidden"} grid-cols-1 gap-3 border-t border-[#262626] pt-4 sm:grid sm:grid-cols-2 lg:grid-cols-4`}>
          <label className="space-y-1 text-[10px] font-bold uppercase text-gray-400">
            Marque
            <select
              value={filters.marque}
              onChange={(event) => updateFilters({ marque: event.target.value })}
              className="min-h-11 w-full touch-manipulation rounded-lg border border-[#333] bg-[#1E1E1E] p-2.5 text-sm font-normal normal-case text-white"
            >
              <option value="">Toutes les marques</option>
              {brands.map((brand) => <option key={brand} value={brand}>{brand}</option>)}
            </select>
          </label>
          <label className="space-y-1 text-[10px] font-bold uppercase text-gray-400">
            Carburant
            <select
              value={filters.carburant}
              onChange={(event) => updateFilters({ carburant: event.target.value })}
              className="min-h-11 w-full touch-manipulation rounded-lg border border-[#333] bg-[#1E1E1E] p-2.5 text-sm font-normal normal-case text-white"
            >
              <option value="">Tous les carburants</option>
              {carburants.map((fuel: CarFuel) => <option key={fuel} value={fuel}>{fuel}</option>)}
            </select>
          </label>
          <label className="space-y-1 text-[10px] font-bold uppercase text-gray-400">
            Boîte
            <select
              value={filters.boite}
              onChange={(event) => updateFilters({ boite: event.target.value })}
              className="min-h-11 w-full touch-manipulation rounded-lg border border-[#333] bg-[#1E1E1E] p-2.5 text-sm font-normal normal-case text-white"
            >
              <option value="">Toutes les boîtes</option>
              {transmissions.map((transmission: CarTransmission) => (
                <option key={transmission} value={transmission}>{transmission}</option>
              ))}
            </select>
          </label>
          <label className="space-y-1 text-[10px] font-bold uppercase text-gray-400">
            Type de carrosserie
            <select
              value={filters.carrosserie}
              onChange={(event) => updateFilters({ carrosserie: event.target.value })}
              className="min-h-11 w-full touch-manipulation rounded-lg border border-[#333] bg-[#1E1E1E] p-2.5 text-sm font-normal normal-case text-white"
            >
              <option value="">Toutes les carrosseries</option>
              {carrosseries.map((body) => <option key={body} value={body}>{body}</option>)}
            </select>
          </label>
          <label className="space-y-1 text-[10px] font-bold uppercase text-gray-400">
            Statut
            <select
              value={filters.statut}
              onChange={(event) => updateFilters({ statut: event.target.value })}
              className="min-h-11 w-full touch-manipulation rounded-lg border border-[#333] bg-[#1E1E1E] p-2.5 text-sm font-normal normal-case text-white"
            >
              <option value="">Tous les statuts</option>
              <option value="disponible">Disponible</option>
              <option value="reservee">Réservée</option>
              <option value="vendue">Vendue</option>
              <option value="brouillon">Brouillon</option>
            </select>
          </label>
          <label className="space-y-1 text-[10px] font-bold uppercase text-gray-400">
            Vedette
            <select
              value={filters.vedette}
              onChange={(event) => updateFilters({ vedette: event.target.value })}
              className="min-h-11 w-full touch-manipulation rounded-lg border border-[#333] bg-[#1E1E1E] p-2.5 text-sm font-normal normal-case text-white"
            >
              <option value="">Toutes</option>
              <option value="true">Oui</option>
              <option value="false">Non</option>
            </select>
          </label>
          <label className="space-y-1 text-[10px] font-bold uppercase text-gray-400">
            Prix minimum (DA)
            <input
              type="number"
              min="0"
              value={filters.prixMin}
              onChange={(event) => updateFilters({ prixMin: event.target.value }, "replace")}
              className="min-h-11 w-full touch-manipulation rounded-lg border border-[#333] bg-[#1E1E1E] p-2.5 text-sm font-normal normal-case text-white"
            />
          </label>
          <label className="space-y-1 text-[10px] font-bold uppercase text-gray-400">
            Prix maximum (DA)
            <input
              type="number"
              min="0"
              value={filters.prixMax}
              onChange={(event) => updateFilters({ prixMax: event.target.value }, "replace")}
              className="min-h-11 w-full touch-manipulation rounded-lg border border-[#333] bg-[#1E1E1E] p-2.5 text-sm font-normal normal-case text-white"
            />
          </label>
          <label className="space-y-1 text-[10px] font-bold uppercase text-gray-400">
            Année minimum
            <input
              type="number"
              min="1900"
              max="2100"
              value={filters.anneeMin}
              onChange={(event) => updateFilters({ anneeMin: event.target.value }, "replace")}
              className="min-h-11 w-full touch-manipulation rounded-lg border border-[#333] bg-[#1E1E1E] p-2.5 text-sm font-normal normal-case text-white"
            />
          </label>
          <label className="space-y-1 text-[10px] font-bold uppercase text-gray-400">
            Année maximum
            <input
              type="number"
              min="1900"
              max="2100"
              value={filters.anneeMax}
              onChange={(event) => updateFilters({ anneeMax: event.target.value }, "replace")}
              className="min-h-11 w-full touch-manipulation rounded-lg border border-[#333] bg-[#1E1E1E] p-2.5 text-sm font-normal normal-case text-white"
            />
          </label>
        </div>

        {activeFilters.length > 0 && (
          <div className="flex flex-col gap-3 border-t border-[#262626] pt-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex flex-wrap gap-2">
              {activeFilters.map((key) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => updateFilters({ [key]: DEFAULT_FILTERS[key] })}
                  className="inline-flex min-h-11 touch-manipulation items-center gap-1.5 rounded-full border border-[#444] bg-[#1E1E1E] px-2.5 py-1 text-xs text-gray-200 hover:border-[var(--primary)]"
                  aria-label={`Supprimer le filtre ${filterLabels[key]}`}
                >
                  {filterLabels[key]} : {filterValueLabel(key)}
                  <X className="h-3.5 w-3.5" />
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={resetFilters}
              className="inline-flex min-h-11 touch-manipulation shrink-0 items-center gap-1.5 self-start text-sm font-semibold text-[var(--primary)] hover:underline"
            >
              <RotateCcw className="h-4 w-4" />
              Réinitialiser
            </button>
          </div>
        )}
      </section>

      {/* Cars Table */}
      <div className="bg-[#141414] border border-[#262626] rounded-xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#1A1A1A] border-b border-[#262626] text-xs uppercase text-gray-400 font-semibold tracking-wider">
              <tr>
                <th className="py-3 px-4">Photo</th>
                <th className="py-3 px-4">Véhicule</th>
                <th className="py-3 px-4">Année / Km</th>
                <th className="py-3 px-4">Jours en stock</th>
                <th className="py-3 px-4">Prix</th>
                <th className="py-3 px-4">Statut</th>
                <th className="py-3 px-4 text-center">Vedette</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#222]">
              {filteredCars.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-gray-500">
                    Aucun véhicule trouvé pour ces critères.
                  </td>
                </tr>
              ) : (
                filteredCars.map((car) => {
                  const cover = car.cover_image_url || car.images[0]?.url;
                  const badge = STATUS_LABELS[car.statut] || STATUS_LABELS.disponible;

                  return (
                    <tr key={car.id} className="hover:bg-[#1A1A1A]/60 transition-colors">
                      {/* Thumbnail */}
                      <td className="py-3 px-4 w-20">
                        <div className="h-14 w-20 rounded-md overflow-hidden bg-black/50 border border-[#333] relative">
                          <CarImage
                            src={cover}
                            alt={`${car.marque} ${car.modele}`}
                            fill
                            className="h-full w-full object-cover"
                          />
                        </div>
                      </td>

                      {/* Title & Version */}
                      <td className="py-3 px-4">
                        <div className="font-bold text-white text-base">
                          {car.marque} {car.modele}
                        </div>
                        <div className="text-xs text-gray-400">
                          {car.version || car.type_carrosserie} • {car.carburant} • {car.boite}
                        </div>
                      </td>

                      {/* Year & Mileage */}
                      <td className="py-3 px-4 text-gray-300">
                        <div>{car.annee}</div>
                        <div className="text-xs text-gray-400">{formatKm(car.kilometrage)}</div>
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap">
                        {(() => {
                          const days = getStockDays(car, financeByCar.get(car.id));
                          if (days === null) return <span className="text-gray-500">—</span>;
                          return (
                            <span
                              className={days > 60 ? "font-semibold text-orange-400" : "text-gray-300"}
                              title={car.statut === "vendue" ? "Durée avant la vente" : "Durée depuis l'ajout"}
                            >
                              {days} j
                            </span>
                          );
                        })()}
                      </td>

                      {/* Price */}
                      <td className="py-3 px-4 font-bold text-white whitespace-nowrap">
                        <span className="text-[var(--primary)] font-extrabold">{formatPriceDZD(car.prix)}</span>
                        {car.negotiable && (
                          <span className="block text-[10px] text-gray-400 font-normal">Négociable</span>
                        )}
                      </td>

                      {/* Status Selector */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <select
                          value={car.statut}
                          disabled={isPending}
                          onChange={(e) => handleStatusChange(car, e.target.value as CarStatus)}
                          className={`text-xs font-bold rounded-full px-2.5 py-1 border focus:outline-none cursor-pointer ${badge.className}`}
                        >
                          <option value="disponible">Disponible</option>
                          <option value="reservee">Réservée</option>
                          <option value="vendue">Vendue</option>
                          <option value="brouillon">Brouillon</option>
                        </select>
                      </td>

                      {/* Featured Toggle */}
                      <td className="py-3 px-4 text-center">
                        <button
                          type="button"
                          disabled={isPending}
                          onClick={() => handleToggleFeatured(car)}
                          title={car.is_featured ? "En vedette (cliquer pour retirer)" : "Non vedette (cliquer pour activer)"}
                          className="transition-transform hover:scale-125 inline-flex items-center justify-center p-1"
                          aria-label={car.is_featured ? "Retirer de la vedette" : "Mettre en vedette"}
                        >
                          <Star className={`w-5 h-5 ${car.is_featured ? "fill-amber-400 text-amber-400" : "text-gray-600 hover:text-gray-400"}`} />
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/voitures/${car.slug || car.id}`}
                            target="_blank"
                            title="Voir sur le site public"
                            className="p-1.5 text-gray-400 hover:text-white rounded hover:bg-[#2A2A2A] transition-colors inline-flex items-center"
                            aria-label="Voir sur le site public"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>
                          <Link
                            href={`/admin/voitures/${car.id}/modifier`}
                            className="p-1.5 text-blue-400 hover:text-blue-300 rounded hover:bg-[#2A2A2A] transition-colors text-xs font-semibold px-2 border border-blue-900/40 inline-flex items-center gap-1"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                            Modifier
                          </Link>
                          <button
                            type="button"
                            disabled={deletingId === car.id}
                            onClick={() => setConfirmDeleteCar(car)}
                            className="p-1.5 text-red-400 hover:text-red-300 rounded hover:bg-red-950/40 transition-colors text-xs font-semibold px-2 border border-red-900/40 inline-flex items-center gap-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            Supprimer
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {confirmSaleCar && (
        <SaleConfirmationDialog
          key={confirmSaleCar.id}
          listedPrice={confirmSaleCar.prix}
          initialFinance={finances.find((finance) => finance.car_id === confirmSaleCar.id)}
          pending={isPending}
          onCancel={() => setConfirmSaleCar(null)}
          onConfirm={confirmSale}
        />
      )}
      {confirmSaleReversalCar && (
        <SaleReversalDialog
          pending={isPending}
          onCancel={() => setConfirmSaleReversalCar(null)}
          onChoose={confirmSaleReversal}
        />
      )}

      {confirmDeleteCar && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#1A1A1A] border border-[#333] rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-xl font-bold text-white">Confirmer la suppression</h3>
            <p className="text-sm text-gray-300">
              Êtes-vous sûr de vouloir supprimer définitivement{" "}
              <strong className="text-white">
                {confirmDeleteCar.marque} {confirmDeleteCar.modele} ({confirmDeleteCar.annee})
              </strong>{" "}
              ?
            </p>
            <p className="text-xs text-gray-400">
              Cette action supprimera également toutes les photos associées du stockage Supabase. Cette opération est irréversible.
            </p>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#333]">
              <button
                type="button"
                disabled={isPending}
                onClick={() => setConfirmDeleteCar(null)}
                className="secondary-button text-sm !py-2 !px-4"
              >
                Annuler
              </button>
              <button
                type="button"
                disabled={isPending}
                onClick={executeDelete}
                className="primary-button !bg-red-600 hover:!bg-red-700 text-sm !py-2 !px-4"
              >
                {isPending ? "Suppression en cours..." : "Oui, supprimer définitivement"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
