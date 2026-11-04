export default function AdminDashboardLoading() {
  return (
    <main className="adm-page" aria-busy="true">
      <div className="adm-page-header">
        <div className="space-y-2">
          <div className="adm-skel h-7 w-48" />
          <div className="adm-skel h-4 w-80 max-w-full" />
        </div>
        <div className="adm-skel h-10 w-40 rounded-lg" />
      </div>

      <div className="adm-stack">
        <div className="adm-stats">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="adm-stat">
              <div className="adm-skel h-3 w-20" />
              <div className="adm-skel h-7 w-12" />
            </div>
          ))}
        </div>

        <div className="adm-card">
          <div className="adm-toolbar">
            <div className="adm-skel h-10 flex-1 rounded-lg" />
            <div className="adm-skel h-10 w-28 rounded-lg" />
            <div className="adm-skel h-10 w-44 rounded-lg" />
          </div>
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 border-t border-[var(--adm-border)] px-4 py-3">
              <div className="adm-skel h-12 w-[4.5rem] shrink-0 rounded-md" />
              <div className="flex-1 space-y-2">
                <div className="adm-skel h-4 w-40" />
                <div className="adm-skel h-3 w-28" />
              </div>
              <div className="adm-skel hidden h-4 w-24 sm:block" />
              <div className="adm-skel h-7 w-24 rounded-full" />
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
