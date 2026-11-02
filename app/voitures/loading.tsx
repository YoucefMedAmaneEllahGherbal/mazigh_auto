import { Logo } from "@/app/components/Logo";

export default function VoituresLoading() {
  return (
    <main className="page-shell">
      {/* Header */}
      <header className="site-header">
        <div className="content-width header-inner">
          <Logo href="/" size="md" />
          <nav className="main-nav" aria-label="Navigation principale">
            <span className="text-gray-400">Accueil</span>
            <span className="text-[var(--primary)] font-bold">Véhicules</span>
            <span className="text-gray-400">Vendre / Échanger</span>
            <span className="text-gray-400">Contact</span>
          </nav>
          <div className="w-24 h-9 bg-[#1F1F1F] rounded-lg animate-pulse" />
        </div>
      </header>

      {/* Hero & Catalog Skeleton */}
      <section className="inventory-section pt-8 pb-16">
        <div className="content-width">
          <div className="mb-8 space-y-2">
            <div className="h-4 w-40 bg-[#262626] rounded animate-pulse" />
            <div className="h-8 w-72 bg-[#262626] rounded animate-pulse" />
            <div className="h-4 w-96 max-w-full bg-[#1F1F1F] rounded animate-pulse" />
          </div>

          {/* Filters Bar Skeleton */}
          <div className="bg-[#121212] border border-[#262626] rounded-2xl p-4 sm:p-5 mb-8 animate-pulse">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="h-10 bg-[#1F1F1F] rounded-xl" />
              <div className="h-10 bg-[#1F1F1F] rounded-xl" />
              <div className="h-10 bg-[#1F1F1F] rounded-xl" />
              <div className="h-10 bg-[#1F1F1F] rounded-xl" />
            </div>
          </div>

          {/* 12 Cards Grid Skeleton */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 12 }).map((_, i) => (
              <div
                key={i}
                className="bg-[#121212] border border-[#262626] rounded-2xl overflow-hidden animate-pulse"
              >
                <div className="h-56 bg-[#1A1A1A]" />
                <div className="p-5 space-y-3">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1.5 flex-1">
                      <div className="h-5 w-3/4 bg-[#262626] rounded" />
                      <div className="h-3 w-1/2 bg-[#1F1F1F] rounded" />
                    </div>
                    <div className="h-6 w-24 bg-[#262626] rounded" />
                  </div>
                  <div className="grid grid-cols-3 gap-2 pt-3 border-t border-[#1F1F1F]">
                    <div className="h-8 bg-[#1A1A1A] rounded" />
                    <div className="h-8 bg-[#1A1A1A] rounded" />
                    <div className="h-8 bg-[#1A1A1A] rounded" />
                  </div>
                  <div className="h-10 bg-[#1F1F1F] rounded-xl mt-4" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
