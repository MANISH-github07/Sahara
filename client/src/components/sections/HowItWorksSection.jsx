import Container from "@/components/layout/Container";
import WorkflowCard from "@/components/common/WorkflowCard";
import { WORKFLOW } from "@/constants/workflow";

function HowItWorksSection() {
  return (
    <section className="bg-slate-900 py-24">
      <Container>
        {/* Heading */}
        <div className="mx-auto mb-16 max-w-3xl text-center">
          <span className="rounded-full border border-cyan-500/30 bg-cyan-500/10 px-4 py-2 text-sm font-medium text-cyan-400">
            How SAHARA Works
          </span>

          <h2 className="mt-6 text-4xl font-bold text-white">
            Your Mental Wellness Journey
          </h2>

          <p className="mt-5 text-lg text-slate-400">
            SAHARA guides you through a structured journey—from onboarding and
            screening to AI-assisted support and professional care when needed.
          </p>
        </div>

        {/* Timeline */}
        <div>
          {WORKFLOW.map((item, index) => (
            <WorkflowCard
              key={item.id}
              step={item.step}
              title={item.title}
              description={item.description}
              isLast={index === WORKFLOW.length - 1}
            />
          ))}
        </div>
      </Container>
    </section>
  );
}

export default HowItWorksSection;
