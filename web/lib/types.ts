import type { SportId } from "./constants";

export interface Slot {
  time: string; // "07:00" 24h
  remaining: number; // courts still free
  available: boolean;
}

export interface BookingPayload {
  sport: SportId;
  sportName: string;
  date: string; // YYYY-MM-DD
  slotTime: string; // "07:00"
  durationMin: number;
  priceINR: number;
  name: string;
  phone: string; // 10-digit, no country code
  email?: string;
}

export interface BookingResult {
  success: boolean;
  bookingId?: string;
  error?: string;
}

export interface AdminBooking {
  bookingId: string;
  createdAt: string;
  sport: string;
  sportName: string;
  date: string;
  slotTime: string;
  durationMin: number;
  price: number;
  name: string;
  phone: string;
  email: string;
  status: "confirmed" | "cancelled" | "no_show" | "completed";
  source: "website" | "whatsapp";
}
