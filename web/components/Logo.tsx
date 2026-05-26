interface Props {
  className?: string;
  /** "light" inverts the "Play" color for use on dark backgrounds. */
  variant?: "default" | "light";
}

export default function Logo({ className = "text-2xl", variant = "default" }: Props) {
  const inkClass = variant === "light" ? "text-white" : "text-ink";
  return (
    <span
      className={`font-heading font-extrabold tracking-tight leading-none whitespace-nowrap ${className}`}
    >
      <span className={inkClass}>Play</span>
      <span className="gradient-text">Factory</span>
      <span className={`text-[0.55em] font-bold align-baseline ml-1 ${inkClass}`}>
        24×7
      </span>
    </span>
  );
}
