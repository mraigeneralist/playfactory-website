interface Props {
  className?: string;
  /** "light" inverts the "Play" color for use on dark backgrounds. */
  variant?: "default" | "light";
}

export default function Logo({ className = "text-xl", variant = "default" }: Props) {
  return (
    <span
      className={`font-heading font-extrabold tracking-tight leading-none ${className}`}
    >
      <span className={variant === "light" ? "text-white" : "text-ink"}>Play</span>
      <span className="gradient-text">Factory</span>
    </span>
  );
}
