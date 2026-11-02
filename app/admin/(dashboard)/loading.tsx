export default function AdminDashboardLoading() {
  return (
    <main className="page-shell">
      <section className="inventory-section">
        <div className="content-width space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-2">
              <div className="h-4 w-44 bg-[#262626] rounded animate-pulse" />
              <div className="h-8 w-64 bg-[#262626] rounded animate-pulse" />
              <div className="h-4 w-80 bg-[#1F1F1F] rounded animate-pulse" />
            </div>
            <div className="h-10 w-40 bg-[var(--primary)]/40 rounded-lg animate-pulse" />
          </div>

          {/* Stats Bar Skeleton */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="bg-[#141414] border border-[#262626] rounded-xl p-4 space-y-2 animate-pulse"
              >
                <div className="h-3 w-20 bg-[#262626] rounded" />
                <div className="h-7 w-12 bg-[#333333] rounded" />
              </div>
            ))}
          </div>

          {/* Search & Filter Bar */}
          <div className="bg-[#121212] border border-[#262626] rounded-xl p-4 flex flex-col sm:flex-row gap-3 animate-pulse">
            <div className="h-10 flex-1 bg-[#1F1F1F] rounded-lg" />
            <div className="h-10 w-36 bg-[#1F1F1F] rounded-lg" />
          </div>

          {/* Table Skeleton */}
          <div className="bg-[#121212] border border-[#262626] rounded-xl overflow-hidden animate-pulse">
            <div className="h-12 bg-[#181818] border-b border-[#262626]" />
            <div className="divide-y divide-[#1F1F1F]">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-16 px-4 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-10 bg-[#222222] rounded-md shrink-0" />
                    <div className="space-y-1.5">
                      <div className="h-4 w-36 bg-[#262626] rounded" />
                      <div className="h-3 w-24 bg-[#1F1F1F] rounded" />
                    </div>
                  </div>
                  <div className="h-6 w-20 bg-[#222222] rounded-full" />
                  <div className="h-4 w-24 bg-[#262626] rounded hidden sm:block" />
                  <div className="h-8 w-20 bg-[#1F1F1F] rounded-lg" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
