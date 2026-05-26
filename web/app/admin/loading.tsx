export default function AdminLoading() {
  return (
    <div className="min-h-screen bg-surface">
      <div className="bg-white border-b border-border sticky top-0 z-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-white font-bold">P</span>
            <div className="h-5 w-32 rounded bg-border/60 animate-pulse" />
          </div>
          <div className="h-8 w-20 rounded-full bg-border/60 animate-pulse" />
        </div>
      </div>
      <main className="mx-auto max-w-7xl px-4 sm:px-6 py-8 space-y-8">
        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="h-28 rounded-2xl bg-white border border-border shadow-soft animate-pulse" />
          ))}
        </section>
        <section className="grid gap-4 lg:grid-cols-2">
          <div className="h-72 rounded-2xl bg-white border border-border shadow-soft animate-pulse" />
          <div className="h-72 rounded-2xl bg-white border border-border shadow-soft animate-pulse" />
        </section>
      </main>
    </div>
  );
}
