import { WELCOME_DATA } from "@/constants/welcome";

function WelcomeCard() {
  return (
    <section className="rounded-3xl border border-slate-800 bg-slate-900 p-8">
      <div className="flex flex-col gap-8">
        {/* Header */}
        <div>
          <p className="font-semibold text-cyan-400">
            🌿 Your Wellness Journey
          </p>

          <h2 className="mt-3 text-3xl font-bold text-white">
            {WELCOME_DATA.greeting}
          </h2>

          <p className="mt-4 max-w-2xl leading-7 text-slate-400">
            {WELCOME_DATA.description}
          </p>
        </div>

        {/* Progress Section */}
        <div>
          <div className="mb-3 flex items-center justify-between">
            <span className="font-medium text-white">Wellness Progress</span>

            <span className="font-semibold text-cyan-400">
              {WELCOME_DATA.progress}%
            </span>
          </div>

          <div className="h-3 overflow-hidden rounded-full bg-slate-800">
            <div
              className="h-full rounded-full bg-cyan-400 transition-all duration-500"
              style={{
                width: `${WELCOME_DATA.progress}%`,
              }}
            />
          </div>
        </div>

        {/* Today's Focus */}
        <div className="rounded-2xl border border-slate-700 bg-slate-800/60 p-5">
          <h3 className="font-semibold text-white">🎯 Today's Focus</h3>

          <p className="mt-3 leading-7 text-slate-400">
            {WELCOME_DATA.todayFocus}
          </p>
        </div>
      </div>
    </section>
  );
}

export default WelcomeCard;
