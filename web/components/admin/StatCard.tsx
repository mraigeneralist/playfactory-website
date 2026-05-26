interface Props {
  label: string;
  value: string;
  hint?: string;
  accent?: "primary" | "neutral";
}

export default function StatCard({ label, value, hint, accent = "neutral" }: Props) {
  return (
    <div
      className={`rounded-2xl p-5 shadow-soft ${
        accent === "primary"
          ? "bg-gradient-to-br from-primary to-primary-dark text-white"
          : "bg-white border border-border"
      }`}
    >
      <div
        className={`text-[11px] uppercase tracking-wider font-semibold mb-2 ${
          accent === "primary" ? "text-white/80" : "text-muted"
        }`}
      >
        {label}
      </div>
      <div
        className={`text-3xl font-bold font-heading ${
          accent === "primary" ? "text-white" : "text-primary-dark"
        }`}
      >
        {value}
      </div>
      {hint && (
        <div
          className={`mt-1 text-xs ${
            accent === "primary" ? "text-white/70" : "text-ink-soft"
          }`}
        >
          {hint}
        </div>
      )}
    </div>
  );
}
