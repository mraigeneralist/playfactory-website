// Renders instantly while the server fetches the account data. Without this,
// clicking the profile icon felt dead — the click was registered but Next.js
// waited for the full server render before painting anything.

export default function AccountLoading() {
  return (
    <div className="min-h-screen bg-surface">
      <div className="bg-white border-b border-border">
        <div className="mx-auto max-w-5xl px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-white font-bold">P</span>
            <div className="h-5 w-28 rounded bg-border/60 animate-pulse" />
          </div>
          <div className="h-9 w-28 rounded-full bg-border/60 animate-pulse" />
        </div>
      </div>

      <main className="mx-auto max-w-5xl px-4 sm:px-6 py-8 space-y-6">
        <div className="space-y-2">
          <div className="h-3 w-24 rounded bg-border/60 animate-pulse" />
          <div className="h-9 w-56 rounded bg-border/60 animate-pulse" />
        </div>
        <div className="h-12 w-72 rounded-full bg-white border border-border shadow-soft animate-pulse" />
        <div className="grid gap-3">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="h-24 rounded-2xl border border-border bg-white shadow-soft animate-pulse"
            />
          ))}
        </div>
      </main>
    </div>
  );
}
