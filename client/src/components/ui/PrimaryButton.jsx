function PrimaryButton({
  children,
  type = "button",
  onClick,
  className = "",
  disabled = false,
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`
        inline-flex items-center justify-center
        rounded-xl
        bg-cyan-500
        px-6
        py-3
        font-semibold
        text-slate-950
        transition-all
        duration-300
        hover:bg-cyan-400
        disabled:cursor-not-allowed
        disabled:opacity-50
        ${className}
      `}
    >
      {children}
    </button>
  );
}

export default PrimaryButton;
