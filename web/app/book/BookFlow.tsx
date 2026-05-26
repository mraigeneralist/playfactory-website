"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { SPORTS, type Sport, type SportId } from "@/lib/constants";
import Logo from "@/components/Logo";
import type { Slot } from "@/lib/types";
import StepIndicator from "@/components/booking/StepIndicator";
import SportStep from "@/components/booking/SportStep";
import DateStep from "@/components/booking/DateStep";
import SlotStep from "@/components/booking/SlotStep";
import DetailsStep from "@/components/booking/DetailsStep";
import ConfirmStep from "@/components/booking/ConfirmStep";

const SS_KEY = "pf-booking";

interface Props {
  initialProfile: { id: string; name: string; phone: string; email: string };
  preselectSportId: string | null;
}

export default function BookFlow({ initialProfile, preselectSportId }: Props) {
  const [step, setStep] = useState(1);
  const [animating, setAnimating] = useState(false);

  const [sport, setSport] = useState<Sport | null>(() => {
    if (!preselectSportId) return null;
    return SPORTS.find((s) => s.id === (preselectSportId as SportId)) || null;
  });
  const [date, setDate] = useState<Date | null>(null);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [slotsError, setSlotsError] = useState<string | null>(null);
  const [slotTime, setSlotTime] = useState<string | null>(null);

  // Prefill from server-side profile fetch. No client-side Supabase round trip.
  const [name, setName] = useState(initialProfile.name);
  const [phone, setPhone] = useState(initialProfile.phone);
  const [email, setEmail] = useState(initialProfile.email);

  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [bookingId, setBookingId] = useState<string | null>(null);

  // Restore in-progress booking from sessionStorage on mount.
  useEffect(() => {
    const saved = sessionStorage.getItem(SS_KEY);
    if (!saved) return;
    try {
      const s = JSON.parse(saved);
      if (s.sportId && !preselectSportId) {
        const found = SPORTS.find((x) => x.id === s.sportId);
        if (found) setSport(found);
      }
      if (s.date) setDate(new Date(s.date));
      if (s.slotTime) setSlotTime(s.slotTime);
      if (s.step && s.step < 5) setStep(s.step);
    } catch {}
    // Profile values are not restored from sessionStorage — they come from
    // the freshly-fetched profile so they always reflect the latest edits.
  }, [preselectSportId]);

  // Persist to sessionStorage
  useEffect(() => {
    if (step >= 5) return;
    if (!sport) return;
    sessionStorage.setItem(
      SS_KEY,
      JSON.stringify({
        step,
        sportId: sport.id,
        date: date?.toISOString() ?? null,
        slotTime,
      })
    );
  }, [step, sport, date, slotTime]);

  const fetchSlots = useCallback(async (sp: Sport, d: Date) => {
    setSlotsLoading(true);
    setSlotsError(null);
    setSlots([]);
    setSlotTime(null);
    try {
      const dateStr = format(d, "yyyy-MM-dd");
      const res = await fetch(`/api/booking/slots?sport=${sp.id}&date=${dateStr}`);
      const data = await res.json();
      if (!res.ok) {
        setSlotsError(data.error || "Could not load slots");
      } else {
        setSlots(data.slots || []);
      }
    } catch {
      setSlotsError("Network error. Check your connection.");
    } finally {
      setSlotsLoading(false);
    }
  }, []);

  const goToStep = useCallback((n: number) => {
    if (animating) return;
    setAnimating(true);
    setTimeout(() => {
      setStep(n);
      requestAnimationFrame(() => setAnimating(false));
    }, 180);
  }, [animating]);

  const handleSportSelect = (s: Sport) => {
    if (sport?.id !== s.id) {
      setSport(s);
      setDate(null);
      setSlotTime(null);
      setSlots([]);
    }
  };

  const handleDateSelect = (d: Date | null) => {
    setDate(d);
    setSlotTime(null);
    if (d && sport) fetchSlots(sport, d);
  };

  const handleSubmit = async () => {
    if (!sport || !date || !slotTime) return;
    setBookingLoading(true);
    setBookingError(null);
    try {
      const res = await fetch("/api/booking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sport: sport.id,
          sportName: sport.name,
          date: format(date, "yyyy-MM-dd"),
          slotTime,
          durationMin: sport.durationMin,
          priceINR: sport.priceINR,
          name: name.trim(),
          phone,
          email: email.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        if (res.status === 401) {
          window.location.assign("/login?next=/book");
          return;
        }
        setBookingError(data.error || "Booking failed. Please try again.");
      } else {
        setBookingId(data.bookingId);
        sessionStorage.removeItem(SS_KEY);
        goToStep(5);
      }
    } catch {
      setBookingError("Network error. Please try again.");
    } finally {
      setBookingLoading(false);
    }
  };

  const canBack = step > 1 && step < 5;

  return (
    <div className="min-h-screen bg-surface">
      <div className="bg-white border-b border-border">
        <div className="mx-auto max-w-3xl px-4 py-4 flex items-center justify-between">
          <Link href="/" className="inline-flex">
            <Logo className="text-xl sm:text-2xl" />
          </Link>
          {canBack ? (
            <button
              onClick={() => goToStep(step - 1)}
              aria-label="Back"
              className="group inline-flex items-center gap-1.5 rounded-full border border-border bg-white px-3 py-2 sm:px-4 text-xs sm:text-sm font-semibold text-ink-soft hover:border-primary/40 hover:bg-primary-soft hover:text-primary-dark transition-colors"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="transition-transform group-hover:-translate-x-0.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 12H5m0 0l6-6m-6 6l6 6" />
              </svg>
              <span className="hidden sm:inline">Back</span>
            </button>
          ) : (
            <Link
              href="/"
              aria-label="Home"
              className="group inline-flex items-center gap-1.5 rounded-full border border-border bg-white px-3 py-2 sm:px-4 text-xs sm:text-sm font-semibold text-ink-soft hover:border-primary/40 hover:bg-primary-soft hover:text-primary-dark transition-colors"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" className="transition-transform group-hover:-translate-y-0.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 11l9-8 9 8M5 10v10a1 1 0 001 1h3v-6h6v6h3a1 1 0 001-1V10" />
              </svg>
              <span className="hidden sm:inline">Home</span>
            </Link>
          )}
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-4 py-8 sm:py-12">
        <StepIndicator current={step} />

        <div className="bg-white border border-border rounded-2xl p-5 sm:p-8 shadow-soft">
          <div className={`transition-all duration-200 ${animating ? "opacity-0 translate-y-2" : "opacity-100 translate-y-0"}`}>
            {step === 1 && (
              <SportStep
                selected={sport}
                onSelect={handleSportSelect}
                onNext={() => sport && goToStep(2)}
              />
            )}
            {step === 2 && (
              <DateStep
                selected={date}
                onSelect={handleDateSelect}
                onNext={() => date && goToStep(3)}
                onBack={() => goToStep(1)}
              />
            )}
            {step === 3 && (
              <SlotStep
                slots={slots}
                selected={slotTime}
                onSelect={(t) => setSlotTime(slotTime === t ? null : t)}
                onNext={() => slotTime && goToStep(4)}
                onBack={() => goToStep(2)}
                loading={slotsLoading}
                error={slotsError}
              />
            )}
            {step === 4 && (
              <DetailsStep
                name={name}
                phone={phone}
                email={email}
                onNameChange={setName}
                onPhoneChange={setPhone}
                onEmailChange={setEmail}
                onSubmit={handleSubmit}
                onBack={() => goToStep(3)}
                loading={bookingLoading}
                error={bookingError}
              />
            )}
            {step === 5 && bookingId && sport && date && slotTime && (
              <ConfirmStep
                bookingId={bookingId}
                sportName={sport.name}
                date={date}
                slotTime={slotTime}
                price={sport.priceINR}
                name={name}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
