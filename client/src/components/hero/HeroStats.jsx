import { Brain, HeartPulse, ShieldCheck } from "lucide-react";

const stats = [
  {
    id: 1,
    icon: Brain,
    title: "AI Companion",
    description: "Guided emotional support",
    color: "text-cyan-400",
  },
  {
    id: 2,
    icon: HeartPulse,
    title: "Clinical Screening",
    description: "PHQ-9 & GAD-7",
    color: "text-pink-400",
  },
  {
    id: 3,
    icon: ShieldCheck,
    title: "Privacy First",
    description: "Secure user data",
    color: "text-green-400",
  },
];

function HeroStats() {
  return (
    <div className="mt-12 grid gap-4 sm:grid-cols-3">
      {stats.map((item) => {
        const Icon = item.icon;

        return (
          <div
            key={item.id}
            className="rounded-2xl border border-slate-800 bg-slate-900 p-5 transition-all duration-300 hover:-translate-y-1 hover:border-cyan-500/40"
          >
            <div
              className={`mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-slate-800 ${item.color}`}
            >
              <Icon size={24} />
            </div>

            <h3 className="font-semibold text-white">{item.title}</h3>

            <p className="mt-2 text-sm text-slate-400">{item.description}</p>
          </div>
        );
      })}
    </div>
  );
}

export default HeroStats;
