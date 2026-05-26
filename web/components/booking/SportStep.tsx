"use client";

import { SPORTS, formatINR, type Sport } from "@/lib/constants";

interface Props {
  selected: Sport | null;
  onSelect: (s: Sport) => void;
  onNext: () => void;
}

export default function SportStep({ selected, onSelect, onNext }: Props) {
  return (
    <div>
      <h2 className="font-heading text-2xl font-bold text-ink mb-2">What are you playing?</h2>
      <p className="text-ink-soft mb-6">Pick a sport to see available slots.</p>

      <div className="grid gap-3 sm:grid-cols-2">
        {SPORTS.map((s) => {
          const active = selected?.id === s.id;
          return (
            <button
              key={s.id}
              onClick={() => onSelect(s)}
              className={`text-left rounded-xl border p-4 transition-all ${
                active
                  ? "border-primary bg-primary-soft ring-2 ring-primary/30"
                  : "border-border bg-white hover:border-primary/40 hover:bg-surface"
              }`}
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <span className="text-3xl">{s.icon}</span>
                <span className="rounded-full bg-white border border-border px-2.5 py-0.5 text-xs font-bold text-primary-dark">
                  {formatINR(s.priceINR)}
                </span>
              </div>
              <div className="font-heading font-bold text-ink">{s.shortName}</div>
              <div className="text-xs text-muted mt-0.5">1 hour · {s.courts} court{s.courts === 1 ? "" : "s"}</div>
            </button>
          );
        })}
      </div>

      <div className="mt-8 flex justify-end">
        <button
          disabled={!selected}
          onClick={onNext}
          className="btn-primary rounded-full px-7 py-3 text-sm disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Continue
        </button>
      </div>
    </div>
  );
}
