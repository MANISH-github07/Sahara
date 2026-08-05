import { CheckCircle2 } from "lucide-react";

function ModuleCard({ title, features, icon: Icon, color }) {
  return (
    <div className="group h-full rounded-3xl border border-slate-800 bg-slate-900 p-7 transition-all duration-300 hover:-translate-y-2 hover:border-cyan-500/40 hover:shadow-2xl hover:shadow-cyan-500/10">
      {/* Icon */}
      <div
        className={`mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-800 ${color} transition-transform duration-300 group-hover:scale-110`}
      >
        <Icon size={30} />
      </div>

      {/* Title */}
      <h3 className="mb-5 text-xl font-bold text-white">{title}</h3>

      {/* Features */}
      <div className="space-y-3">
        {features.map((feature) => (
          <div key={feature} className="flex items-center gap-3 text-slate-300">
            <CheckCircle2 className="h-4 w-4 text-cyan-400" />
            <span>{feature}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ModuleCard;
