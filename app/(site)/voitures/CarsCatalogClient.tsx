"use client";

import { useState, useMemo } from "react";
import type { Car } from "@/app/data/cars";
import { VehicleCard } from "@/app/components/site/VehicleCard";
import {
  Car as CarIcon,
  Search,
  SlidersHorizontal,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

type CarsCatalogClientProps = {
  initialCars: Car[];
};

export function CarsCatalogClient({ initialCars }: CarsCatalogClientProps) {
  // Search & Filters State
  const [search, setSearch] = useState("");
  const [selectedMarque, setSelectedMarque] = useState("all");
  const [selectedCarburant, setSelectedCarburant] = useState("all");
  const [selectedBoite, setSelectedBoite] = useState("all");
  const [selectedCarrosserie, setSelectedCarrosserie] = useState("all");
  const [selectedEtat, setSelectedEtat] = useState("all");
  const [maxPrice, setMaxPrice] = useState<number | "">("");
  const [minYear, setMinYear] = useState<number | "">("");
  const [sortBy, setSortBy] = useState<"newest" | "price_asc" | "price_desc" | "year_desc">("newest");
  const [showFiltersMobile, setShowFiltersMobile] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 12;

  // Reset page when any filter changes
  const filterKey = `${search}-${selectedMarque}-${selectedCarburant}-${selectedBoite}-${selectedCarrosserie}-${selectedEtat}-${maxPrice}-${minYear}-${sortBy}`;
  const [prevFilterKey, setPrevFilterKey] = useState(filterKey);
  if (filterKey !== prevFilterKey) {
    setPrevFilterKey(filterKey);
    setCurrentPage(1);
  }

  // Extract unique filter options
  const marques = useMemo(() => {
    return Array.from(new Set(initialCars.map((c) => c.marque).filter(Boolean))).sort();
  }, [initialCars]);

  const carburants = useMemo(() => {
    return Array.from(new Set(initialCars.map((c) => c.carburant).filter(Boolean))).sort();
  }, [initialCars]);

  const carrosseries = useMemo(() => {
    return Array.from(new Set(initialCars.map((c) => c.type_carrosserie).filter(Boolean))).sort();
  }, [initialCars]);

  // Filter & sort cars
  const filteredCars = useMemo(() => {
    return initialCars
      .filter((car) => {
        // Search query
        if (search.trim()) {
          const q = search.toLowerCase();
          const matches =
            car.marque.toLowerCase().includes(q) ||
            car.modele.toLowerCase().includes(q) ||
            car.version?.toLowerCase().includes(q) ||
            car.couleur?.toLowerCase().includes(q);
          if (!matches) return false;
        }

        // Dropdown filters
        if (selectedMarque !== "all" && car.marque !== selectedMarque) return false;
        if (selectedCarburant !== "all" && car.carburant !== selectedCarburant) return false;
        if (selectedBoite !== "all" && car.boite !== selectedBoite) return false;
        if (selectedCarrosserie !== "all" && car.type_carrosserie !== selectedCarrosserie) return false;
        if (selectedEtat !== "all" && car.etat !== selectedEtat) return false;

        // Numeric ranges
        if (maxPrice !== "" && car.prix > Number(maxPrice)) return false;
        if (minYear !== "" && car.annee < Number(minYear)) return false;

        return true;
      })
      .sort((a, b) => {
        if (sortBy === "price_asc") return a.prix - b.prix;
        if (sortBy === "price_desc") return b.prix - a.prix;
        if (sortBy === "year_desc") return b.annee - a.annee;
        // Default newest
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });
  }, [
    initialCars,
    search,
    selectedMarque,
    selectedCarburant,
    selectedBoite,
    selectedCarrosserie,
    selectedEtat,
    maxPrice,
    minYear,
    sortBy,
  ]);

  const resetFilters = () => {
    setSearch("");
    setSelectedMarque("all");
    setSelectedCarburant("all");
    setSelectedBoite("all");
    setSelectedCarrosserie("all");
    setSelectedEtat("all");
    setMaxPrice("");
    setMinYear("");
    setSortBy("newest");
  };

  const hasActiveFilters =
    search !== "" ||
    selectedMarque !== "all" ||
    selectedCarburant !== "all" ||
    selectedBoite !== "all" ||
    selectedCarrosserie !== "all" ||
    selectedEtat !== "all" ||
    maxPrice !== "" ||
    minYear !== "";

  const pageCount = Math.ceil(filteredCars.length / ITEMS_PER_PAGE);
  const activeFilterCount = [
    selectedMarque !== "all",
    selectedCarburant !== "all",
    selectedBoite !== "all",
    selectedCarrosserie !== "all",
    selectedEtat !== "all",
    maxPrice !== "",
    minYear !== "",
  ].filter(Boolean).length;

  return (
    <div className="catalog">
      <div className="catalog-toolbar">
        <div className="catalog-toolbar-row">
          <div className="field-search">
            <Search className="field-search-icon" aria-hidden="true" />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Marque, modèle (ex : Golf, 320d, Clio)…"
              aria-label="Rechercher un véhicule"
              className="field"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="field-search-clear"
                aria-label="Effacer la recherche"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          <div className="catalog-toolbar-actions">
            <button
              type="button"
              aria-expanded={showFiltersMobile}
              aria-controls="catalog-filters"
              onClick={() => setShowFiltersMobile((visible) => !visible)}
              className="secondary-button is-small catalog-filter-toggle"
            >
              <SlidersHorizontal className="h-4 w-4" aria-hidden="true" />
              Filtres
              {activeFilterCount > 0 && <span className="count-pill">{activeFilterCount}</span>}
            </button>

            <label htmlFor="sort-select" className="sr-only">
              Trier par
            </label>
            <select
              id="sort-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as "newest" | "price_asc" | "price_desc" | "year_desc")}
              className="field field-select"
            >
              <option value="newest">Plus récents</option>
              <option value="price_asc">Prix croissant</option>
              <option value="price_desc">Prix décroissant</option>
              <option value="year_desc">Année récente</option>
            </select>
          </div>
        </div>

        <div id="catalog-filters" className={`catalog-filters${showFiltersMobile ? " is-open" : ""}`}>
          <label className="field-group">
            <span>Marque</span>
            <select value={selectedMarque} onChange={(e) => setSelectedMarque(e.target.value)} className="field field-select">
              <option value="all">Toutes</option>
              {marques.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </label>

          <label className="field-group">
            <span>Carburant</span>
            <select value={selectedCarburant} onChange={(e) => setSelectedCarburant(e.target.value)} className="field field-select">
              <option value="all">Tous</option>
              {carburants.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </label>

          <label className="field-group">
            <span>Boîte</span>
            <select value={selectedBoite} onChange={(e) => setSelectedBoite(e.target.value)} className="field field-select">
              <option value="all">Toutes</option>
              <option value="Manuelle">Manuelle</option>
              <option value="Automatique">Automatique</option>
            </select>
          </label>

          <label className="field-group">
            <span>Carrosserie</span>
            <select value={selectedCarrosserie} onChange={(e) => setSelectedCarrosserie(e.target.value)} className="field field-select">
              <option value="all">Toutes</option>
              {carrosseries.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </label>

          <label className="field-group">
            <span>État</span>
            <select value={selectedEtat} onChange={(e) => setSelectedEtat(e.target.value)} className="field field-select">
              <option value="all">Neuf & occasion</option>
              <option value="Neuve">Neuve</option>
              <option value="Occasion">Occasion</option>
            </select>
          </label>

          <label className="field-group">
            <span>Prix max (DA)</span>
            <input
              type="number"
              inputMode="numeric"
              placeholder="ex : 4000000"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value ? Number(e.target.value) : "")}
              className="field"
            />
          </label>

          <label className="field-group">
            <span>Année min</span>
            <input
              type="number"
              inputMode="numeric"
              placeholder="ex : 2018"
              value={minYear}
              onChange={(e) => setMinYear(e.target.value ? Number(e.target.value) : "")}
              className="field"
            />
          </label>
        </div>

        <div className="catalog-summary">
          <p aria-live="polite">
            <strong>{filteredCars.length}</strong> véhicule{filteredCars.length !== 1 ? "s" : ""}
            {hasActiveFilters ? " trouvé" + (filteredCars.length !== 1 ? "s" : "") : " au showroom"}
          </p>
          {hasActiveFilters && (
            <button type="button" onClick={resetFilters} className="text-button">
              Réinitialiser
            </button>
          )}
        </div>
      </div>

      {filteredCars.length === 0 ? (
        <div className="empty-state">
          <CarIcon className="h-10 w-10" aria-hidden="true" />
          <h3>Aucune voiture trouvée</h3>
          <p>Aucun véhicule ne correspond à vos filtres. Essayez d&apos;élargir vos critères.</p>
          <button type="button" onClick={resetFilters} className="primary-button is-small">
            Réinitialiser les filtres
          </button>
        </div>
      ) : (
        <>
          <div className="vehicle-grid">
            {filteredCars
              .slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)
              .map((car, index) => (
                <VehicleCard key={car.id} car={car} priority={currentPage === 1 && index === 0} />
              ))}
          </div>

          {pageCount > 1 && (
            <nav className="pagination" aria-label="Pagination">
              <button
                type="button"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="secondary-button is-small"
                aria-label="Page précédente"
              >
                <ChevronLeft className="h-4 w-4" />
                <span className="hidden sm:inline">Précédent</span>
              </button>

              <div className="pagination-pages">
                {Array.from({ length: pageCount }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    type="button"
                    onClick={() => setCurrentPage(page)}
                    aria-current={currentPage === page ? "page" : undefined}
                  >
                    {page}
                  </button>
                ))}
              </div>

              <button
                type="button"
                disabled={currentPage >= pageCount}
                onClick={() => setCurrentPage((p) => Math.min(pageCount, p + 1))}
                className="secondary-button is-small"
                aria-label="Page suivante"
              >
                <span className="hidden sm:inline">Suivant</span>
                <ChevronRight className="h-4 w-4" />
              </button>
            </nav>
          )}
        </>
      )}
    </div>
  );
}
