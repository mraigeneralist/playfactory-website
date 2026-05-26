// Generate hourly slot start times between open and close.
// Returns ["06:00", "07:00", ...]. Half-open: includes open, excludes close.
export function generateHourlySlots(openTime: string, closeTime: string): string[] {
  const [oh] = openTime.split(":").map(Number);
  const [ch] = closeTime.split(":").map(Number);
  const out: string[] = [];
  for (let h = oh; h < ch; h++) {
    out.push(`${String(h).padStart(2, "0")}:00`);
  }
  return out;
}

// "07:00" -> "7:00 AM"
export function formatSlotDisplay(time: string): string {
  const [h, m] = time.split(":").map(Number);
  const period = h >= 12 ? "PM" : "AM";
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return `${hour12}:${String(m).padStart(2, "0")} ${period}`;
}

// Current date + time in Asia/Kolkata, useful for "is this slot in the past?"
// checks on the server (where the process timezone is UTC).
export function nowInIST(): { date: string; minutes: number } {
  const fmt = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  const parts = fmt.formatToParts(new Date());
  const get = (t: string) => Number(parts.find((p) => p.type === t)?.value || "0");
  const yyyy = parts.find((p) => p.type === "year")?.value;
  const mm = parts.find((p) => p.type === "month")?.value;
  const dd = parts.find((p) => p.type === "day")?.value;
  return {
    date: `${yyyy}-${mm}-${dd}`,
    minutes: get("hour") * 60 + get("minute"),
  };
}
