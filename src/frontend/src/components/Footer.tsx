import { SiFacebook, SiInstagram, SiX } from "react-icons/si";
import type { AppView } from "../App";

interface FooterProps {
  navigate: (v: AppView) => void;
}

export function Footer({ navigate }: FooterProps) {
  const year = new Date().getFullYear();
  const hostname = encodeURIComponent(window.location.hostname);

  return (
    <footer className="bg-foreground text-white">
      <div className="max-w-6xl mx-auto px-4 md:px-8 py-10 grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Left */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <span className="inline-flex items-center justify-center w-8 h-8 rounded bg-brand-red text-white font-bold text-sm">
              E
            </span>
            <span className="font-bold text-lg">
              <span className="text-brand-red">EiE</span> Nigeria |
              <span className="text-brand-green ml-1">Revoda</span>
            </span>
          </div>
          <p className="text-sm text-white/70 max-w-xs">
            Empowering Nigerian voters with legal-grade evidence tools for the
            2027 elections.
          </p>
          <div className="flex gap-3 mt-4">
            <a
              href="https://twitter.com/EiENigeria"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
            >
              <SiX className="w-4 h-4" />
            </a>
            <a
              href="https://facebook.com/EiENigeria"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
            >
              <SiFacebook className="w-4 h-4" />
            </a>
            <a
              href="https://instagram.com/EiENigeria"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
            >
              <SiInstagram className="w-4 h-4" />
            </a>
          </div>
        </div>

        {/* Right */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <h4 className="text-xs font-semibold tracking-widest uppercase text-white/50 mb-3">
              Platform
            </h4>
            <ul className="space-y-2">
              {["Home", "landing"] as const}
              {[
                ["Home", "landing"],
                ["Report Incident", "report-wizard"],
                ["Track My Rep", "track-rep"],
                ["Admin", "admin-login"],
              ].map(([label, view]) => (
                <li key={view}>
                  <button
                    type="button"
                    data-ocid="nav.link"
                    onClick={() => navigate(view as AppView)}
                    className="text-sm text-white/70 hover:text-white transition-colors"
                  >
                    {label}
                  </button>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-xs font-semibold tracking-widest uppercase text-white/50 mb-3">
              Legal
            </h4>
            <ul className="space-y-2">
              {["Privacy Policy", "Terms of Use", "Evidence Act §84"].map(
                (item) => (
                  <li key={item}>
                    <span className="text-sm text-white/70">{item}</span>
                  </li>
                ),
              )}
            </ul>
          </div>
        </div>
      </div>

      {/* Ticker */}
      <div className="bg-ticker-bg overflow-hidden">
        <div className="py-2 flex items-center gap-4">
          <span className="shrink-0 bg-brand-red text-white text-xs font-bold px-3 py-1 ml-4">
            LATEST
          </span>
          <div className="overflow-hidden flex-1">
            <p className="ticker-scroll text-xs text-white/80 whitespace-nowrap">
              🗳️ Revoda is live for the 2027 Nigerian General Elections
              &nbsp;&nbsp;|&nbsp;&nbsp; 📋 All reports are legally admissible
              under Section 84 of the Nigerian Evidence Act
              &nbsp;&nbsp;|&nbsp;&nbsp; 🔒 Your evidence is stored securely
              on-platform &nbsp;&nbsp;|&nbsp;&nbsp; ✊ Your documentation is
              your defense
            </p>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="bg-ticker-bg border-t border-white/10 py-3 text-center">
        <p className="text-xs text-white/50">
          © {year}.{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${hostname}`}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-white transition-colors"
          >
            Built with ❤️ using caffeine.ai
          </a>
        </p>
      </div>
    </footer>
  );
}
