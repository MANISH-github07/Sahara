import { ClipboardCheck, Bot, ArrowRight, ShieldCheck } from "lucide-react";

import PrimaryButton from "@/components/ui/PrimaryButton";
import FeatureCard from "@/components/ui/FeatureCard";
function HeroIllustration() {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-slate-800 bg-slate-900 p-8 shadow-2xl shadow-cyan-500/5">
      {/* Background Glow */}
      <div className="absolute -top-20 -right-20 h-48 w-48 rounded-full bg-cyan-500/10 blur-3xl"></div>

      <div className="relative">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <p className="text-lg text-slate-400">Welcome to</p>

            <h2 className="mt-2 text-4xl font-bold text-white">SAHARA</h2>

            <p className="mt-4 max-w-sm leading-7 text-slate-400">
              Begin your mental wellness journey with clinically validated
              screening, responsible AI, guided journaling, and professional
              support.
            </p>
          </div>

          <div className="rounded-full border border-cyan-500/20 bg-cyan-500/10 px-5 py-2 text-sm font-semibold text-cyan-400">
            New User
          </div>
        </div>

        {/* Progress */}
        <div className="mt-10">
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Journey Progress</span>

            <span className="font-semibold text-cyan-400">0%</span>
          </div>

          <div className="mt-3 h-3 overflow-hidden rounded-full bg-slate-800">
            <div className="h-full w-0 rounded-full bg-cyan-400"></div>
          </div>

          <p className="mt-3 text-sm text-slate-500">
            Complete your first assessment to unlock personalized wellness
            insights.
          </p>
        </div>

        {/* Main Card */}
        <div className="mt-10 rounded-3xl border border-slate-700 bg-slate-800/70 p-6 backdrop-blur">
          <div className="flex items-center gap-4">
            <div className="rounded-2xl bg-cyan-500/10 p-3 text-cyan-400">
              <ClipboardCheck size={30} />
            </div>

            <div>
              <h3 className="text-xl font-semibold text-white">
                Start Your First Assessment
              </h3>

              <p className="mt-2 text-slate-400">
                Complete PHQ-9 and GAD-7 assessments to receive AI-guided
                wellness insights tailored to you.
              </p>
            </div>
          </div>

          <PrimaryButton className="mt-8 w-full">
            <span className="flex items-center gap-2">
              Start Assessment
              <ArrowRight size={18} />
            </span>
          </PrimaryButton>
        </div>

        {/* Feature Cards */}
        <div className="mt-8 grid grid-cols-2 gap-5">
          {/* Screening */}
          <FeatureCard
            icon={ClipboardCheck}
            title="Clinical Screening"
            description="PHQ-9 & GAD-7"
          />
          {/* AI */}
          <div className="rounded-2xl border border-slate-800 bg-slate-800/60 p-5 transition duration-300 hover:border-cyan-500/40">
            <Bot className="mb-4 text-cyan-400" size={28} />

            <p className="text-lg font-semibold text-white">Responsible AI</p>

            <p className="mt-2 text-sm text-slate-400">Guidance & Reflection</p>
          </div>
          {/* Privacy */}
          <div className="rounded-2xl border border-slate-800 bg-slate-800/60 p-5 transition duration-300 hover:border-cyan-500/40">
            <ShieldCheck className="mb-4 text-cyan-400" size={28} />

            <p className="text-lg font-semibold text-white">Privacy First</p>

            <p className="mt-2 text-sm text-slate-400">
              Secure & Consent-Based
            </p>
          </div>
          {/* Professional Care */}
          <div className="rounded-2xl border border-slate-800 bg-slate-800/60 p-5 transition duration-300 hover:border-cyan-500/40">
            <div className="mb-4 flex h-7 w-7 items-center justify-center rounded-full bg-cyan-500/10 text-cyan-400">
              +
            </div>

            <p className="text-lg font-semibold text-white">
              Professional Care
            </p>

            <p className="mt-2 text-sm text-slate-400">Connect When Needed</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HeroIllustration;
