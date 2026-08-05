import LandingLayout from "@/layouts/LandingLayout";
import HeroSection from "@/components/sections/HeroSection";
import MVPModulesSection from "@/components/sections/MVPModulesSection";
import HowItWorksSection from "@/components/sections/HowItWorksSection";
import TrustSafetySection from "@/components/sections/TrustSafetySection";
import Footer from "@/components/sections/Footer";
function LandingPage() {
  return (
    <LandingLayout>
      <HeroSection />
      <MVPModulesSection />
      <HowItWorksSection />
      <TrustSafetySection />
      <Footer />
    </LandingLayout>
  );
}

export default LandingPage;
