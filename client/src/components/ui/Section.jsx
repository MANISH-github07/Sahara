function Section({
  children,
  className = "",
  background = "bg-slate-950",
  spacing = "py-24",
  id,
}) {
  return (
    <section id={id} className={`${background} ${spacing} ${className}`}>
      {children}
    </section>
  );
}

export default Section;
