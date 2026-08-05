import Container from "@/components/layout/Container";
import HeroContent from "@/components/hero/HeroContent";
import HeroIllustration from "@/components/hero/HeroIllustration";
import HeroStats from "@/components/hero/HeroStats";

function HeroSection() {
  return (
    <section className="bg-slate-950 py-24">
      <Container>
        {/* Main Hero */}
        <div className="grid items-center gap-16 lg:grid-cols-2">
          <HeroContent />
          <HeroIllustration />
        </div>

        {/* Feature Highlights */}
        <HeroStats />
      </Container>
    </section>
  );
}

export default HeroSection;
