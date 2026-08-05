function WorkflowCard({ step, title, description, isLast }) {
  return (
    <div className="relative flex gap-6">
      {/* Timeline */}
      <div className="flex flex-col items-center">
        {/* Step Circle */}
        <div className="z-10 flex h-16 w-16 items-center justify-center rounded-full border-4 border-slate-900 bg-cyan-500 text-center shadow-lg">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-900">
              Step
            </p>
            <p className="text-lg font-bold text-slate-900">
              {step.split(" ")[1]}
            </p>
          </div>
        </div>

        {/* Vertical Line */}
        {!isLast && (
          <div className="mt-2 h-full w-1 rounded-full bg-slate-700"></div>
        )}
      </div>

      {/* Card */}
      <div className="mb-8 flex-1 rounded-2xl border border-slate-800 bg-slate-900 p-6 transition-all duration-300 hover:-translate-y-1 hover:border-cyan-500/40 hover:shadow-xl hover:shadow-cyan-500/10">
        <h3 className="text-xl font-bold text-white">{title}</h3>

        <p className="mt-3 leading-7 text-slate-400">{description}</p>
      </div>
    </div>
  );
}

export default WorkflowCard;
