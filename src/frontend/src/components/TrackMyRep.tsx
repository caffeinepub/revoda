import { ArrowLeft, Calendar, Search, TrendingUp, Users } from "lucide-react";
import { motion } from "motion/react";
import type { AppView } from "../App";
import { Footer } from "./Footer";
import { Header } from "./Header";

interface TrackMyRepProps {
  navigate: (v: AppView) => void;
}

export function TrackMyRep({ navigate }: TrackMyRepProps) {
  return (
    <div className="min-h-screen">
      <Header navigate={navigate} currentView="track-rep" />

      <main>
        {/* Hero placeholder */}
        <section
          className="relative py-24 md:py-32 flex items-center"
          style={{
            background: "linear-gradient(135deg, #0B7A43 0%, #084d2b 100%)",
          }}
        >
          <div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage:
                "repeating-linear-gradient(45deg, transparent, transparent 20px, rgba(255,255,255,0.1) 20px, rgba(255,255,255,0.1) 21px)",
            }}
          />
          <div className="max-w-3xl mx-auto px-4 text-center relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="w-20 h-20 rounded-full bg-white/10 border-2 border-white/30 flex items-center justify-center mx-auto mb-6">
                <Search className="w-10 h-10 text-white" />
              </div>
              <h1 className="text-4xl md:text-5xl font-black text-white mb-4">
                Track My Rep
              </h1>
              <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 mb-6">
                <span className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />
                <span className="text-yellow-200 text-sm font-medium">
                  Coming Soon — Launching for 2027 Elections
                </span>
              </div>
              <p className="text-white/80 text-lg max-w-xl mx-auto mb-8">
                Monitor your representative's voting record and legislative
                attendance. Hold your elected officials accountable with
                real-time data.
              </p>
              <button
                type="button"
                data-ocid="track_rep.primary_button"
                onClick={() => navigate("landing")}
                className="inline-flex items-center gap-2 bg-white text-brand-green font-bold px-6 py-3 rounded-xl shadow-cta transition-all hover:scale-105"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Home
              </button>
            </motion.div>
          </div>
        </section>

        {/* Upcoming features */}
        <section className="bg-section-bg py-16">
          <div className="max-w-4xl mx-auto px-4">
            <h2 className="text-2xl font-black text-foreground text-center mb-10">
              What to Expect
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                {
                  icon: TrendingUp,
                  title: "Voting Record",
                  desc: "See how your representative voted on key bills — constituency development, education, healthcare, and security.",
                },
                {
                  icon: Calendar,
                  title: "Attendance Tracker",
                  desc: "Track legislative session attendance. Know if your representative is showing up to do the work you elected them for.",
                },
                {
                  icon: Users,
                  title: "Constituency Engagement",
                  desc: "Monitor town halls, constituency visits, and public engagements. Is your rep accessible to you?",
                },
              ].map((f) => (
                <motion.div
                  key={f.title}
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="bg-white rounded-2xl border border-border p-6 shadow-card"
                >
                  <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center mb-4">
                    <f.icon className="w-6 h-6 text-brand-green" />
                  </div>
                  <h3 className="font-bold text-foreground mb-2">{f.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {f.desc}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Notify CTA */}
        <section className="bg-white py-16">
          <div className="max-w-xl mx-auto px-4 text-center">
            <h2 className="text-2xl font-black text-foreground mb-3">
              Get Notified at Launch
            </h2>
            <p className="text-muted-foreground mb-6">
              We'll notify you when Track My Rep goes live ahead of the 2027
              elections.
            </p>
            <div className="flex gap-2">
              <input
                type="email"
                data-ocid="track_rep.input"
                placeholder="Enter your email address"
                className="flex-1 rounded-xl border border-border bg-section-bg px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
              <button
                type="button"
                data-ocid="track_rep.primary_button"
                onClick={() => alert("Thank you! We'll notify you at launch.")}
                className="bg-brand-green text-white font-bold px-5 py-3 rounded-xl shadow-cta transition-all hover:bg-brand-green-dark"
              >
                Notify Me
              </button>
            </div>
          </div>
        </section>
      </main>

      <Footer navigate={navigate} />
    </div>
  );
}
