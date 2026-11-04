export default function VoitureDetailLoading() {
  return (
    <main className="section is-page" aria-busy="true">
      <div className="content-width space-y-8">
        <div className="skeleton h-4 w-48" />

        <div className="detail-top">
          <div className="space-y-3">
            <div className="skeleton aspect-[4/3] w-full rounded-2xl" />
            <div className="flex gap-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="skeleton h-16 w-24 shrink-0 rounded-lg" />
              ))}
            </div>
          </div>

          <div className="panel space-y-5">
            <div className="skeleton h-5 w-28 rounded-full" />
            <div className="skeleton h-8 w-3/4" />
            <div className="skeleton h-20 w-full rounded-xl" />
            <div className="grid grid-cols-2 gap-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="skeleton h-14 rounded-lg" />
              ))}
            </div>
            <div className="skeleton h-12 rounded-full" />
            <div className="skeleton h-12 rounded-full" />
          </div>
        </div>
      </div>
    </main>
  );
}
