import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  Loader2,
  Plus,
  ThumbsUp,
  TrendingUp,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import type { AppView } from "../App";
import type { ReformItem } from "../backend.d";
import {
  useReformItems,
  useSignPetition,
  useSubmitReformItem,
} from "../hooks/useQueries";
import { Footer } from "./Footer";
import { Header } from "./Header";

const CATEGORIES = [
  "BVAS Reform",
  "Polling Unit Access",
  "Voter Registration",
  "Results Transparency",
  "Security",
  "Other",
];

function statusBadge(status: string) {
  if (status === "Active")
    return (
      <Badge className="bg-brand-green/10 text-brand-green border-brand-green/30">
        <span className="w-1.5 h-1.5 rounded-full bg-brand-green mr-1.5 animate-pulse inline-block" />
        Active
      </Badge>
    );
  if (status === "Passed")
    return (
      <Badge className="bg-blue-50 text-blue-700 border-blue-200">
        <CheckCircle2 className="w-3 h-3 mr-1" />
        Passed
      </Badge>
    );
  return (
    <Badge className="bg-amber-50 text-amber-700 border-amber-200">
      <Clock className="w-3 h-3 mr-1" />
      Pending
    </Badge>
  );
}

function ReformCard({ item }: { item: ReformItem }) {
  const sign = useSignPetition();
  const [signed, setSigned] = useState(false);

  const handleSign = async () => {
    if (signed) return;
    try {
      await sign.mutateAsync(item.id);
      setSigned(true);
      toast.success("Your signature has been recorded!");
    } catch {
      toast.error("Failed to sign petition. Please try again.");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl border border-border shadow-card p-5 flex flex-col gap-3"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex flex-wrap gap-2 items-center">
          <Badge variant="outline" className="text-xs font-semibold">
            {item.category}
          </Badge>
          {statusBadge(item.status)}
        </div>
        <span className="text-xs text-muted-foreground font-mono shrink-0">
          {item.id}
        </span>
      </div>

      <h3 className="font-bold text-foreground text-base leading-snug">
        {item.title}
      </h3>
      <p className="text-sm text-muted-foreground leading-relaxed">
        {item.summary}
      </p>

      {item.evidenceNote && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
          <p className="text-xs text-amber-800">
            <span className="font-semibold">Evidence note: </span>
            {item.evidenceNote}
          </p>
        </div>
      )}

      <div className="flex items-center justify-between mt-1">
        <span className="text-xs text-muted-foreground">
          Submitted by{" "}
          <span className="font-semibold text-foreground">
            {item.submittedBy}
          </span>
        </span>
        <button
          type="button"
          onClick={handleSign}
          disabled={signed || sign.isPending}
          className={`flex items-center gap-2 text-sm font-bold px-4 py-2 rounded-xl transition-all ${
            signed
              ? "bg-brand-green/10 text-brand-green cursor-default"
              : "bg-brand-red hover:bg-brand-red-dark text-white hover:scale-105 active:scale-95"
          }`}
        >
          {sign.isPending ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <ThumbsUp className="w-3.5 h-3.5" />
          )}
          {signed ? "Signed" : "Sign Petition"}
          <span
            className={`ml-0.5 font-mono ${
              signed ? "text-brand-green" : "text-white/80"
            }`}
          >
            ({Number(item.petitionCount) + (signed ? 1 : 0)})
          </span>
        </button>
      </div>
    </motion.div>
  );
}

export function ReformLobby({ navigate }: { navigate: (v: AppView) => void }) {
  const { data: items = [], isLoading } = useReformItems();
  const submitItem = useSubmitReformItem();

  const [form, setForm] = useState({
    title: "",
    summary: "",
    category: "",
    evidenceNote: "",
    submittedBy: "",
  });
  const [showForm, setShowForm] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.summary || !form.category || !form.submittedBy) {
      toast.error("Please fill in all required fields.");
      return;
    }
    try {
      await submitItem.mutateAsync(form);
      toast.success("Reform proposal submitted! It will appear here shortly.");
      setForm({
        title: "",
        summary: "",
        category: "",
        evidenceNote: "",
        submittedBy: "",
      });
      setShowForm(false);
    } catch {
      toast.error("Submission failed. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-section-bg">
      <Header navigate={navigate} currentView="reform-lobby" />

      {/* Page header */}
      <section
        className="py-12 px-4 md:px-8"
        style={{
          background:
            "linear-gradient(105deg, #1a0505 0%, #3d0a0a 60%, #1c3a2a 100%)",
        }}
      >
        <div className="max-w-4xl mx-auto">
          <span className="inline-flex items-center gap-1.5 bg-brand-red/20 border border-brand-red/40 text-red-200 text-xs font-semibold px-3 py-1 rounded-full mb-4">
            <TrendingUp className="w-3 h-3" />
            Evidence-Based Advocacy
          </span>
          <h1 className="text-3xl md:text-5xl font-black text-white leading-tight mb-3">
            Electoral <span className="text-brand-red">Reform</span> Lobby
          </h1>
          <p className="text-white/70 text-base max-w-xl">
            Election-day evidence turned into legislative action. Review active
            reform proposals and add your signature to petitions headed to INEC
            and the National Assembly.
          </p>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-4 md:px-8 py-10 space-y-6">
        {/* Stat strip */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Total Proposals", value: items.length },
            {
              label: "Active",
              value: items.filter((i) => i.status === "Active").length,
            },
            {
              label: "Passed",
              value: items.filter((i) => i.status === "Passed").length,
            },
          ].map((s) => (
            <div
              key={s.label}
              className="bg-white rounded-xl border border-border p-4 shadow-card text-center"
            >
              <div className="text-2xl font-black text-brand-red">
                {s.value}
              </div>
              <div className="text-xs text-muted-foreground mt-0.5">
                {s.label}
              </div>
            </div>
          ))}
        </div>

        {/* Reform items */}
        {isLoading && (
          <div className="flex justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-brand-red" />
          </div>
        )}

        {!isLoading && items.length === 0 && (
          <div className="text-center py-16 bg-white rounded-2xl border border-border">
            <AlertCircle className="w-10 h-10 mx-auto mb-3 text-muted-foreground/40" />
            <p className="font-semibold text-foreground">
              No reform proposals yet
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Be the first to submit a proposal below.
            </p>
          </div>
        )}

        <div className="space-y-4">
          {items.map((item) => (
            <ReformCard key={item.id} item={item} />
          ))}
        </div>

        {/* Submit new proposal */}
        <div className="bg-white rounded-2xl border border-border shadow-card overflow-hidden">
          <button
            type="button"
            onClick={() => setShowForm((v) => !v)}
            className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-section-bg transition-colors"
          >
            <div className="flex items-center gap-2">
              <Plus className="w-5 h-5 text-brand-red" />
              <span className="font-bold text-foreground">
                Submit a Reform Proposal
              </span>
            </div>
            <span className="text-xs text-muted-foreground">
              Open to legal teams &amp; partners
            </span>
          </button>

          {showForm && (
            <form
              onSubmit={handleSubmit}
              className="px-6 pb-6 space-y-4 border-t border-border pt-4"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="r-title">
                    Title <span className="text-brand-red">*</span>
                  </Label>
                  <Input
                    id="r-title"
                    placeholder="e.g. Mandate BVAS Backup Protocol"
                    value={form.title}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, title: e.target.value }))
                    }
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="r-category">
                    Category <span className="text-brand-red">*</span>
                  </Label>
                  <Select
                    value={form.category}
                    onValueChange={(v) =>
                      setForm((f) => ({ ...f, category: v }))
                    }
                  >
                    <SelectTrigger id="r-category">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map((c) => (
                        <SelectItem key={c} value={c}>
                          {c}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="r-summary">
                  Summary <span className="text-brand-red">*</span>
                </Label>
                <Textarea
                  id="r-summary"
                  rows={3}
                  placeholder="Describe the reform needed and why..."
                  value={form.summary}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, summary: e.target.value }))
                  }
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="r-evidence">Evidence Note</Label>
                <Input
                  id="r-evidence"
                  placeholder="Link to incident data, report IDs, or supporting evidence"
                  value={form.evidenceNote}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, evidenceNote: e.target.value }))
                  }
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="r-by">
                  Your Name / Organisation{" "}
                  <span className="text-brand-red">*</span>
                </Label>
                <Input
                  id="r-by"
                  placeholder="e.g. EiE Nigeria Legal Team"
                  value={form.submittedBy}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, submittedBy: e.target.value }))
                  }
                />
              </div>

              <button
                type="submit"
                disabled={submitItem.isPending}
                className="flex items-center gap-2 bg-brand-red hover:bg-brand-red-dark text-white font-bold px-6 py-3 rounded-xl transition-all hover:scale-105 active:scale-95 disabled:opacity-60"
              >
                {submitItem.isPending && (
                  <Loader2 className="w-4 h-4 animate-spin" />
                )}
                Submit Proposal
              </button>
            </form>
          )}
        </div>
      </div>

      <Footer navigate={navigate} />
    </div>
  );
}
