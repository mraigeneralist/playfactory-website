interface Props {
  className?: string;
  /** "light" inverts the "Play" color for use on dark backgrounds. */
  variant?: "default" | "light";
}

export default function Logo({ className = "text-2xl", variant = "default" }: Props) {
  return (
    <span
      className={`font-heading font-extrabold tracking-tight leading-none inline-flex items-baseline gap-1 ${className}`}
    >
      <span>
        <span className={variant === "light" ? "text-white" : "text-ink"}>Play</span>
        <span className="gradient-text">Factory</span>
      </span>
      <span className="text-[0.55em] font-bold tracking-wider text-primary-dark">
        24×7
      </span>
    </span>
  );
}
