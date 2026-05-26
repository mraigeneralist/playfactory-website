// Paints instantly while the server checks auth + fetches the profile.
// Mirrors the real /book layout so the swap to actual content is seamless.

export default function BookLoading() {
  return (
    <div className="min-h-screen bg-surface">
      <div className="bg-white border-b border-border">
        <div className="mx-auto max-w-3xl px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-white font-bold">P</span>
            <div className="h-5 w-24 rounded bg-border/60 animate-pulse" />
          </div>
          <div className="h-4 w-14 rounded bg-border/60 animate-pulse" />
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-4 py-8 sm:py-12">
        {/* Step indicator */}
        <div className="mb-8 flex items-center justify-center gap-2">
          {[0, 1, 2, 3, 4].map((i) => (
            <div key={i} className="h-2 w-12 rounded-full bg-border/60 animate-pulse" />
          ))}
        </div>

        {/* Booking card skeleton */}
        <div className="bg-white border border-border rounded-2xl p-5 sm:p-8 shadow-soft space-y-4">
          <div className="h-7 w-48 rounded bg-border/60 animate-pulse" />
          <div className="h-4 w-72 rounded bg-border/40 animate-pulse" />
          <div className="grid gap-3 pt-4 sm:grid-cols-2">
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-24 rounded-xl border border-border bg-surface animate-pulse"
              />
            ))}
          </div>
          <div className="pt-4 flex justify-end">
            <div className="h-11 w-32 rounded-full bg-border/60 animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  );
}
