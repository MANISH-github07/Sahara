function Badge({ children, className = "" }) {
  return (
    <span
      className={`
        inline-flex items-center
        rounded-full
        border border-cyan-500/30
        bg-cyan-500/10
        px-4
        py-2
        text-sm
        font-medium
        text-cyan-400
        ${className}
      `}
    >
      {children}
    </span>
  );
}

export default Badge;
