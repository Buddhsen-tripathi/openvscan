import Footer from '@/components/Footer';
import HeroSection from '@/components/HeroSection';
import FeatureSection from '@/components/homepage/FeatureSection';
import FeatureShowcaseSection from '@/components/homepage/FeatureShowcaseSection';
import CTASection from '@/components/homepage/CTASection';

export default function Home() {
  return (
    <main>
      <HeroSection />
      <FeatureSection />
      <FeatureShowcaseSection />
      <CTASection />
      <Footer />
    </main>
  );
}
