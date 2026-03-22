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
import { AlertCircle, BookOpen, Loader2, Plus, Search } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import type { AppView } from "../App";
import type { ArchiveEntry } from "../backend.d";
import {
  useArchiveEntries,
  usePublicStats,
  useSubmitArchiveEntry,
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

const CATEGORY_COLORS: Record<string, string> = {
  "BVAS Reform": "bg-red-50 text-red-700 border-red-200",
  "Polling Unit Access": "bg-amber-50 text-amber-700 border-amber-200",
  "Voter Registration": "bg-blue-50 text-blue-700 border-blue-200",
  "Results Transparency": "bg-purple-50 text-purple-700 border-purple-200",
  Security: "bg-orange-50 text-orange-700 border-orange-200",
  Other: "bg-muted text-muted-foreground border-border",
};

function ArchiveRow({ entry }: { entry: ArchiveEntry }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl border border-border p-4 flex flex-col gap-2"
    >
      <div className="flex items-start justify-between gap-2 flex-wrap">
        <h3 className="font-semibold text-foreground text-sm leading-snug flex-1">
          {entry.caseTitle}
        </h3>
        <Badge
          className={`text-xs shrink-0 ${
            CATEGORY_COLORS[entry.category] || CATEGORY_COLORS.Other
          }`}
        >
          {entry.category}
        </Badge>
      </div>
      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
        <span>
          📍 {entry.state}
          {entry.lga ? `, ${entry.lga}` : ""}
        </span>
        {entry.incidentDate && <span>📅 {entry.incidentDate}</span>}
        {entry.source && (
          <span>
            🔗{" "}
            <a
              href={entry.source.startsWith("http") ? entry.source : "#"}
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-foreground transition-colors"
            >
              {entry.source.length > 40
                ? `${entry.source.slice(0, 40)}…`
                : entry.source}
            </a>
          </span>
        )}
      </div>
      {entry.description && (
        <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">
          {entry.description}
        </p>
      )}
      <div className="text-xs text-muted-foreground">
        Submitted by{" "}
        <span className="font-medium text-foreground">{entry.submittedBy}</span>
      </div>
    </motion.div>
  );
}

export function DisenfranchisementArchive({
  navigate,
}: {
  navigate: (v: AppView) => void;
}) {
  const { data: entries = [], isLoading } = useArchiveEntries();
  const { data: stats } = usePublicStats();
  const submitEntry = useSubmitArchiveEntry();

  const [search, setSearch] = useState("");
  const [filterState, setFilterState] = useState("all");
  const [filterCat, setFilterCat] = useState("all");
  const [showForm, setShowForm] = useState(false);

  const [form, setForm] = useState({
    caseTitle: "",
    state: "",
    lga: "",
    category: "",
    description: "",
    source: "",
    incidentDate: "",
    submittedBy: "",
  });

  const allStates = [...new Set(entries.map((e) => e.state).filter(Boolean))];

  const filtered = entries.filter((e) => {
    const matchSearch =
      !search ||
      e.caseTitle.toLowerCase().includes(search.toLowerCase()) ||
      e.description.toLowerCase().includes(search.toLowerCase()) ||
      e.state.toLowerCase().includes(search.toLowerCase());
    const matchState = filterState === "all" || e.state === filterState;
    const matchCat = filterCat === "all" || e.category === filterCat;
    return matchSearch && matchState && matchCat;
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !form.caseTitle ||
      !form.state ||
      !form.category ||
      !form.description ||
      !form.submittedBy
    ) {
      toast.error("Please fill in all required fields.");
      return;
    }
    try {
      await submitEntry.mutateAsync(form);
      toast.success("Case submitted to the archive successfully.");
      setForm({
        caseTitle: "",
        state: "",
        lga: "",
        category: "",
        description: "",
        source: "",
        incidentDate: "",
        submittedBy: "",
      });
      setShowForm(false);
    } catch {
      toast.error("Submission failed. Please try again.");
    }
  };

  const totalReports = Number(stats?.totalReports ?? 0);
  const byCategory: [string, number][] = (stats?.byCategory ?? []).map(
    ([cat, n]) => [cat, Number(n)],
  );
  const maxCat = Math.max(1, ...byCategory.map(([, n]) => n));

  return (
    <div className="min-h-screen bg-section-bg">
      <Header navigate={navigate} currentView="disenfranchisement-archive" />

      {/* Page header */}
      <section
        className="py-12 px-4 md:px-8"
        style={{
          background:
            "linear-gradient(105deg, #0a1a2a 0%, #0d2a1e 50%, #1a0505 100%)",
        }}
      >
        <div className="max-w-5xl mx-auto">
          <span className="inline-flex items-center gap-1.5 bg-brand-green/20 border border-brand-green/40 text-green-200 text-xs font-semibold px-3 py-1 rounded-full mb-4">
            <BookOpen className="w-3 h-3" />
            Public Record
          </span>
          <h1 className="text-3xl md:text-5xl font-black text-white leading-tight mb-3">
            Disenfranchisement <span className="text-brand-green">Archive</span>
          </h1>
          <p className="text-white/70 text-base max-w-xl">
            A permanent, anonymised record of voter suppression and
            disenfranchisement across Nigeria. Used by researchers, media, and
            international observers to study electoral integrity patterns.
          </p>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-4 md:px-8 py-10 space-y-6">
        {/* Stats */}
        <div className="bg-white rounded-2xl border border-border shadow-card p-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="text-4xl font-black text-brand-red">
              {totalReports + entries.length}
            </div>
            <div className="text-sm text-muted-foreground leading-tight">
              Total documented
              <br />
              incidents
            </div>
          </div>

          {byCategory.length > 0 && (
            <div className="space-y-2">
              <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
                Incidents by Category (from submitted reports)
              </div>
              {byCategory.map(([cat, count]) => (
                <div key={cat} className="flex items-center gap-3">
                  <div className="w-32 shrink-0 text-xs text-muted-foreground truncate">
                    {cat}
                  </div>
                  <div className="flex-1 bg-muted rounded-full h-2">
                    <div
                      className="bg-brand-red h-2 rounded-full transition-all"
                      style={{ width: `${(count / maxCat) * 100}%` }}
                    />
                  </div>
                  <div className="w-8 text-xs font-bold text-foreground text-right">
                    {count}
                  </div>
                </div>
              ))}
            </div>
          )}

          {byCategory.length === 0 && (
            <p className="text-sm text-muted-foreground">
              Aggregated statistics will appear here as incident reports are
              submitted.
            </p>
          )}
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search cases, states…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={filterState} onValueChange={setFilterState}>
            <SelectTrigger className="w-full sm:w-44">
              <SelectValue placeholder="All States" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All States</SelectItem>
              {allStates.map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={filterCat} onValueChange={setFilterCat}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {CATEGORIES.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Archive entries */}
        {isLoading && (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-brand-green" />
          </div>
        )}

        {!isLoading && filtered.length === 0 && (
          <div className="text-center py-16 bg-white rounded-2xl border border-border">
            <AlertCircle className="w-10 h-10 mx-auto mb-3 text-muted-foreground/40" />
            <p className="font-semibold text-foreground">No cases found</p>
            <p className="text-sm text-muted-foreground mt-1">
              {entries.length === 0
                ? "Submit the first case below."
                : "Try adjusting your filters."}
            </p>
          </div>
        )}

        <div className="space-y-3">
          {filtered.map((entry) => (
            <ArchiveRow key={entry.id} entry={entry} />
          ))}
        </div>

        {/* Submit form */}
        <div className="bg-white rounded-2xl border border-border shadow-card overflow-hidden">
          <button
            type="button"
            onClick={() => setShowForm((v) => !v)}
            className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-section-bg transition-colors"
          >
            <div className="flex items-center gap-2">
              <Plus className="w-5 h-5 text-brand-green" />
              <span className="font-bold text-foreground">
                Submit a Case to the Archive
              </span>
            </div>
            <span className="text-xs text-muted-foreground">
              Open to legal teams &amp; partners
            </span>
          </button>

          {showForm && (
            <form
              onSubmit={handleSubmit}
              className="px-6 pb-6 pt-4 space-y-4 border-t border-border"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5 md:col-span-2">
                  <Label htmlFor="a-title">
                    Case Title <span className="text-brand-red">*</span>
                  </Label>
                  <Input
                    id="a-title"
                    placeholder="e.g. BVAS malfunction at Ward 3, Polling Unit 007"
                    value={form.caseTitle}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, caseTitle: e.target.value }))
                    }
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="a-state">
                    State <span className="text-brand-red">*</span>
                  </Label>
                  <Input
                    id="a-state"
                    placeholder="e.g. Lagos"
                    value={form.state}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, state: e.target.value }))
                    }
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="a-lga">LGA</Label>
                  <Input
                    id="a-lga"
                    placeholder="e.g. Ikeja"
                    value={form.lga}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, lga: e.target.value }))
                    }
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="a-cat">
                    Category <span className="text-brand-red">*</span>
                  </Label>
                  <Select
                    value={form.category}
                    onValueChange={(v) =>
                      setForm((f) => ({ ...f, category: v }))
                    }
                  >
                    <SelectTrigger id="a-cat">
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
                <div className="space-y-1.5">
                  <Label htmlFor="a-date">Incident Date</Label>
                  <Input
                    id="a-date"
                    type="date"
                    value={form.incidentDate}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, incidentDate: e.target.value }))
                    }
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="a-desc">
                  Description <span className="text-brand-red">*</span>
                </Label>
                <Textarea
                  id="a-desc"
                  rows={4}
                  placeholder="Describe the disenfranchisement incident in detail…"
                  value={form.description}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, description: e.target.value }))
                  }
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="a-source">Source / Evidence Link</Label>
                  <Input
                    id="a-source"
                    placeholder="URL or organisation name"
                    value={form.source}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, source: e.target.value }))
                    }
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="a-by">
                    Your Name / Organisation{" "}
                    <span className="text-brand-red">*</span>
                  </Label>
                  <Input
                    id="a-by"
                    placeholder="e.g. EiE Nigeria Legal Team"
                    value={form.submittedBy}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, submittedBy: e.target.value }))
                    }
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={submitEntry.isPending}
                className="flex items-center gap-2 bg-brand-green hover:bg-brand-green-dark text-white font-bold px-6 py-3 rounded-xl transition-all hover:scale-105 active:scale-95 disabled:opacity-60"
              >
                {submitEntry.isPending && (
                  <Loader2 className="w-4 h-4 animate-spin" />
                )}
                Submit to Archive
              </button>
            </form>
          )}
        </div>
      </div>

      <Footer navigate={navigate} />
    </div>
  );
}
