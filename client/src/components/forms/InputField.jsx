function InputField({
  label,
  type = "text",
  placeholder,
  value,
  onChange,
  error,
  required = false,
}) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-slate-300">
        {label}
        {required && <span className="ml-1 text-red-400">*</span>}
      </label>

      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className={`w-full rounded-xl border bg-slate-900 px-4 py-3 text-white outline-none transition ${
          error
            ? "border-red-500 focus:border-red-500"
            : "border-slate-700 focus:border-cyan-500"
        }`}
      />

      {error && <p className="text-sm text-red-400">{error}</p>}
    </div>
  );
}

export default InputField;
