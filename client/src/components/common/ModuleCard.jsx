import { Card, CardContent } from "@/components/ui/card";

function ModuleCard({ title, description, icon: Icon, color }) {
  return (
    <Card className="group h-full border-slate-800 bg-slate-900 transition-all duration-300 hover:-translate-y-2 hover:border-cyan-500/50 hover:shadow-xl hover:shadow-cyan-500/10">
      <CardContent className="flex h-full flex-col p-6">
        {/* Icon */}
        <div
          className={`mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-800 ${color}`}
        >
          <Icon size={28} />
        </div>

        {/* Title */}
        <h3 className="text-xl font-semibold text-white">{title}</h3>

        {/* Description */}
        <p className="mt-3 text-sm leading-6 text-slate-400">{description}</p>
      </CardContent>
    </Card>
  );
}

export default ModuleCard;
