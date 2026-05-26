// ═══════════════════════════════════════════════════════════════════════════
// PlayFactory — Single source of truth for site content & pricing.
// Edit values below; the entire site rebuilds from this file.
// Anything marked "TODO" must be replaced with real data before going live.
// ═══════════════════════════════════════════════════════════════════════════

export const BUSINESS = {
  name: "PlayFactory 24×7",
  tagline: "Where Champions Play",
  address: "No.1 PlayFactory 24×7 Campus, Paruthipattu, Avadi, Chennai - 600071",
  city: "Chennai",
  // Primary phone (with country code, no +)
  phone: "919445745993",
  phoneDisplay: "+91 94457 45993",
  // Secondary phone
  phone2: "918148547046",
  phone2Display: "+91 81485 47046",
  email: "admin@playfactory24x7.com",
  hours: "6:00 AM — 11:00 PM, all days",
  mapEmbedSrc:
    "https://maps.google.com/maps?q=PlayFactory+24x7+Paruthipattu+Avadi+Chennai+600071&output=embed",
  website: "https://www.playfactory24x7.com/",
  youtube: "https://www.youtube.com/@playfactory24x7",
  facebook: "https://www.facebook.com/PLAYFTRY24x7/",
};

// ─── BOOKING — courts you can rent by the hour from the website ──────────────
// `id` is what we store; `priceINR` is the per-slot price for the customer.
// `courts` is the parallel-court count (e.g. 2 badminton courts = 2 bookings
// per hour are allowed before the slot greys out).
export type SportId =
  | "badminton-court"
  | "badminton-guest"
  | "cricket-turf"
  | "tt-court"
  | "tt-guest";

export interface Sport {
  id: SportId;
  name: string;
  shortName: string;
  priceINR: number;
  durationMin: number;
  courts: number; // parallel slots per hour
  openTime: string; // "06:00"
  closeTime: string; // "23:00"
  icon: string; // emoji or short label for cards
  description: string;
}

export const SPORTS: Sport[] = [
  {
    id: "badminton-court",
    name: "Badminton Court Booking — 1 Hour",
    shortName: "Badminton Court",
    priceINR: 400, // TODO: confirm
    durationMin: 60,
    courts: 4, // TODO: confirm number of badminton courts
    openTime: "06:00",
    closeTime: "23:00",
    icon: "🏸",
    description: "Reserve a full court for your group. Shuttle not included.",
  },
  {
    id: "badminton-guest",
    name: "Badminton Guest Player — 1 Hour",
    shortName: "Badminton Guest Player",
    priceINR: 150, // TODO: confirm
    durationMin: 60,
    courts: 8, // TODO: confirm (depends on max guest slots per hour)
    openTime: "06:00",
    closeTime: "23:00",
    icon: "🏸",
    description: "Join an existing game as a guest player. Walk in, play, leave.",
  },
  {
    id: "cricket-turf",
    name: "Cricket Turf — 1 Hour",
    shortName: "Cricket Turf",
    priceINR: 1200, // TODO: confirm
    durationMin: 60,
    courts: 1, // TODO: confirm
    openTime: "06:00",
    closeTime: "23:00",
    icon: "🏏",
    description: "Full turf for box cricket. Stumps & bowling machine on request.",
  },
  {
    id: "tt-court",
    name: "Table Tennis Court Booking — 1 Hour",
    shortName: "Table Tennis Court",
    priceINR: 250, // TODO: confirm
    durationMin: 60,
    courts: 2, // TODO: confirm
    openTime: "06:00",
    closeTime: "23:00",
    icon: "🏓",
    description: "Reserve a full TT table. Bats and balls provided.",
  },
  {
    id: "tt-guest",
    name: "Table Tennis Guest Player — 1 Hour",
    shortName: "Table Tennis Guest Player",
    priceINR: 100, // TODO: confirm
    durationMin: 60,
    courts: 4, // TODO: confirm
    openTime: "06:00",
    closeTime: "23:00",
    icon: "🏓",
    description: "Join in as a guest. Great if you're flying solo.",
  },
];

// ─── COACHING — info-only catalog (no online booking) ────────────────────────
export interface Coaching {
  name: string;
  // TODO: confirm prices
  priceINR: number;
  cadence: string; // e.g. "per month"
  category: "Badminton" | "Table Tennis" | "Dance" | "Drawing" | "Silambam" | "Cricket";
  highlights: string[];
}

export const COACHING: Coaching[] = [
  {
    name: "Badminton — Professional Coaching (Regular)",
    priceINR: 3000,
    cadence: "per month",
    category: "Badminton",
    highlights: ["6 days a week", "Beginner to intermediate", "Coach-supervised drills"],
  },
  {
    name: "Badminton — Professional Coaching (Weekend)",
    priceINR: 2000,
    cadence: "per month",
    category: "Badminton",
    highlights: ["Saturday + Sunday", "Working professionals welcome"],
  },
  {
    name: "Badminton — Professional Coaching (3 Days a Week)",
    priceINR: 2500,
    cadence: "per month",
    category: "Badminton",
    highlights: ["MWF or TThS schedule", "Steady progression"],
  },
  {
    name: "Badminton — Fiber Shuttle Program",
    priceINR: 3500,
    cadence: "per month",
    category: "Badminton",
    highlights: ["Fiber shuttles included", "Match practice focus"],
  },
  {
    name: "Badminton Coaching — Advanced (3 hr/day)",
    priceINR: 6000,
    cadence: "per month",
    category: "Badminton",
    highlights: ["3-hour intensive blocks", "Tournament prep"],
  },
  {
    name: "Badminton — Special Half Day",
    priceINR: 8000,
    cadence: "per month",
    category: "Badminton",
    highlights: ["4 hours daily", "Strength + conditioning"],
  },
  {
    name: "Badminton — Special Full Day",
    priceINR: 15000,
    cadence: "per month",
    category: "Badminton",
    highlights: ["Full-day academy track", "Personal coach allocation"],
  },
  {
    name: "Table Tennis Coaching",
    priceINR: 2500,
    cadence: "per month",
    category: "Table Tennis",
    highlights: ["All age groups", "Spin & stroke fundamentals"],
  },
  {
    name: "Dance",
    priceINR: 1800,
    cadence: "per month",
    category: "Dance",
    highlights: ["Classical & contemporary", "Kids & adult batches"],
  },
  {
    name: "Drawing",
    priceINR: 1500,
    cadence: "per month",
    category: "Drawing",
    highlights: ["Pencil, watercolor, sketch", "Take-home materials list"],
  },
  {
    name: "Silambam",
    priceINR: 1500,
    cadence: "per month",
    category: "Silambam",
    highlights: ["Traditional Tamil martial art", "Discipline + fitness"],
  },
  {
    name: "Cricket",
    priceINR: 2500,
    cadence: "per month",
    category: "Cricket",
    highlights: ["Net practice + match play", "Bowling + batting tracks"],
  },
];

// ─── MEMBERSHIPS — facility access plans ─────────────────────────────────────
export interface Membership {
  name: string;
  // TODO: confirm prices
  priceINR: number;
  cadence: string;
  perks: string[];
  featured?: boolean;
}

export const MEMBERSHIPS: Membership[] = [
  {
    name: "Badminton — Men",
    priceINR: 1500,
    cadence: "per month",
    perks: ["Open-play access", "Men's batch hours", "Locker access"],
  },
  {
    name: "Badminton — Women",
    priceINR: 1500,
    cadence: "per month",
    perks: ["Open-play access", "Women's batch hours", "Locker access"],
  },
  {
    name: "Table Tennis — Men",
    priceINR: 1200,
    cadence: "per month",
    perks: ["Open-play access", "Men's batch hours"],
  },
  {
    name: "Table Tennis — Women",
    priceINR: 1200,
    cadence: "per month",
    perks: ["Open-play access", "Women's batch hours"],
  },
  {
    name: "GYM",
    priceINR: 1000,
    cadence: "per month",
    perks: ["Cardio + strength zone", "Open all hours"],
    featured: true,
  },
];

// ─── PUBLIC ENV — exposed to the browser ─────────────────────────────────────
export const PUBLIC_WHATSAPP =
  process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || BUSINESS.phone;

// Number of days into the future a customer can book.
export const BOOKING_HORIZON_DAYS = 14;

// Indian rupee formatter
export const formatINR = (n: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n);
