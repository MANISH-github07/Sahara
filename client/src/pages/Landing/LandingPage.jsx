import LandingLayout from "@/layouts/LandingLayout";
import HeroSection from "@/components/sections/HeroSection";
import MVPModulesSection from "@/components/sections/MVPModulesSection";

function LandingPage() {
  return (
    <LandingLayout>
      <HeroSection />
      <MVPModulesSection />
    </LandingLayout>
  );
}

export default LandingPage;
