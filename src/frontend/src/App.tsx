import { Toaster } from "@/components/ui/sonner";
import { useState } from "react";
import { AdminDashboard } from "./components/AdminDashboard";
import { AdminLogin } from "./components/AdminLogin";
import { Landing } from "./components/Landing";
import { ReportWizard } from "./components/ReportWizard";
import { TrackMyRep } from "./components/TrackMyRep";

export type AppView =
  | "landing"
  | "report-wizard"
  | "track-rep"
  | "admin-login"
  | "admin-dashboard";

export default function App() {
  const [view, setView] = useState<AppView>("landing");

  const navigate = (v: AppView) => {
    setView(v);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-background font-inter">
      {view === "landing" && <Landing navigate={navigate} />}
      {view === "report-wizard" && <ReportWizard navigate={navigate} />}
      {view === "track-rep" && <TrackMyRep navigate={navigate} />}
      {view === "admin-login" && <AdminLogin navigate={navigate} />}
      {view === "admin-dashboard" && <AdminDashboard navigate={navigate} />}
      <Toaster richColors position="top-right" />
    </div>
  );
}
