function StatsCard({ title, value, subtitle, icon: Icon, color, bg }) {
  return (
    <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6 transition-all duration-300 hover:-translate-y-1 hover:border-cyan-500/40 hover:shadow-lg hover:shadow-cyan-500/10">
      {/* Icon */}
      <div
        className={`mb-5 flex h-14 w-14 items-center justify-center rounded-2xl ${bg}`}
      >
        <Icon className={color} size={28} />
      </div>

      {/* Title */}
      <p className="text-sm text-slate-400">{title}</p>

      {/* Value */}
      <h3 className="mt-2 text-2xl font-bold text-white">{value}</h3>

      {/* Subtitle */}
      <p className="mt-2 text-sm text-slate-500">{subtitle}</p>
    </div>
  );
}

export default StatsCard;
