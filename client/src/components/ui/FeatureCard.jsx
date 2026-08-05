function FeatureCard({
  icon: Icon,
  title,
  description,
  children,
  className = "",
}) {
  return (
    <div
      className={`
        rounded-2xl
        border
        border-slate-800
        bg-slate-800/60
        p-5
        transition-all
        duration-300
        hover:-translate-y-1
        hover:border-cyan-500/40
        ${className}
      `}
    >
      {Icon && (
        <div className="mb-4 text-cyan-400">
          <Icon size={28} />
        </div>
      )}

      {title && <h3 className="text-lg font-semibold text-white">{title}</h3>}

      {description && (
        <p className="mt-2 text-sm leading-6 text-slate-400">{description}</p>
      )}

      {children}
    </div>
  );
}

export default FeatureCard;
