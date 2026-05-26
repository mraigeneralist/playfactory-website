"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { format } from "date-fns";
import { SPORTS, BUSINESS, type Sport, type SportId } from "@/lib/constants";
import type { Slot } from "@/lib/types";
import { createClient } from "@/lib/supabase/browser";
import StepIndicator from "@/components/booking/StepIndicator";
import SportStep from "@/components/booking/SportStep";
import DateStep from "@/components/booking/DateStep";
import SlotStep from "@/components/booking/SlotStep";
import DetailsStep from "@/components/booking/DetailsStep";
import ConfirmStep from "@/components/booking/ConfirmStep";

const SS_KEY = "pf-booking";

function BookContent() {
  const router = useRouter();
  const params = useSearchParams();
  const preselectId = params.get("sport") as SportId | null;

  const [step, setStep] = useState(1);
  const [animating, setAnimating] = useState(false);

  const [sport, setSport] = useState<Sport | null>(null);
  const [date, setDate] = useState<Date | null>(null);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [slotsError, setSlotsError] = useState<string | null>(null);
  const [slotTime, setSlotTime] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");

  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [bookingId, setBookingId] = useState<string | null>(null);

  // Restore from sessionStorage + prefill from profile on mount
  useEffect(() => {
    if (preselectId) {
      const s = SPORTS.find((x) => x.id === preselectId);
      if (s) setSport(s);
    }

    // Prefill name/phone/email from the logged-in user's profile. The proxy
    // already guarantees we're authenticated by the time this page renders.
    (async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.replace("/login?next=/book");
        return;
      }
      const { data: profile } = await supabase
        .from("profiles")
        .select("name, phone, email")
        .eq("id", user.id)
        .maybeSingle();
      if (profile) {
        setName((cur) => cur || profile.name || "");
        setPhone((cur) => cur || profile.phone || "");
        setEmail((cur) => cur || profile.email || user.email || "");
      } else {
        setEmail((cur) => cur || user.email || "");
      }
    })();

    const saved = sessionStorage.getItem(SS_KEY);
    if (!saved) return;
    try {
      const s = JSON.parse(saved);
      if (s.sportId) {
        const found = SPORTS.find((x) => x.id === s.sportId);
        if (found) setSport(found);
      }
      if (s.date) setDate(new Date(s.date));
      if (s.slotTime) setSlotTime(s.slotTime);
      if (s.name) setName(s.name);
      if (s.phone) setPhone(s.phone);
      if (s.email) setEmail(s.email);
      if (s.step && s.step < 5) setStep(s.step);
    } catch {}
  }, [preselectId, router]);

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
        name,
        phone,
        email,
      })
    );
  }, [step, sport, date, slotTime, name, phone, email]);

  // Fetch slots when sport+date are set
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
          <Link href="/" className="flex items-center gap-2">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-white font-bold">
              P
            </span>
            <span className="font-heading text-xl font-bold text-primary-deep">
              {BUSINESS.name}
            </span>
          </Link>
          {canBack ? (
            <button
              onClick={() => goToStep(step - 1)}
              className="text-sm text-ink-soft hover:text-primary flex items-center gap-1"
            >
              ← Back
            </button>
          ) : (
            <Link href="/" className="text-sm text-ink-soft hover:text-primary">
              ← Home
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

export default function BookPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-surface" />}>
      <BookContent />
    </Suspense>
  );
}
