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
import { CarFront, ExternalLink, Pencil, RotateCcw, Search, SlidersHorizontal, Star, Trash2, X } from "lucide-react";
import { SaleConfirmationDialog } from "./SaleConfirmationDialog";
import { SaleReversalDialog } from "./SaleReversalDialog";
import { AdminDialog } from "./ui";

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
  const [showFilters, setShowFilters] = useState(() =>
    FILTER_PARAMS.some((key) => key !== "q" && key !== "tri" && Boolean(filters[key])),
  );
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

  const panelFilterCount = activeFilters.filter((key) => key !== "q" && key !== "tri").length;

  const statusFilters = [
    { value: "", label: "Total", count: totalCars, hint: "au showroom", dot: "#a1a1aa" },
    { value: "disponible", label: "Disponibles", count: availableCount, hint: "en vente", dot: "#22c55e" },
    { value: "reservee", label: "Réservées", count: reservedCount, hint: "en attente", dot: "#a1a1aa" },
    { value: "vendue", label: "Vendues", count: soldCount, hint: "conclues", dot: "#ef4444" },
  ] as const;

  const renderStatusSelect = (car: Car, badgeClass: string, id?: string) => (
    <select
      id={id}
      aria-label={`Statut de ${car.marque} ${car.modele}`}
      value={car.statut}
      disabled={isPending}
      onChange={(e) => handleStatusChange(car, e.target.value as CarStatus)}
      className={`adm-status-select ${badgeClass}`}
    >
      <option value="disponible">Disponible</option>
      <option value="reservee">Réservée</option>
      <option value="vendue">Vendue</option>
      <option value="brouillon">Brouillon</option>
    </select>
  );

  const renderStockDays = (car: Car) => {
    const days = getStockDays(car, financeByCar.get(car.id));
    if (days === null) return <span className="adm-muted">—</span>;
    return (
      <span
        className={days > 60 ? "adm-days-warn" : undefined}
        title={car.statut === "vendue" ? "Durée avant la vente" : "Durée depuis l'ajout"}
      >
        {days} j
      </span>
    );
  };

  const renderFeatured = (car: Car) => (
    <button
      type="button"
      disabled={isPending}
      onClick={() => handleToggleFeatured(car)}
      aria-pressed={car.is_featured}
      title={car.is_featured ? "En vedette — cliquer pour retirer" : "Mettre en vedette"}
      aria-label={car.is_featured ? "Retirer de la vedette" : "Mettre en vedette"}
      className="adm-icon-btn is-ghost is-star"
    >
      <Star className={`h-[18px] w-[18px] ${car.is_featured ? "fill-current" : ""}`} />
    </button>
  );

  return (
    <div className="adm-stack">
      {/* Stats — click to filter by status */}
      <div className="adm-stats">
        {statusFilters.map((item) => (
          <button
            key={item.label}
            type="button"
            className="adm-stat"
            aria-pressed={filters.statut === item.value}
            onClick={() => updateFilters({ statut: item.value })}
          >
            <span className="adm-stat-label">
              <span className="adm-stat-dot" style={{ background: item.dot }} />
              {item.label}
            </span>
            <span className="adm-stat-value">{item.count}</span>
            <span className="adm-stat-hint">{item.hint}</span>
          </button>
        ))}
      </div>

      {actionError && (
        <div className="adm-alert is-error" role="alert">
          {actionError}
        </div>
      )}

      <section className="adm-card" aria-label="Inventaire">
        {/* Toolbar */}
        <div className="adm-toolbar">
          <div className="adm-search">
            <Search aria-hidden="true" />
            <input
              type="search"
              placeholder="Rechercher marque, modèle, couleur…"
              aria-label="Rechercher un véhicule"
              value={filters.q}
              onChange={(event) => updateFilters({ q: event.target.value }, "replace")}
              className="adm-input"
            />
            {filters.q && (
              <button
                type="button"
                onClick={() => updateFilters({ q: "" })}
                className="adm-icon-btn is-ghost"
                aria-label="Effacer la recherche"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          <div className="adm-toolbar-group">
            <button
              type="button"
              aria-expanded={showFilters}
              aria-controls="admin-car-filters"
              onClick={() => setShowFilters((visible) => !visible)}
              className="adm-btn"
            >
              <SlidersHorizontal className="h-4 w-4" aria-hidden="true" />
              Filtres
              {panelFilterCount > 0 && <span className="adm-count">{panelFilterCount}</span>}
            </button>
            <label htmlFor="admin-car-sort" className="sr-only">
              Trier par
            </label>
            <select
              id="admin-car-sort"
              value={filters.tri}
              onChange={(event) => updateFilters({ tri: event.target.value })}
              className="adm-input"
            >
              {SORT_OPTIONS.map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div id="admin-car-filters" className="adm-filters" hidden={!showFilters}>
          <label className="adm-field">
            <span className="adm-label">Marque</span>
            <select value={filters.marque} onChange={(event) => updateFilters({ marque: event.target.value })} className="adm-input">
              <option value="">Toutes</option>
              {brands.map((brand) => (
                <option key={brand} value={brand}>{brand}</option>
              ))}
            </select>
          </label>
          <label className="adm-field">
            <span className="adm-label">Carburant</span>
            <select value={filters.carburant} onChange={(event) => updateFilters({ carburant: event.target.value })} className="adm-input">
              <option value="">Tous</option>
              {carburants.map((fuel: CarFuel) => (
                <option key={fuel} value={fuel}>{fuel}</option>
              ))}
            </select>
          </label>
          <label className="adm-field">
            <span className="adm-label">Boîte</span>
            <select value={filters.boite} onChange={(event) => updateFilters({ boite: event.target.value })} className="adm-input">
              <option value="">Toutes</option>
              {transmissions.map((transmission: CarTransmission) => (
                <option key={transmission} value={transmission}>{transmission}</option>
              ))}
            </select>
          </label>
          <label className="adm-field">
            <span className="adm-label">Carrosserie</span>
            <select value={filters.carrosserie} onChange={(event) => updateFilters({ carrosserie: event.target.value })} className="adm-input">
              <option value="">Toutes</option>
              {carrosseries.map((body) => (
                <option key={body} value={body}>{body}</option>
              ))}
            </select>
          </label>
          <label className="adm-field">
            <span className="adm-label">Statut</span>
            <select value={filters.statut} onChange={(event) => updateFilters({ statut: event.target.value })} className="adm-input">
              <option value="">Tous</option>
              <option value="disponible">Disponible</option>
              <option value="reservee">Réservée</option>
              <option value="vendue">Vendue</option>
              <option value="brouillon">Brouillon</option>
            </select>
          </label>
          <label className="adm-field">
            <span className="adm-label">Vedette</span>
            <select value={filters.vedette} onChange={(event) => updateFilters({ vedette: event.target.value })} className="adm-input">
              <option value="">Toutes</option>
              <option value="true">Oui</option>
              <option value="false">Non</option>
            </select>
          </label>
          <label className="adm-field">
            <span className="adm-label">Prix min (DA)</span>
            <input type="number" inputMode="numeric" min="0" value={filters.prixMin} onChange={(event) => updateFilters({ prixMin: event.target.value }, "replace")} className="adm-input" />
          </label>
          <label className="adm-field">
            <span className="adm-label">Prix max (DA)</span>
            <input type="number" inputMode="numeric" min="0" value={filters.prixMax} onChange={(event) => updateFilters({ prixMax: event.target.value }, "replace")} className="adm-input" />
          </label>
          <label className="adm-field">
            <span className="adm-label">Année min</span>
            <input type="number" inputMode="numeric" min="1900" max="2100" value={filters.anneeMin} onChange={(event) => updateFilters({ anneeMin: event.target.value }, "replace")} className="adm-input" />
          </label>
          <label className="adm-field">
            <span className="adm-label">Année max</span>
            <input type="number" inputMode="numeric" min="1900" max="2100" value={filters.anneeMax} onChange={(event) => updateFilters({ anneeMax: event.target.value }, "replace")} className="adm-input" />
          </label>
        </div>

        {activeFilters.length > 0 && (
          <div className="adm-chips">
            {activeFilters.map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => updateFilters({ [key]: DEFAULT_FILTERS[key] })}
                className="adm-chip"
                aria-label={`Supprimer le filtre ${filterLabels[key]}`}
              >
                {filterLabels[key]} : {filterValueLabel(key)}
                <X className="h-3.5 w-3.5" aria-hidden="true" />
              </button>
            ))}
            <button type="button" onClick={resetFilters} className="adm-link-btn">
              <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
              Tout réinitialiser
            </button>
          </div>
        )}

        <div className="flex items-center justify-between border-t border-[var(--adm-border)] px-4 py-2.5 text-xs text-[var(--adm-muted)]">
          <p aria-live="polite">
            <strong className="text-[var(--adm-text)]">{filteredCars.length}</strong> véhicule
            {filteredCars.length !== 1 ? "s" : ""} sur {totalCars}
          </p>
        </div>

        {filteredCars.length === 0 ? (
          <div className="adm-empty border-t border-[var(--adm-border)]">
            <CarFront aria-hidden="true" />
            <h3>{totalCars === 0 ? "Aucun véhicule pour l'instant" : "Aucun résultat"}</h3>
            <p>
              {totalCars === 0
                ? "Ajoutez votre premier véhicule pour le publier sur le site."
                : "Aucun véhicule ne correspond à ces critères."}
            </p>
            {totalCars === 0 ? (
              <Link href="/admin/voitures/nouveau" className="adm-btn is-primary">
                Ajouter un véhicule
              </Link>
            ) : (
              <button type="button" onClick={resetFilters} className="adm-btn">
                Réinitialiser les filtres
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Desktop / tablet table */}
            <div className="adm-table-wrap is-responsive border-t border-[var(--adm-border)]">
              <table className="adm-table">
                <thead>
                  <tr>
                    <th scope="col">Véhicule</th>
                    <th scope="col">Année · Km</th>
                    <th scope="col">En stock</th>
                    <th scope="col">Prix</th>
                    <th scope="col">Statut</th>
                    <th scope="col" className="is-center">Vedette</th>
                    <th scope="col" className="is-right">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCars.map((car) => {
                    const cover = car.cover_image_url || car.images[0]?.url;
                    const badge = STATUS_LABELS[car.statut] || STATUS_LABELS.disponible;
                    return (
                      <tr key={car.id}>
                        <td>
                          <div className="adm-vehicle-cell">
                            <div className="adm-thumb">
                              <CarImage src={cover} alt="" fill sizes="72px" className="object-cover" />
                            </div>
                            <div className="min-w-0">
                              <Link href={`/admin/voitures/${car.id}/modifier`} className="adm-vehicle-name hover:text-[var(--primary)]">
                                {car.marque} {car.modele}
                              </Link>
                              <p className="adm-vehicle-sub">
                                {[car.version || car.type_carrosserie, car.carburant, car.boite].filter(Boolean).join(" · ")}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="is-num">
                          {car.annee}
                          <span className="adm-secondary-line">{formatKm(car.kilometrage)}</span>
                        </td>
                        <td className="is-num">{renderStockDays(car)}</td>
                        <td>
                          <span className="adm-price">{formatPriceDZD(car.prix)}</span>
                          {car.negotiable && <span className="adm-secondary-line">Négociable</span>}
                        </td>
                        <td>{renderStatusSelect(car, badge.className)}</td>
                        <td className="is-center">{renderFeatured(car)}</td>
                        <td>
                          <div className="adm-row-actions">
                            <Link
                              href={`/voitures/${car.slug || car.id}`}
                              target="_blank"
                              className="adm-icon-btn is-ghost"
                              title="Voir sur le site public"
                              aria-label="Voir sur le site public"
                            >
                              <ExternalLink className="h-4 w-4" />
                            </Link>
                            <Link
                              href={`/admin/voitures/${car.id}/modifier`}
                              className="adm-icon-btn"
                              title="Modifier"
                              aria-label={`Modifier ${car.marque} ${car.modele}`}
                            >
                              <Pencil className="h-4 w-4" />
                            </Link>
                            <button
                              type="button"
                              disabled={deletingId === car.id}
                              onClick={() => setConfirmDeleteCar(car)}
                              className="adm-icon-btn is-danger"
                              title="Supprimer"
                              aria-label={`Supprimer ${car.marque} ${car.modele}`}
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile list */}
            <ul className="adm-list border-t border-[var(--adm-border)]">
              {filteredCars.map((car) => {
                const cover = car.cover_image_url || car.images[0]?.url;
                const badge = STATUS_LABELS[car.statut] || STATUS_LABELS.disponible;
                return (
                  <li key={car.id}>
                    <div className="adm-list-top">
                      <div className="adm-thumb">
                        <CarImage src={cover} alt="" fill sizes="88px" className="object-cover" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="adm-vehicle-name">
                          {car.marque} {car.modele}
                        </p>
                        <p className="adm-vehicle-sub">
                          {car.annee} · {formatKm(car.kilometrage)} · {car.carburant}
                        </p>
                        <p className="adm-price mt-1">{formatPriceDZD(car.prix)}</p>
                      </div>
                      {renderFeatured(car)}
                    </div>
                    <div className="adm-list-meta">
                      {renderStatusSelect(car, badge.className)}
                      <span className="text-xs text-[var(--adm-muted)]">En stock : {renderStockDays(car)}</span>
                    </div>
                    <div className="adm-list-actions">
                      <Link href={`/admin/voitures/${car.id}/modifier`} className="adm-btn is-sm">
                        <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
                        Modifier
                      </Link>
                      <Link
                        href={`/voitures/${car.slug || car.id}`}
                        target="_blank"
                        className="adm-icon-btn"
                        aria-label="Voir sur le site public"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Link>
                      <button
                        type="button"
                        disabled={deletingId === car.id}
                        onClick={() => setConfirmDeleteCar(car)}
                        className="adm-icon-btn is-danger"
                        aria-label={`Supprimer ${car.marque} ${car.modele}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          </>
        )}
      </section>

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
        <AdminDialog
          role="alertdialog"
          title="Supprimer ce véhicule ?"
          description={
            <>
              <strong className="text-[var(--adm-text)]">
                {confirmDeleteCar.marque} {confirmDeleteCar.modele} ({confirmDeleteCar.annee})
              </strong>{" "}
              sera supprimé définitivement, ainsi que toutes ses photos. Cette action est irréversible.
            </>
          }
          onClose={() => setConfirmDeleteCar(null)}
          busy={isPending}
          footer={
            <>
              <button type="button" disabled={isPending} onClick={() => setConfirmDeleteCar(null)} className="adm-btn">
                Annuler
              </button>
              <button type="button" disabled={isPending} onClick={executeDelete} className="adm-btn is-danger">
                <Trash2 className="h-4 w-4" aria-hidden="true" />
                {isPending ? "Suppression…" : "Supprimer définitivement"}
              </button>
            </>
          }
        />
      )}
    </div>
  );
}
