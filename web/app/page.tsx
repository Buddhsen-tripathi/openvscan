import Footer from '@/components/Footer';
import HeroSection from '@/components/HeroSection';
import FeatureSection from '@/components/homepage/FeatureSection';
import FeatureShowcaseSection from '@/components/homepage/FeatureShowcaseSection';
import HowItWorksSection from '@/components/homepage/HowItWorksSection';
import FAQSection from '@/components/homepage/FAQSection';
import CTASection from '@/components/homepage/CTASection';

export default function Home() {
  return (
    <main>
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
