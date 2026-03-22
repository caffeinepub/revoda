import { Shield, User } from "lucide-react";
import type { AppView } from "../App";

interface HeaderProps {
  navigate: (v: AppView) => void;
  currentView: AppView;
}

export function Header({ navigate, currentView }: HeaderProps) {
  const links: { label: string; view: AppView }[] = [
    { label: "Home", view: "landing" },
    { label: "Reports", view: "report-wizard" },
    { label: "Track Reps", view: "track-rep" },
    { label: "Admin", view: "admin-login" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full bg-white border-b border-border shadow-xs">
      <div className="max-w-6xl mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
        {/* Logo */}
        <button
          type="button"
          data-ocid="nav.link"
          onClick={() => navigate("landing")}
          className="flex items-center gap-2 focus:outline-none"
        >
          <span className="inline-flex items-center justify-center w-8 h-8 rounded bg-brand-red text-white font-bold text-sm">
            R
          </span>
          <span className="font-black text-xl text-foreground tracking-tight">
            <span className="text-brand-red">Revoda</span>
          </span>
        </button>

        {/* Nav links – desktop */}
        <nav className="hidden md:flex items-center gap-6">
          {links.map((l) => (
            <button
              type="button"
              key={l.view}
              data-ocid="nav.link"
              onClick={() => navigate(l.view)}
              className={`text-sm font-medium pb-1 transition-colors relative ${
                currentView === l.view
                  ? "text-brand-red"
                  : "text-foreground hover:text-brand-red"
              }`}
            >
              {l.label}
              {currentView === l.view && (
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-brand-red rounded-full" />
              )}
            </button>
          ))}
        </nav>

        {/* User icon */}
        <button
          type="button"
          data-ocid="nav.link"
          onClick={() => navigate("admin-login")}
          className="p-2 rounded-full hover:bg-muted transition-colors"
          aria-label="Admin login"
        >
          {currentView === "admin-dashboard" ? (
            <Shield className="w-5 h-5 text-brand-red" />
          ) : (
            <User className="w-5 h-5 text-muted-foreground" />
          )}
        </button>
      </div>

      {/* Mobile nav */}
      <div className="md:hidden flex gap-1 px-4 pb-2 overflow-x-auto">
        {links.map((l) => (
          <button
            type="button"
            key={l.view}
            data-ocid="nav.link"
            onClick={() => navigate(l.view)}
            className={`text-xs font-medium px-3 py-1 rounded-full whitespace-nowrap transition-colors ${
              currentView === l.view
                ? "bg-brand-red text-white"
                : "bg-muted text-foreground"
            }`}
          >
            {l.label}
          </button>
        ))}
      </div>
    </header>
  );
}
