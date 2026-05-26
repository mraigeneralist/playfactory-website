import Link from "next/link";
import { BUSINESS } from "@/lib/constants";

export default function AuthShell({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-surface">
      <div className="bg-white border-b border-border">
        <div className="mx-auto max-w-3xl px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-white font-bold">P</span>
            <span className="font-heading text-xl font-bold text-primary-deep">{BUSINESS.name}</span>
          </Link>
        </div>
      </div>
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-soft border border-border">
          <h1 className="font-heading text-2xl font-bold text-ink mb-1">{title}</h1>
          {subtitle && <p className="text-sm text-ink-soft mb-6">{subtitle}</p>}
          {children}
          {footer && <div className="mt-6 text-center text-sm text-ink-soft">{footer}</div>}
        </div>
      </main>
    </div>
  );
}
