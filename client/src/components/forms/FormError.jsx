function FormError({ message }) {
  if (!message) return null;

  return (
    <p className="rounded-lg bg-red-500/10 px-4 py-3 text-sm text-red-400">
      {message}
    </p>
  );
}

export default FormError;
