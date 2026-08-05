import Container from "@/components/layout/Container";
import { TRUST_POINTS } from "@/constants/trust";
import { CheckCircle2 } from "lucide-react";

function TrustSafetySection() {
  return (
    <section className="relative overflow-hidden bg-slate-950 py-24">
      {/* Background Glow */}
      <div className="absolute left-0 top-0 h-72 w-72 rounded-full bg-cyan-500/10 blur-3xl"></div>
      <div className="absolute bottom-0 right-0 h-72 w-72 rounded-full bg-blue-500/10 blur-3xl"></div>

      <Container>
        {/* Heading */}
        <div className="mx-auto mb-16 max-w-3xl text-center">
          <span className="rounded-full border border-cyan-500/30 bg-cyan-500/10 px-4 py-2 text-sm font-medium text-cyan-400">
            Why Choose SAHARA
          </span>

          <h2 className="mt-6 text-4xl font-bold text-white">
            Built Around Trust, Privacy & Professional Care
          </h2>

          <p className="mt-5 text-lg leading-8 text-slate-400">
            Every decision in SAHARA is guided by responsible AI, secure
            architecture, and evidence-based mental wellness practices.
          </p>
        </div>

        {/* Cards */}
        <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-4">
          {TRUST_POINTS.map((item) => {
            const Icon = item.icon;

            return (
              <div
                key={item.id}
                className="group rounded-3xl border border-slate-800 bg-slate-900/70 p-8 backdrop-blur transition-all duration-300 hover:-translate-y-2 hover:border-cyan-500/40 hover:shadow-2xl hover:shadow-cyan-500/10"
              >
                {/* Icon */}
                <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-cyan-500/10 text-cyan-400 transition-transform duration-300 group-hover:scale-110">
                  <Icon size={34} />
                </div>

                {/* Title */}
                <h3 className="text-center text-xl font-bold text-white">
                  {item.title}
                </h3>

                {/* Description */}
                <p className="mt-4 text-center leading-7 text-slate-400">
                  {item.description}
                </p>

                {/* Badge */}
                <div className="mt-8 flex items-center justify-center gap-2 rounded-full bg-slate-800 py-3 text-sm font-medium text-cyan-400">
                  <CheckCircle2 size={18} />
                  {item.badge}
                </div>
              </div>
            );
          })}
        </div>
      </Container>
    </section>
  );
}

export default TrustSafetySection;
