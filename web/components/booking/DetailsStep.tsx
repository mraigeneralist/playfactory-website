"use client";

interface Props {
  name: string;
  phone: string;
  email: string;
  onNameChange: (v: string) => void;
  onPhoneChange: (v: string) => void;
  onEmailChange: (v: string) => void;
  onSubmit: () => void;
  onBack: () => void;
  loading: boolean;
  error: string | null;
}

export default function DetailsStep({
  name, phone, email,
  onNameChange, onPhoneChange, onEmailChange,
  onSubmit, onBack, loading, error,
}: Props) {
  const phoneValid = /^[6-9]\d{9}$/.test(phone);
  const nameValid = name.trim().length >= 2;
  const canSubmit = phoneValid && nameValid && !loading;

  return (
    <div>
      <h2 className="font-heading text-2xl font-bold text-ink mb-2">Your details</h2>
      <p className="text-ink-soft mb-6">We'll text the confirmation to your number.</p>

      <div className="space-y-4">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-muted mb-1.5">
            Full name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => onNameChange(e.target.value)}
            placeholder="e.g. Arjun Kumar"
            className="w-full rounded-xl border border-border bg-white px-4 py-3 text-ink placeholder:text-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-muted mb-1.5">
            Phone (10 digits)
          </label>
          <div className="flex">
            <span className="inline-flex items-center rounded-l-xl border border-r-0 border-border bg-surface px-3 text-sm font-semibold text-ink-soft">
              +91
            </span>
            <input
              type="tel"
              inputMode="numeric"
              maxLength={10}
              value={phone}
              onChange={(e) => onPhoneChange(e.target.value.replace(/\D/g, ""))}
              placeholder="9876543210"
              className="flex-1 rounded-r-xl border border-border bg-white px-4 py-3 text-ink placeholder:text-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
          {phone.length > 0 && !phoneValid && (
            <p className="mt-1.5 text-xs text-destructive">Enter a valid 10-digit Indian mobile number.</p>
          )}
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-muted mb-1.5">
            Email (optional)
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => onEmailChange(e.target.value)}
            placeholder="you@email.com"
            className="w-full rounded-xl border border-border bg-white px-4 py-3 text-ink placeholder:text-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>

        {error && (
          <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
            {error}
          </div>
        )}
      </div>

      <div className="mt-8 flex justify-between">
        <button
          onClick={onBack}
          className="rounded-full border border-border bg-white px-6 py-3 text-sm font-semibold text-ink-soft hover:bg-surface"
        >
          ← Back
        </button>
        <button
          disabled={!canSubmit}
          onClick={onSubmit}
          className="btn-primary rounded-full px-7 py-3 text-sm disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {loading ? "Booking…" : "Confirm Booking"}
        </button>
      </div>
    </div>
  );
}
