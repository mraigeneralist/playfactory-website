"use client";

import { formatSlotDisplay } from "@/lib/slots";
import type { Slot } from "@/lib/types";

interface Props {
  slots: Slot[];
  selected: string | null;
  onSelect: (t: string) => void;
  onNext: () => void;
  onBack: () => void;
  loading: boolean;
  error: string | null;
}

export default function SlotStep({ slots, selected, onSelect, onNext, onBack, loading, error }: Props) {
  return (
    <div>
      <h2 className="font-heading text-2xl font-bold text-ink mb-2">Pick a slot</h2>
      <p className="text-ink-soft mb-6">All slots are 1 hour long.</p>

      {loading ? (
        <div className="py-12 text-center text-muted">Loading slots…</div>
      ) : error ? (
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
          {error}
        </div>
      ) : slots.length === 0 ? (
        <div className="rounded-xl border border-border bg-surface p-8 text-center text-muted">
          No slots available for this date.
        </div>
      ) : (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5">
          {slots.map((s) => {
            const active = selected === s.time;
            const disabled = !s.available;
            return (
              <button
                key={s.time}
                disabled={disabled}
                onClick={() => onSelect(s.time)}
                className={`rounded-lg border p-3 text-sm font-semibold transition-all ${
                  disabled
                    ? "border-border bg-surface text-muted line-through cursor-not-allowed"
                    : active
                    ? "border-primary bg-primary text-white ring-2 ring-primary/30"
                    : "border-border bg-white text-ink hover:border-primary hover:bg-primary-soft"
                }`}
              >
                <div>{formatSlotDisplay(s.time)}</div>
                {!disabled && s.remaining > 0 && (
                  <div className={`text-[10px] mt-0.5 ${active ? "text-white/80" : "text-muted"}`}>
                    {s.remaining} left
                  </div>
                )}
              </button>
            );
          })}
        </div>
      )}

      <div className="mt-8 flex gap-3">
        <button
          onClick={onBack}
          className="rounded-xl border border-border bg-white px-5 py-3.5 text-sm font-semibold text-ink-soft hover:border-primary/40 hover:text-primary-dark transition-colors"
        >
          Back
        </button>
        <button
          disabled={!selected}
          onClick={onNext}
          className="btn-primary flex-1 rounded-xl py-3.5 text-sm font-semibold disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Continue
        </button>
      </div>
    </div>
  );
}
