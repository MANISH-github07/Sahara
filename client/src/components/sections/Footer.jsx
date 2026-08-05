import Container from "@/components/layout/Container";
import { QUICK_LINKS, MODULE_LINKS, RESOURCE_LINKS } from "@/constants/footer";

import { Globe, Mail, Heart } from "lucide-react";

function Footer() {
  return (
    <footer className="border-t border-slate-800 bg-slate-950">
      <Container>
        <div className="grid gap-12 py-16 md:grid-cols-2 lg:grid-cols-5">
          {/* Brand */}
          <div className="lg:col-span-2">
            <h2 className="text-3xl font-bold text-cyan-400">SAHARA</h2>

            <p className="mt-4 max-w-md leading-7 text-slate-400">
              AI Powered Mental Wellness Platform focused on privacy,
              responsible AI, and accessible professional care.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="mb-5 font-semibold text-white">Quick Links</h3>

            <ul className="space-y-3">
              {QUICK_LINKS.map((item) => (
                <li key={item}>
                  <a
                    href="#"
                    className="text-slate-400 transition hover:text-cyan-400"
                  >
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Modules */}
          <div>
            <h3 className="mb-5 font-semibold text-white">Modules</h3>

            <ul className="space-y-3">
              {MODULE_LINKS.map((item) => (
                <li key={item}>
                  <a
                    href="#"
                    className="text-slate-400 transition hover:text-cyan-400"
                  >
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="mb-5 font-semibold text-white">Resources</h3>

            <ul className="space-y-3">
              {RESOURCE_LINKS.map((item) => (
                <li key={item}>
                  <a
                    href="#"
                    className="text-slate-400 transition hover:text-cyan-400"
                  >
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="flex flex-col items-center justify-between gap-5 border-t border-slate-800 py-8 md:flex-row">
          <p className="text-sm text-slate-500">
            © 2026 SAHARA. All rights reserved.
          </p>

          <div className="flex items-center gap-5">
            <a href="#" className="text-slate-400 hover:text-cyan-400">
              <Globe />
            </a>

            <a href="#" className="text-slate-400 hover:text-cyan-400">
              <Mail />
            </a>
          </div>

          <p className="flex items-center gap-2 text-sm text-slate-500">
            Made with <Heart size={16} className="text-red-500" /> for Mental
            Wellness
          </p>
        </div>
      </Container>
    </footer>
  );
}

export default Footer;
