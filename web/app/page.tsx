import Navbar from "@/components/landing/Navbar";
import HeroSection from "@/components/landing/HeroSection";
import SportsSection from "@/components/landing/SportsSection";
import CoachingPreview from "@/components/landing/CoachingPreview";
import MembershipsPreview from "@/components/landing/MembershipsPreview";
import WhySection from "@/components/landing/WhySection";
import CTASection from "@/components/landing/CTASection";
import Footer from "@/components/landing/Footer";
import WhatsAppFloat from "@/components/ui/WhatsAppFloat";

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main>
        <HeroSection />
        <SportsSection />
        <CoachingPreview />
        <MembershipsPreview />
        <WhySection />
        <CTASection />
      </main>
      <Footer />
      <WhatsAppFloat />
    </>
  );
}
