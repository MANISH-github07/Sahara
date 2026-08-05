import { Bell } from "lucide-react";

function DashboardHeader() {
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <header className="flex flex-col gap-6 rounded-3xl border border-slate-800 bg-slate-900 p-6 md:flex-row md:items-center md:justify-between">
      {/* Left Section */}
      <div>
        <p className="text-sm font-medium text-cyan-400">Welcome Back 👋</p>

        <h1 className="mt-2 text-3xl font-bold text-white">
          Good Morning, Manish
        </h1>

        <p className="mt-2 text-slate-400">{today}</p>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-4">
        {/* Notification */}
        <button className="rounded-xl border border-slate-700 bg-slate-800 p-3 text-slate-300 transition hover:border-cyan-500 hover:text-cyan-400">
          <Bell size={22} />
        </button>

        {/* User Profile */}
        <div className="flex items-center gap-3 rounded-2xl border border-slate-700 bg-slate-800 px-4 py-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-cyan-500 text-lg font-bold text-slate-950">
            M
          </div>

          <div>
            <h3 className="font-semibold text-white">Manish</h3>

            <p className="text-sm text-slate-400">Patient</p>
          </div>
        </div>
      </div>
    </header>
  );
}

export default DashboardHeader;
