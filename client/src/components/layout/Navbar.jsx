import { Link } from "react-router-dom";
import Container from "@/components/layout/Container";
import { Button } from "@/components/ui/button";

function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-slate-800 bg-slate-950/90 backdrop-blur">
      <Container>
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link
            to="/"
            className="text-2xl font-bold tracking-wide text-cyan-400"
          >
            SAHARA
          </Link>

          {/* Navigation */}
          <nav className="hidden items-center gap-8 md:flex">
            <Link
              to="/"
              className="text-slate-300 transition hover:text-cyan-400"
            >
              Home
            </Link>

            <a
              href="#features"
              className="text-slate-300 transition hover:text-cyan-400"
            >
              Features
            </a>

            <a
              href="#about"
              className="text-slate-300 transition hover:text-cyan-400"
            >
              About
            </a>

            <a
              href="#contact"
              className="text-slate-300 transition hover:text-cyan-400"
            >
              Contact
            </a>
          </nav>

          {/* Right Side */}
          <div className="flex items-center gap-3">
            <Link to="/login">
              <Button variant="ghost">Login</Button>
            </Link>

            <Link to="/register">
              <Button>Get Started</Button>
            </Link>
          </div>
        </div>
      </Container>
    </header>
  );
}

export default Navbar;
