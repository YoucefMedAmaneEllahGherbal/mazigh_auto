import { Logo } from "@/app/components/Logo";

export default function VoitureDetailLoading() {
  return (
    <main className="page-shell pb-24 md:pb-16">
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

      {/* Detail Skeleton */}
      <section className="inventory-section pt-6">
        <div className="content-width space-y-8">
          {/* Breadcrumbs */}
          <div className="h-4 w-48 bg-[#1F1F1F] rounded animate-pulse" />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left: Gallery Skeleton (7 cols) */}
            <div className="lg:col-span-7 space-y-4">
              <div className="aspect-[4/3] w-full bg-[#141414] border border-[#262626] rounded-2xl animate-pulse" />
              <div className="flex gap-2 overflow-x-auto pb-2">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div
                    key={i}
                    className="w-20 h-16 bg-[#1A1A1A] border border-[#262626] rounded-lg shrink-0 animate-pulse"
                  />
                ))}
              </div>
            </div>

            {/* Right: Info / Action Card Skeleton (5 cols) */}
            <div className="lg:col-span-5 bg-[#121212] border border-[#262626] rounded-2xl p-6 sm:p-7 space-y-6 animate-pulse">
              <div className="space-y-2">
                <div className="h-4 w-28 bg-[#1F1F1F] rounded-full" />
                <div className="h-8 w-3/4 bg-[#262626] rounded" />
                <div className="h-4 w-1/2 bg-[#1F1F1F] rounded" />
              </div>

              <div className="p-4 bg-[#1A1A1A] rounded-xl space-y-1">
                <div className="h-3 w-20 bg-[#262626] rounded" />
                <div className="h-7 w-40 bg-[var(--primary)]/30 rounded" />
              </div>

              <div className="space-y-3">
                <div className="h-12 bg-[#25D366]/20 rounded-xl" />
                <div className="h-11 bg-[#1F1F1F] rounded-xl" />
              </div>

              <div className="grid grid-cols-2 gap-3 pt-4 border-t border-[#1F1F1F]">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="h-10 bg-[#1A1A1A] rounded-lg" />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
