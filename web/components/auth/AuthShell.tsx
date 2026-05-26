import Link from "next/link";
import Logo from "@/components/Logo";

interface Props {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  // When the user arrived here because we redirected them from a protected
  // page (e.g. /book), show a contextual banner that explains why and what
  // will happen after they sign in.
  redirectedFrom?: string | null;
}

const REDIRECT_LABELS: Record<string, { title: string; body: string }> = {
  "/book": {
    title: "Sign in to book your slot",
    body: "Bookings are tied to your account so you can view, reschedule and cancel them later. Takes 30 seconds.",
  },
  "/account": {
    title: "Sign in to view your account",
    body: "Your bookings and profile live in your account.",
  },
};

export default function AuthShell({ title, subtitle, children, footer, redirectedFrom }: Props) {
  const ctx = redirectedFrom ? REDIRECT_LABELS[redirectedFrom] : null;

  return (
    <div className="min-h-screen flex flex-col bg-surface">
      <div className="bg-white border-b border-border">
        <div className="mx-auto max-w-3xl px-4 py-4 flex items-center justify-between">
          <Link href="/" className="inline-flex">
            <Logo className="text-xl sm:text-2xl" />
          </Link>
        </div>
      </div>
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          {ctx && (
            <div className="mb-4 rounded-2xl border border-primary/30 bg-primary-soft p-4 flex gap-3">
              <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-white">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
              </span>
              <div>
                <div className="font-heading font-bold text-primary-deep">{ctx.title}</div>
                <p className="mt-0.5 text-xs text-primary-deep/80 leading-relaxed">{ctx.body}</p>
              </div>
            </div>
          )}
          <div className="rounded-2xl bg-white p-8 shadow-soft border border-border">
            <h1 className="font-heading text-2xl font-bold text-ink mb-1">{title}</h1>
            {subtitle && <p className="text-sm text-ink-soft mb-6">{subtitle}</p>}
            {children}
            {footer && (
              <div className="mt-6 pt-5 border-t border-border text-center text-sm text-ink-soft">
                {footer}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
