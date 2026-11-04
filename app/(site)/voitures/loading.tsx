export default function VoituresLoading() {
  return (
    <main className="section is-page" aria-busy="true">
      <div className="content-width">
        <div className="page-heading">
          <div className="skeleton h-4 w-40" />
          <div className="skeleton mt-3 h-9 w-72 max-w-full" />
          <div className="skeleton mt-3 h-4 w-96 max-w-full" />
        </div>

        <div className="catalog-toolbar">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_auto]">
            <div className="skeleton h-11 rounded-xl" />
            <div className="skeleton h-11 w-40 rounded-xl" />
          </div>
        </div>

        <div className="vehicle-grid mt-8">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="vehicle-card">
              <div className="skeleton aspect-[16/10] rounded-none" />
              <div className="vehicle-card-body">
                <div className="skeleton h-5 w-3/4" />
                <div className="skeleton h-3 w-1/2" />
                <div className="skeleton h-7 w-40" />
                <div className="grid grid-cols-3 gap-2">
                  <div className="skeleton h-9" />
                  <div className="skeleton h-9" />
                  <div className="skeleton h-9" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
