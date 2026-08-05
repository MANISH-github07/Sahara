import Badge from "@/components/ui/Badge";

function SectionHeading({ badge, title, description, align = "center" }) {
  const alignment = align === "left" ? "text-left" : "text-center";

  return (
    <div className={`mx-auto mb-16 max-w-3xl ${alignment}`}>
      {badge && <Badge>{badge}</Badge>}

      <h2 className="mt-6 text-4xl font-bold text-white">{title}</h2>

      {description && (
        <p className="mt-5 text-lg leading-8 text-slate-400">{description}</p>
      )}
    </div>
  );
}

export default SectionHeading;
