import { ShieldCheck, BrainCircuit, Lock } from "lucide-react";

function AuthLayout({ children }) {
  return (
    <div className="min-h-screen bg-slate-950 lg:grid lg:grid-cols-2">
      {/* Left Side */}
      <div className="hidden lg:flex flex-col justify-center bg-gradient-to-br from-slate-900 to-slate-950 px-16">
        <h1 className="text-5xl font-bold text-cyan-400">SAHARA</h1>

        <p className="mt-6 text-lg leading-8 text-slate-300">
          AI Powered Mental Wellness Platform designed with privacy, responsible
          AI, and professional care.
        </p>

        <div className="mt-12 space-y-6">
          <div className="flex items-center gap-4">
            <ShieldCheck className="text-cyan-400" />
            <span className="text-slate-300">Privacy First Platform</span>
          </div>

          <div className="flex items-center gap-4">
            <BrainCircuit className="text-cyan-400" />
            <span className="text-slate-300">Responsible AI Assistance</span>
          </div>

          <div className="flex items-center gap-4">
            <Lock className="text-cyan-400" />
            <span className="text-slate-300">Secure Authentication</span>
          </div>
        </div>
      </div>

      {/* Right Side */}
      <div className="flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">{children}</div>
      </div>
    </div>
  );
}

export default AuthLayout;
