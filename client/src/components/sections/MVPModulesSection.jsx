import Container from "@/components/layout/Container";
import ModuleCard from "@/components/common/ModuleCard";
import { MODULES } from "@/constants/modules";

function MVPModulesSection() {
  return (
    <section className="bg-slate-950 py-24">
      <Container>
        {/* Section Heading */}
        <div className="mx-auto mb-16 max-w-3xl text-center">
          <span className="rounded-full border border-cyan-500/30 bg-cyan-500/10 px-4 py-2 text-sm font-medium text-cyan-400">
            Core SAHARA MVP
          </span>

          <h2 className="mt-6 text-4xl font-bold text-white">
            Everything You Need in One Platform
          </h2>

          <p className="mt-5 text-lg text-slate-400">
            SAHARA integrates mental wellness, responsible AI, validated
            screening, professional care, and privacy-first design into a single
            platform.
          </p>
        </div>

        {/* Module Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {MODULES.map((module) => (
            <ModuleCard
              key={module.id}
              title={module.title}
              description={module.description}
              icon={module.icon}
              color={module.color}
            />
          ))}
        </div>
      </Container>
    </section>
  );
}

export default MVPModulesSection;
