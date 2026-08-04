import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Container from "@/components/layout/Container";

function HeroSection() {
  return (
    <section className="bg-slate-950 text-white">
      <Container className="py-20 lg:py-32">
        <div className="grid items-center gap-16 lg:grid-cols-2">
          {/* Left Content */}
          <div>
            <span className="inline-block rounded-full border border-cyan-500/30 bg-cyan-500/10 px-4 py-2 text-sm font-medium text-cyan-400">
              AI-Powered Mental Wellness Platform
            </span>

            <h1 className="mt-6 text-5xl font-bold leading-tight lg:text-6xl">
              Your Mental Wellness
              <span className="block text-cyan-400">Companion</span>
            </h1>

            <p className="mt-6 max-w-xl text-lg leading-8 text-slate-300">
              SAHARA combines AI, clinical screening, guided journaling, therapy
              tools, and professional support to help you understand, manage,
              and improve your mental well-being.
            </p>

            <div className="mt-10 flex flex-wrap gap-4">
              <Link to="/register">
                <Button size="lg">Get Started</Button>
              </Link>

              <Button variant="outline" size="lg">
                Learn More
              </Button>
            </div>

            <div className="mt-10 flex flex-wrap gap-6 text-sm text-slate-400">
              <span>🔒 Secure</span>
              <span>🤖 AI Powered</span>
              <span>💙 Private</span>
            </div>
          </div>

          {/* Right Side */}
          <div className="flex justify-center">
            <div className="flex h-96 w-full max-w-md items-center justify-center rounded-3xl border border-slate-800 bg-slate-900">
              <p className="text-center text-slate-400">
                Hero Illustration
                <br />
                (Coming Soon)
              </p>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}

export default HeroSection;
