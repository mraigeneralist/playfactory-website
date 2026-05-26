import type { Metadata, Viewport } from "next";
import { Poppins, Inter } from "next/font/google";
import "./globals.css";
import { BUSINESS } from "@/lib/constants";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
});

export const metadata: Metadata = {
  title: `${BUSINESS.name} — Book Courts, Coaching & Memberships`,
  description: `Book badminton courts, cricket turf and table tennis online at ${BUSINESS.name}. Coaching for badminton, table tennis, dance, drawing, silambam and cricket. Memberships available.`,
  keywords:
    "badminton court booking, cricket turf, table tennis, sports coaching, badminton coaching, " +
    BUSINESS.name,
  applicationName: BUSINESS.name,
};

export const viewport: Viewport = {
  themeColor: "#16a34a",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${poppins.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-bg text-ink">
        {children}
      </body>
    </html>
  );
}
