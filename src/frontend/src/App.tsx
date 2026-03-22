import { Toaster } from "@/components/ui/sonner";
import { useState } from "react";
import { AdminDashboard } from "./components/AdminDashboard";
import { AdminLogin } from "./components/AdminLogin";
import { DisenfranchisementArchive } from "./components/DisenfranchisementArchive";
import { Landing } from "./components/Landing";
import { ReformLobby } from "./components/ReformLobby";
import { ReportWizard } from "./components/ReportWizard";

export type AppView =
  | "landing"
  | "report-wizard"
  | "admin-login"
  | "admin-dashboard"
  | "reform-lobby"
  | "disenfranchisement-archive";

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
      {view === "admin-login" && <AdminLogin navigate={navigate} />}
      {view === "admin-dashboard" && <AdminDashboard navigate={navigate} />}
      {view === "reform-lobby" && <ReformLobby navigate={navigate} />}
      {view === "disenfranchisement-archive" && (
        <DisenfranchisementArchive navigate={navigate} />
      )}
      <Toaster richColors position="top-right" />
    </div>
  );
}
