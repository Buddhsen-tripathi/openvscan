import { createFileRoute } from "@tanstack/react-router";
import Footer from "@/components/Footer";
import HeroSection from "@/components/HeroSection";
import CTASection from "@/components/homepage/CTASection";
import FAQSection from "@/components/homepage/FAQSection";
import FeatureSection from "@/components/homepage/FeatureSection";
import FeatureShowcaseSection from "@/components/homepage/FeatureShowcaseSection";
import HowItWorksSection from "@/components/homepage/HowItWorksSection";
import Navbar from "@/components/Navbar";

export const Route = createFileRoute("/")({
  component: HomePage,
});

function HomePage() {
  return (
    <main>
      <Navbar />
      <HeroSection />
      <FeatureSection />
      <HowItWorksSection />
      <FeatureShowcaseSection />
      <FAQSection />
      <CTASection />
      <Footer />
    </main>
  );
}
