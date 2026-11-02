"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { CarImage } from "@/app/components/CarImage";
import type { Car } from "@/app/data/cars";
import { formatPriceDZD, formatKm, STATUS_LABELS } from "@/app/data/cars";
import { buildCarWhatsAppUrl } from "@/lib/config";
import {
  Car as CarIcon,
  Camera,
  MessageCircle,
  SlidersHorizontal,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

type CarsCatalogClientProps = {
  initialCars: Car[];
};

export function CarsCatalogClient({ initialCars }: CarsCatalogClientProps) {
  useEffect(() => {
    // Temporary diagnostic for verifying client hydration on mobile.
    console.log("[CarsCatalogClient] mounted on client");
  }, []);

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

  return (
    <div className="space-y-8">
      {/* Search & Filter Controls Card */}
      <div className="bg-[#141414] border border-[#262626] rounded-2xl p-5 shadow-xl space-y-4">
        {/* Top search & sorting bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:flex-1">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher une marque, un modèle (ex: Golf, 320d, Clio)..."
              className="w-full bg-[#1E1E1E] border border-[#333] rounded-xl pl-4 pr-10 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[var(--primary)]"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="absolute right-3.5 top-3.5 flex min-h-11 min-w-11 touch-manipulation items-center justify-center text-xs text-gray-400 hover:text-white"
                aria-label="Effacer la recherche"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
            <button
              type="button"
              aria-expanded={showFiltersMobile}
              aria-controls="catalog-filters"
              onClick={() => setShowFiltersMobile((visible) => !visible)}
              className="sm:hidden secondary-button min-h-11 touch-manipulation text-xs !py-2.5 !px-3.5 flex items-center gap-1.5"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Filtres</span>
              {hasActiveFilters && (
                <span className="w-2 h-2 rounded-full bg-[var(--primary)]" />
              )}
            </button>

            <div className="flex items-center gap-2">
              <label htmlFor="sort-select" className="text-xs text-gray-400 whitespace-nowrap hidden sm:inline">
                Trier par :
              </label>
              <select
                id="sort-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as "newest" | "price_asc" | "price_desc" | "year_desc")}
                className="min-h-11 touch-manipulation bg-[#1E1E1E] border border-[#333] rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-[var(--primary)] cursor-pointer"
              >
                <option value="newest">Plus récents</option>
                <option value="price_asc">Prix croissant</option>
                <option value="price_desc">Prix décroissant</option>
                <option value="year_desc">Année récente</option>
              </select>
            </div>
          </div>
        </div>

        {/* Detailed Filters (Always visible on desktop, toggleable on mobile) */}
        <div id="catalog-filters" className={`grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-3 border-t border-[#262626] ${
          showFiltersMobile ? "grid" : "hidden sm:grid"
        }`}>
          {/* Marque */}
          <div>
            <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Marque</label>
            <select
              value={selectedMarque}
              onChange={(e) => setSelectedMarque(e.target.value)}
              className="min-h-11 w-full touch-manipulation bg-[#1E1E1E] border border-[#333] rounded-lg p-2 text-sm text-white focus:outline-none focus:border-[var(--primary)]"
            >
              <option value="all">Toutes</option>
              {marques.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>

          {/* Carburant */}
          <div>
            <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Carburant</label>
            <select
              value={selectedCarburant}
              onChange={(e) => setSelectedCarburant(e.target.value)}
              className="min-h-11 w-full touch-manipulation bg-[#1E1E1E] border border-[#333] rounded-lg p-2 text-sm text-white focus:outline-none focus:border-[var(--primary)]"
            >
              <option value="all">Tous</option>
              {carburants.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Boite */}
          <div>
            <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Boîte</label>
            <select
              value={selectedBoite}
              onChange={(e) => setSelectedBoite(e.target.value)}
              className="min-h-11 w-full touch-manipulation bg-[#1E1E1E] border border-[#333] rounded-lg p-2 text-sm text-white focus:outline-none focus:border-[var(--primary)]"
            >
              <option value="all">Toutes</option>
              <option value="Manuelle">Manuelle</option>
              <option value="Automatique">Automatique</option>
            </select>
          </div>

          {/* Carrosserie */}
          <div>
            <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Carrosserie</label>
            <select
              value={selectedCarrosserie}
              onChange={(e) => setSelectedCarrosserie(e.target.value)}
              className="min-h-11 w-full touch-manipulation bg-[#1E1E1E] border border-[#333] rounded-lg p-2 text-sm text-white focus:outline-none focus:border-[var(--primary)]"
            >
              <option value="all">Toutes</option>
              {carrosseries.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Prix Max */}
          <div>
            <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Prix Max (DA)</label>
            <input
              type="number"
              placeholder="ex: 4000000"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value ? Number(e.target.value) : "")}
              className="min-h-11 w-full touch-manipulation bg-[#1E1E1E] border border-[#333] rounded-lg p-2 text-sm text-white focus:outline-none focus:border-[var(--primary)]"
            />
          </div>

          {/* Année Min */}
          <div>
            <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Année Min</label>
            <input
              type="number"
              placeholder="ex: 2018"
              value={minYear}
              onChange={(e) => setMinYear(e.target.value ? Number(e.target.value) : "")}
              className="min-h-11 w-full touch-manipulation bg-[#1E1E1E] border border-[#333] rounded-lg p-2 text-sm text-white focus:outline-none focus:border-[var(--primary)]"
            />
          </div>
        </div>

        {/* Active filters count & reset */}
        {hasActiveFilters && (
          <div className="flex items-center justify-between pt-2 text-xs text-gray-400 border-t border-[#262626]">
            <span>
              Résultats : <strong className="text-white">{filteredCars.length}</strong> véhicule(s) trouvé(s)
            </span>
            <button
              type="button"
              onClick={resetFilters}
              className="min-h-11 touch-manipulation text-[var(--primary)] hover:underline font-semibold"
            >
              Réinitialiser tous les filtres
            </button>
          </div>
        )}
      </div>

      {/* Cars Grid */}
      {filteredCars.length === 0 ? (
        <div className="bg-[#141414] border border-[#262626] rounded-2xl p-12 text-center space-y-4">
          <CarIcon className="w-12 h-12 text-gray-600 mx-auto" />
          <h3 className="text-xl font-bold text-white">Aucune voiture trouvée</h3>
          <p className="text-sm text-gray-400 max-w-md mx-auto">
            Aucun véhicule ne correspond à vos filtres actuels. Essayez d&apos;élargir vos critères de recherche.
          </p>
          <button
            type="button"
            onClick={resetFilters}
            className="primary-button text-xs !py-2.5 !px-5 inline-block"
          >
            Réinitialiser les filtres
          </button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCars
              .slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)
              .map((car, index) => {
                const cover = car.cover_image_url || car.images[0]?.url;
                const badge = STATUS_LABELS[car.statut] || STATUS_LABELS.disponible;

                return (
                  <article
                    key={car.id}
                    className="bg-white rounded-2xl overflow-hidden shadow-lg border border-gray-100 flex flex-col justify-between group transition-transform duration-300 hover:-translate-y-1 hover:shadow-2xl"
                  >
                    {/* Photo Top Container */}
                    <div className="relative aspect-video overflow-hidden bg-gray-900">
                      <Link href={`/voitures/${car.slug || car.id}`} className="block w-full h-full relative">
                        <CarImage
                          src={cover}
                          alt={`${car.marque} ${car.modele} ${car.annee}`}
                          fill
                          priority={currentPage === 1 && index === 0}
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      </Link>

                      {/* Status Badge */}
                      <span
                        className={`absolute top-3 right-3 text-xs font-extrabold px-3 py-1 rounded-full shadow-md ${badge.className}`}
                      >
                        {badge.label}
                      </span>

                      {/* Year Tag */}
                      <span className="absolute bottom-3 left-3 bg-black/80 backdrop-blur-md text-white text-xs font-bold px-2.5 py-1 rounded-md">
                        {car.annee}
                      </span>

                      {/* Photo count */}
                      {car.images.length > 1 && (
                        <span className="absolute bottom-3 right-3 bg-black/75 backdrop-blur-md text-white text-[11px] font-semibold px-2 py-0.5 rounded flex items-center gap-1">
                          <Camera className="w-3 h-3" />
                          <span>{car.images.length}</span>
                        </span>
                      )}
                    </div>

                    {/* Card Content (Light background for maximum contrast) */}
                    <div className="p-5 flex-1 flex flex-col justify-between text-gray-900">
                      <div>
                        {/* Title */}
                        <div className="flex items-start justify-between gap-2">
                          <Link
                            href={`/voitures/${car.slug || car.id}`}
                            className="font-extrabold text-xl text-gray-900 hover:text-[var(--primary)] transition-colors leading-tight"
                          >
                            {car.marque} {car.modele}
                          </Link>
                        </div>

                        {car.version && (
                          <p className="text-xs font-semibold text-gray-500 mt-0.5">
                            {car.version}
                          </p>
                        )}

                        {/* Price */}
                        <div className="mt-3 flex items-baseline gap-2">
                          <span className="text-2xl font-black text-[var(--primary)]">
                            {formatPriceDZD(car.prix)}
                          </span>
                          {car.negotiable && (
                            <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                              Négociable
                            </span>
                          )}
                        </div>

                        {/* Quick Specs Grid */}
                        <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-gray-100 text-xs text-gray-600">
                          <div>
                            <span className="block text-[10px] text-gray-400 uppercase font-bold">Km</span>
                            <strong className="text-gray-800">{formatKm(car.kilometrage)}</strong>
                          </div>
                          <div>
                            <span className="block text-[10px] text-gray-400 uppercase font-bold">Énergie</span>
                            <strong className="text-gray-800">{car.carburant}</strong>
                          </div>
                          <div>
                            <span className="block text-[10px] text-gray-400 uppercase font-bold">Boîte</span>
                            <strong className="text-gray-800">{car.boite}</strong>
                          </div>
                        </div>
                      </div>

                      {/* Actions Row */}
                      <div className="mt-5 pt-3 border-t border-gray-100 flex items-center justify-between gap-2">
                        <Link
                          href={`/voitures/${car.slug || car.id}`}
                          className="text-xs font-bold text-gray-800 hover:text-[var(--primary)] transition-colors py-2"
                        >
                          Voir détails →
                        </Link>

                        <a
                          href={buildCarWhatsAppUrl(car)}
                          target="_blank"
                          rel="noreferrer"
                          className="whatsapp-button !py-2 !px-3.5 !text-xs !shadow-sm flex items-center gap-1.5"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                          <span>WhatsApp</span>
                        </a>
                      </div>
                    </div>
                  </article>
                );
              })}
          </div>

          {/* Pagination Controls (12 cars per page) */}
          {Math.ceil(filteredCars.length / ITEMS_PER_PAGE) > 1 && (
            <div className="flex items-center justify-center gap-2 pt-6">
              <button
                type="button"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="secondary-button !py-2 !px-3 text-xs flex items-center gap-1 disabled:opacity-40 disabled:cursor-not-allowed"
                aria-label="Page précédente"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Précédent</span>
              </button>

              <div className="flex items-center gap-1 text-xs font-semibold px-2">
                {Array.from(
                  { length: Math.ceil(filteredCars.length / ITEMS_PER_PAGE) },
                  (_, i) => i + 1
                ).map((page) => (
                  <button
                    key={page}
                    type="button"
                    onClick={() => setCurrentPage(page)}
                    className={`w-8 h-8 rounded-lg transition-colors ${
                      currentPage === page
                        ? "bg-[var(--primary)] text-white font-bold"
                        : "bg-[#1E1E1E] text-gray-300 hover:bg-[#2A2A2A]"
                    }`}
                  >
                    {page}
                  </button>
                ))}
              </div>

              <button
                type="button"
                disabled={currentPage >= Math.ceil(filteredCars.length / ITEMS_PER_PAGE)}
                onClick={() =>
                  setCurrentPage((p) =>
                    Math.min(Math.ceil(filteredCars.length / ITEMS_PER_PAGE), p + 1)
                  )
                }
                className="secondary-button !py-2 !px-3 text-xs flex items-center gap-1 disabled:opacity-40 disabled:cursor-not-allowed"
                aria-label="Page suivante"
              >
                <span>Suivant</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
