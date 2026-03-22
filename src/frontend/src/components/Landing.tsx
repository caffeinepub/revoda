import {
  AlertTriangle,
  BookOpen,
  Camera,
  CheckCircle,
  FileText,
  MapPin,
  Search,
  Shield,
} from "lucide-react";
import { motion } from "motion/react";
import type { AppView } from "../App";
import { Footer } from "./Footer";
import { Header } from "./Header";

interface LandingProps {
  navigate: (v: AppView) => void;
}

const features = [
  {
    icon: FileText,
    title: "Incident Reporting",
    desc: "File detailed incident reports with auto-captured GPS, timestamps, and evidence metadata that meet legal evidentiary standards.",
    color: "text-brand-red",
    bg: "bg-red-50",
  },
  {
    icon: Camera,
    title: "Evidence Collection",
    desc: "Upload photos and videos directly from your device. All media is stored securely on-platform with tamper-evident metadata.",
    color: "text-brand-green",
    bg: "bg-green-50",
  },
  {
    icon: Shield,
    title: "Legal Ready Reports",
    desc: "Instantly generate a 'Voter's Statement of Fact' PDF with your digital signature, compliant with Section 84 of the Nigerian Evidence Act.",
    color: "text-brand-red",
    bg: "bg-red-50",
  },
  {
    icon: Search,
    title: "Track Your Rep",
    desc: "Monitor your representative's voting record, legislative attendance, and public commitments. Launching ahead of the 2027 elections.",
    color: "text-brand-green",
    bg: "bg-green-50",
  },
];

const steps = [
  {
    n: 1,
    label: "Select Category",
    desc: "Choose the type of electoral violation you witnessed.",
  },
  {
    n: 2,
    label: "Capture Evidence",
    desc: "Upload photos or video. GPS and timestamp are auto-logged.",
  },
  {
    n: 3,
    label: "Your Statement",
    desc: "Describe what happened in your own words and swear the oath.",
  },
  {
    n: 4,
    label: "Sign",
    desc: "Add your digital signature using your finger or mouse.",
  },
  {
    n: 5,
    label: "Submit & PDF",
    desc: "Submit the report and download your legal Statement of Fact.",
  },
];

export function Landing({ navigate }: LandingProps) {
  return (
    <div className="min-h-screen">
      <Header navigate={navigate} currentView="landing" />

      {/* Hero */}
      <section
        className="relative min-h-[520px] md:min-h-[620px] flex items-center overflow-hidden"
        style={{
          background:
            "linear-gradient(105deg, #1a0505 0%, #3d0a0a 40%, #1c3a2a 100%)",
        }}
      >
        {/* Hero image */}
        <img
          src="/assets/generated/hero-voters-queue.dim_1400x700.jpg"
          alt="Nigerian voters at a polling unit"
          className="absolute inset-0 w-full h-full object-cover opacity-35 mix-blend-luminosity"
          loading="eager"
        />
        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent" />

        <div className="relative z-10 max-w-6xl mx-auto px-4 md:px-8 py-16 md:py-24">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="max-w-2xl"
          >
            {/* Badge */}
            <span className="inline-flex items-center gap-1.5 bg-brand-red/20 border border-brand-red/40 text-red-200 text-xs font-semibold px-3 py-1 rounded-full mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
              2027 Nigerian Election Monitoring
            </span>

            <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-white leading-[1.05] mb-6 tracking-tight">
              Empowering
              <br />
              <span className="text-brand-red">Nigerian</span> Voters:
              <br />
              <span className="text-brand-green">Monitor, Report,</span>
              <br />
              Engage.
            </h1>

            <p className="text-white/80 text-lg mb-8 max-w-xl">
              Transform your witness account into legally admissible evidence.
              Your documentation is your defense.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <button
                type="button"
                data-ocid="landing.primary_button"
                onClick={() => navigate("report-wizard")}
                className="flex items-center justify-center gap-3 bg-brand-red hover:bg-brand-red-dark text-white font-bold text-base px-8 py-4 rounded-xl shadow-cta transition-all duration-200 hover:scale-105 active:scale-95"
              >
                <AlertTriangle className="w-5 h-5" />
                REPORT AN INCIDENT
              </button>
              <button
                type="button"
                data-ocid="landing.secondary_button"
                onClick={() => navigate("track-rep")}
                className="flex items-center justify-center gap-3 bg-brand-green hover:bg-brand-green-dark text-white font-bold text-base px-8 py-4 rounded-xl shadow-cta transition-all duration-200 hover:scale-105 active:scale-95"
              >
                <Search className="w-5 h-5" />
                TRACK MY REP
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="bg-white py-16 md:py-24" id="features">
        <div className="max-w-6xl mx-auto px-4 md:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <span className="text-xs font-bold tracking-[0.2em] text-brand-red uppercase">
              Platform Features
            </span>
            <h2 className="text-3xl md:text-4xl font-black text-foreground mt-2 tracking-tight uppercase">
              Election Transparency Tools
            </h2>
            <p className="text-muted-foreground mt-3 max-w-xl mx-auto">
              Everything you need to document, report, and defend electoral
              integrity.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                className="flex gap-4 p-6 rounded-2xl border border-border bg-white shadow-card hover:shadow-md transition-shadow"
              >
                <div
                  className={`shrink-0 w-12 h-12 rounded-xl ${f.bg} flex items-center justify-center`}
                >
                  <f.icon className={`w-6 h-6 ${f.color}`} />
                </div>
                <div>
                  <h3 className="font-bold text-foreground mb-1">{f.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {f.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-section-bg py-16 md:py-24">
        <div className="max-w-6xl mx-auto px-4 md:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <span className="text-xs font-bold tracking-[0.2em] text-brand-green uppercase">
              Process
            </span>
            <h2 className="text-3xl md:text-4xl font-black text-foreground mt-2">
              how it works
            </h2>
          </motion.div>

          <div className="bg-white rounded-2xl border border-border p-8 shadow-card">
            {/* Step indicators */}
            <div className="flex items-center gap-0 mb-10 overflow-x-auto pb-2">
              {steps.map((s, i) => (
                <div key={s.n} className="flex items-center">
                  <div className="flex flex-col items-center min-w-[80px]">
                    <div
                      className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm ${
                        i === 0
                          ? "bg-brand-red text-white"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {s.n}
                    </div>
                    <span className="text-[10px] font-semibold text-center mt-1 leading-tight max-w-[70px] text-foreground">
                      {s.label}
                    </span>
                  </div>
                  {i < steps.length - 1 && (
                    <div className="flex-1 h-0.5 bg-border min-w-[20px] mx-1" />
                  )}
                </div>
              ))}
            </div>

            {/* Step cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              {steps.map((s, i) => (
                <div
                  key={s.n}
                  className={`p-4 rounded-xl border ${
                    i === 0
                      ? "border-brand-red bg-red-50"
                      : "border-border bg-section-bg"
                  }`}
                >
                  <div
                    className={`text-sm font-bold mb-1 ${i === 0 ? "text-brand-red" : "text-foreground"}`}
                  >
                    Step {s.n}: {s.label}
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {s.desc}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-8 flex justify-center">
              <button
                type="button"
                data-ocid="how_it_works.primary_button"
                onClick={() => navigate("report-wizard")}
                className="flex items-center gap-2 bg-brand-red hover:bg-brand-red-dark text-white font-bold px-8 py-3 rounded-xl shadow-cta transition-all hover:scale-105"
              >
                <AlertTriangle className="w-4 h-4" />
                Start Filing a Report
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Admin Dashboard Preview */}
      <section className="bg-white py-16 md:py-24">
        <div className="max-w-6xl mx-auto px-4 md:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <span className="text-xs font-bold tracking-[0.2em] text-brand-red uppercase">
                Admin Tools
              </span>
              <h2 className="text-3xl font-black text-foreground mt-2 mb-4">
                Real-Time Incident Dashboard
              </h2>
              <p className="text-muted-foreground mb-6 leading-relaxed">
                Legal observers and EiE Nigeria staff can monitor incoming
                reports in real-time, filter for legally-ready evidence, and
                view geographic hotspot clusters across all 36 states.
              </p>
              <ul className="space-y-3">
                {[
                  { icon: MapPin, text: "Geographic hotspot map of incidents" },
                  {
                    icon: CheckCircle,
                    text: "Legal Ready filter — GPS + timestamp verified",
                  },
                  {
                    icon: BookOpen,
                    text: "Full report audit trail for legal proceedings",
                  },
                ].map((item) => (
                  <li
                    key={item.text}
                    className="flex items-center gap-3 text-sm"
                  >
                    <item.icon className="w-5 h-5 text-brand-green shrink-0" />
                    <span>{item.text}</span>
                  </li>
                ))}
              </ul>
              <button
                type="button"
                data-ocid="admin_preview.primary_button"
                onClick={() => navigate("admin-login")}
                className="mt-8 flex items-center gap-2 bg-foreground hover:bg-foreground/90 text-white font-bold px-6 py-3 rounded-xl transition-all hover:scale-105"
              >
                <Shield className="w-4 h-4" />
                Access Admin Dashboard
              </button>
            </motion.div>

            {/* Dashboard preview card */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.15 }}
              className="rounded-2xl border border-border shadow-md overflow-hidden"
            >
              {/* Mock dashboard header */}
              <div className="bg-foreground px-4 py-3 flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <div className="w-3 h-3 rounded-full bg-yellow-400" />
                <div className="w-3 h-3 rounded-full bg-green-500" />
                <span className="ml-2 text-white/60 text-xs">
                  Revoda Admin Dashboard
                </span>
              </div>
              {/* Mock map */}
              <div className="bg-green-900/10 relative h-40 flex items-center justify-center overflow-hidden">
                <NigeriaMapSVG />
              </div>
              {/* Mock table */}
              <div className="p-3 bg-white">
                <div className="text-xs font-bold text-muted-foreground mb-2">
                  RECENT REPORTS
                </div>
                {[
                  {
                    id: "RVD-001",
                    cat: "BVAS Failure",
                    state: "Lagos",
                    legal: true,
                  },
                  {
                    id: "RVD-002",
                    cat: "Voter Intimidation",
                    state: "Kano",
                    legal: true,
                  },
                  {
                    id: "RVD-003",
                    cat: "PU Not Open",
                    state: "Abuja",
                    legal: false,
                  },
                ].map((r) => (
                  <div
                    key={r.id}
                    className="flex items-center gap-2 py-1 border-b border-border last:border-0 text-xs"
                  >
                    <span className="font-mono text-brand-red">{r.id}</span>
                    <span className="flex-1 text-foreground">{r.cat}</span>
                    <span className="text-muted-foreground">{r.state}</span>
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${r.legal ? "bg-green-100 text-brand-green" : "bg-red-100 text-brand-red"}`}
                    >
                      {r.legal ? "✓ Legal" : "Missing GPS"}
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <Footer navigate={navigate} />
    </div>
  );
}

function NigeriaMapSVG() {
  const zones = [
    { x: 120, y: 30, r: 6, count: 12, label: "North West" },
    { x: 200, y: 28, r: 4, count: 7, label: "North East" },
    { x: 155, y: 60, r: 5, count: 9, label: "North Central" },
    { x: 110, y: 100, r: 7, count: 18, label: "South West" },
    { x: 175, y: 110, r: 5, count: 8, label: "South South" },
    { x: 210, y: 95, r: 4, count: 5, label: "South East" },
  ];
  return (
    <svg
      viewBox="0 0 320 150"
      className="w-full h-full"
      xmlns="http://www.w3.org/2000/svg"
    >
      <title>Nigeria election hotspot preview map</title>
      <rect x="0" y="0" width="320" height="150" fill="#e8f5e9" />
      {/* Simplified Nigeria outline */}
      <path
        d="M90,20 L240,15 L260,40 L250,80 L230,120 L200,135 L150,130 L110,120 L80,100 L70,70 L75,45 Z"
        fill="#c8e6c9"
        stroke="#4caf50"
        strokeWidth="1.5"
        opacity="0.7"
      />
      {zones.map((z) => (
        <g key={z.label}>
          <circle cx={z.x} cy={z.y} r={z.r + 4} fill="#c62828" opacity="0.15" />
          <circle cx={z.x} cy={z.y} r={z.r} fill="#c62828" opacity="0.8" />
          <text
            x={z.x}
            y={z.y + 1}
            textAnchor="middle"
            dominantBaseline="middle"
            fill="white"
            fontSize="7"
            fontWeight="bold"
          >
            {z.count}
          </text>
        </g>
      ))}
    </svg>
  );
}
