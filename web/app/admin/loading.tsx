import Logo from "@/components/Logo";

export default function AdminLoading() {
  return (
    <div className="min-h-screen bg-surface">
      <div className="bg-white border-b border-border sticky top-0 z-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-3 flex items-center justify-between">
          <Logo className="text-xl sm:text-2xl" />
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
