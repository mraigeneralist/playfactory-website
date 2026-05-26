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
