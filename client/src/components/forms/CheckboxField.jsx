function CheckboxField({ label, checked, onChange }) {
  return (
    <label className="flex items-center gap-3 text-sm text-slate-300">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="h-4 w-4 rounded border-slate-600"
      />

      {label}
    </label>
  );
}

export default CheckboxField;
