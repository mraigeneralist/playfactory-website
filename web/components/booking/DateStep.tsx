"use client";

import { DayPicker } from "react-day-picker";
import "react-day-picker/style.css";
import { addDays } from "date-fns";
import { BOOKING_HORIZON_DAYS } from "@/lib/constants";

interface Props {
  selected: Date | null;
  onSelect: (d: Date | null) => void;
  onNext: () => void;
  onBack: () => void;
}

export default function DateStep({ selected, onSelect, onNext, onBack }: Props) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const max = addDays(today, BOOKING_HORIZON_DAYS);

  return (
    <div>
      <h2 className="font-heading text-2xl font-bold text-ink mb-2">Pick a date</h2>
      <p className="text-ink-soft mb-6">Book up to {BOOKING_HORIZON_DAYS} days ahead.</p>

      <div className="flex justify-center">
        <DayPicker
          mode="single"
          selected={selected ?? undefined}
          onSelect={(d) => onSelect(d ?? null)}
          disabled={{ before: today, after: max }}
          showOutsideDays
        />
      </div>

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
