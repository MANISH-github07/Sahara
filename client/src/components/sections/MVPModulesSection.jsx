import Container from "@/components/layout/Container";
import ModuleCard from "@/components/common/ModuleCard";
import { MODULES } from "@/constants/modules";
import Section from "@/components/ui/Section";
import SectionHeading from "@/components/ui/SectionHeading";
function MVPModulesSection() {
  return (
    <Section>
      <Container>
        {/* Section Heading */}
        <SectionHeading
          badge="Core SAHARA MVP"
          title="Everything You Need in One Platform"
          description="SAHARA integrates mental wellness, responsible AI, validated screening, professional care, and privacy-first design into a single platform."
        />

        {/* Module Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {MODULES.map((module) => (
            <ModuleCard
              key={module.id}
              title={module.title}
              features={module.features}
              icon={module.icon}
              color={module.color}
            />
          ))}
        </div>
      </Container>
    </Section>
  );
}

export default MVPModulesSection;
