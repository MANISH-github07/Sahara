import { ArrowRight, ShieldCheck, Brain, HeartPulse } from "lucide-react";
import { Button } from "@/components/ui/button";

function HeroContent() {
  return (
    <div className="space-y-8">
      {/* Badge */}
      <div className="inline-flex items-center rounded-full border border-cyan-500/20 bg-cyan-500/10 px-4 py-2 text-sm font-medium text-cyan-400">
        AI Powered Mental Wellness Platform
      </div>

      {/* Heading */}
      <div className="space-y-4">
        <h1 className="text-5xl font-extrabold leading-tight text-white lg:text-6xl">
          Your Mental Wellness
          <span className="block text-cyan-400">Companion</span>
        </h1>

        <p className="max-w-xl text-lg leading-8 text-slate-400">
          SAHARA combines AI, clinically validated screening, guided journaling,
          and professional care into one secure platform that supports your
          mental well-being.
        </p>
      </div>

      {/* CTA */}
      <div className="flex flex-wrap gap-4">
        <Button size="lg">
          Get Started
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>

        <Button variant="outline" size="lg">
          Learn More
        </Button>
      </div>

      {/* Trust Items */}
      <div className="flex flex-wrap gap-6 pt-4 text-sm text-slate-400">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-cyan-400" />
          Privacy First
        </div>

        <div className="flex items-center gap-2">
          <Brain className="h-4 w-4 text-cyan-400" />
          AI Assisted
        </div>

        <div className="flex items-center gap-2">
          <HeartPulse className="h-4 w-4 text-cyan-400" />
          Clinical Screening
        </div>
      </div>
    </div>
  );
}

export default HeroContent;
