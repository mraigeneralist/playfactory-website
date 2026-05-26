const STEPS = ["Sport", "Date", "Slot", "Details", "Done"];

export default function StepIndicator({ current }: { current: number }) {
  const display = Math.min(current, STEPS.length);
  const progress = ((display - 1) / (STEPS.length - 1)) * 100;

  return (
    <div className="mb-10 w-full max-w-lg mx-auto">
      <div className="relative grid" style={{ gridTemplateColumns: `repeat(${STEPS.length}, 1fr)` }}>
        <div className="absolute top-3.5 sm:top-[18px] left-[10%] right-[10%] h-0.5 bg-border" />
        <div
          className="absolute top-3.5 sm:top-[18px] left-[10%] h-0.5 bg-primary transition-all duration-500"
          style={{ width: `calc((100% - 20%) * ${progress / 100})` }}
        />
        {STEPS.map((label, i) => {
          const n = i + 1;
          const active = n === display;
          const done = n < display;
          return (
            <div key={label} className="relative z-10 flex flex-col items-center">
              <div
                className={`w-7 h-7 sm:w-9 sm:h-9 rounded-full flex items-center justify-center text-[11px] sm:text-sm font-semibold transition-all ${
                  done
                    ? "bg-primary text-white"
                    : active
                    ? "bg-primary text-white ring-4 ring-primary/20"
                    : "bg-border text-muted"
                }`}
              >
                {done ? (
                  <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                ) : (
                  n
                )}
              </div>
              <span
                className={`text-[9px] sm:text-[10px] mt-2 font-semibold text-center uppercase tracking-wider ${
                  active ? "text-primary" : done ? "text-primary/70" : "text-muted"
                }`}
              >
                {label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
