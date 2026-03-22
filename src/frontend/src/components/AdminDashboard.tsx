import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  AlertCircle,
  CheckCircle,
  Filter,
  Loader2,
  LogOut,
  MapPin,
  RefreshCw,
  Shield,
  XCircle,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import type { AppView } from "../App";
import type { Report } from "../backend.d";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useIsAdmin, useReports } from "../hooks/useQueries";
import { Header } from "./Header";

interface AdminDashboardProps {
  navigate: (v: AppView) => void;
}

const CATEGORY_LABELS: Record<string, string> = {
  PU_NOT_OPEN: "PU Not Open",
  BVAS_FAILURE: "BVAS Failure",
  VOTER_INTIMIDATION: "Voter Intimidation",
  RESULTS_MISMATCH: "Results Mismatch",
  VIOLENCE: "Violence",
};

function isLegalReady(r: Report): boolean {
  return r.gpsLat !== 0 && r.gpsLon !== 0 && r.clientTimestamp !== "";
}

export function AdminDashboard({ navigate }: AdminDashboardProps) {
  const { clear, identity } = useInternetIdentity();
  const isLoggedIn = !!identity && !identity.getPrincipal().isAnonymous();

  const adminQuery = useIsAdmin();
  const reportsQuery = useReports();

  const [legalReadyOnly, setLegalReadyOnly] = useState(false);
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 10;

  if (!isLoggedIn || (adminQuery.isSuccess && !adminQuery.data)) {
    return (
      <div className="min-h-screen">
        <Header navigate={navigate} currentView="admin-dashboard" />
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
          <Shield className="w-12 h-12 text-brand-red" />
          <p className="text-xl font-bold text-foreground">
            Admin access required
          </p>
          <button
            type="button"
            data-ocid="admin_dashboard.primary_button"
            onClick={() => navigate("admin-login")}
            className="bg-brand-red text-white font-bold px-6 py-3 rounded-xl"
          >
            Sign In as Admin
          </button>
        </div>
      </div>
    );
  }

  const reports: Report[] = reportsQuery.data || [];
  const filtered = legalReadyOnly ? reports.filter(isLegalReady) : reports;
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const catCounts: Record<string, number> = {};
  for (const r of reports) {
    catCounts[r.category] = (catCounts[r.category] || 0) + 1;
  }

  const legalReadyCount = reports.filter(isLegalReady).length;

  const handleLogout = () => {
    clear();
    navigate("landing");
  };

  return (
    <div className="min-h-screen bg-section-bg">
      <Header navigate={navigate} currentView="admin-dashboard" />

      <div className="bg-foreground text-white">
        <div className="max-w-7xl mx-auto px-4 md:px-8 h-12 flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm">
            <Shield className="w-4 h-4 text-brand-red" />
            <span className="font-semibold">Admin Dashboard</span>
            <span className="text-white/40">|</span>
            <span className="text-white/60 text-xs font-mono">
              {identity?.getPrincipal().toString().slice(0, 16)}...
            </span>
          </div>
          <button
            type="button"
            data-ocid="admin_dashboard.secondary_button"
            onClick={handleLogout}
            className="flex items-center gap-1.5 text-sm text-white/70 hover:text-white transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            Sign Out
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            {
              label: "Total Reports",
              value: reports.length,
              color: "text-foreground",
            },
            {
              label: "Legal Ready",
              value: legalReadyCount,
              color: "text-brand-green",
            },
            {
              label: "Anonymous",
              value: reports.filter((r) => r.anonymous).length,
              color: "text-muted-foreground",
            },
            {
              label: "Incident Types",
              value: Object.keys(catCounts).length,
              color: "text-brand-red",
            },
          ].map((s) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl border border-border p-4 shadow-card"
            >
              <div className={`text-3xl font-black ${s.color}`}>{s.value}</div>
              <div className="text-xs text-muted-foreground font-medium mt-1">
                {s.label}
              </div>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl border border-border shadow-card overflow-hidden">
            <div className="px-5 py-4 border-b border-border flex items-center gap-2">
              <MapPin className="w-4 h-4 text-brand-red" />
              <h2 className="font-bold text-foreground">Hotspot Map</h2>
            </div>
            <div className="p-4">
              <NigeriaHotspotMap reports={reports} />
              <div className="mt-4 space-y-2">
                <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  By Category
                </h3>
                {Object.entries(catCounts).length === 0 ? (
                  <p className="text-xs text-muted-foreground">No data yet</p>
                ) : (
                  Object.entries(catCounts).map(([cat, count]) => (
                    <div key={cat} className="flex items-center gap-2">
                      <div
                        className="h-1.5 bg-brand-red rounded-full"
                        style={{
                          width: `${Math.min(100, (count / reports.length) * 100)}%`,
                          minWidth: "8px",
                        }}
                      />
                      <span className="text-xs text-muted-foreground">
                        {CATEGORY_LABELS[cat] || cat}
                      </span>
                      <span className="text-xs font-bold text-foreground ml-auto">
                        {count}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 bg-white rounded-2xl border border-border shadow-card overflow-hidden">
            <div className="px-5 py-4 border-b border-border flex items-center justify-between flex-wrap gap-3">
              <h2 className="font-bold text-foreground">Incident Reports</h2>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Filter className="w-3.5 h-3.5 text-muted-foreground" />
                  <Label
                    htmlFor="legal-filter"
                    className="text-sm cursor-pointer"
                  >
                    Legal Ready Only
                  </Label>
                  <Switch
                    id="legal-filter"
                    data-ocid="admin_dashboard.switch"
                    checked={legalReadyOnly}
                    onCheckedChange={(v) => {
                      setLegalReadyOnly(v);
                      setPage(1);
                    }}
                  />
                </div>
                <button
                  type="button"
                  data-ocid="admin_dashboard.secondary_button"
                  onClick={() => reportsQuery.refetch()}
                  disabled={reportsQuery.isFetching}
                  className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  <RefreshCw
                    className={`w-3.5 h-3.5 ${reportsQuery.isFetching ? "animate-spin" : ""}`}
                  />
                  Refresh
                </button>
              </div>
            </div>

            {reportsQuery.isLoading && (
              <div
                data-ocid="admin_dashboard.loading_state"
                className="flex justify-center items-center py-16"
              >
                <Loader2 className="w-8 h-8 animate-spin text-brand-red" />
              </div>
            )}

            {reportsQuery.isError && (
              <div
                data-ocid="admin_dashboard.error_state"
                className="flex flex-col items-center gap-3 py-12"
              >
                <AlertCircle className="w-8 h-8 text-brand-red" />
                <p className="text-sm text-muted-foreground">
                  Failed to load reports
                </p>
              </div>
            )}

            {reportsQuery.isSuccess && (
              <div className="overflow-x-auto">
                {paginated.length === 0 ? (
                  <div
                    data-ocid="admin_dashboard.empty_state"
                    className="text-center py-16 text-muted-foreground"
                  >
                    <MapPin className="w-10 h-10 mx-auto mb-3 opacity-30" />
                    <p className="font-medium">No reports found</p>
                    {legalReadyOnly && (
                      <p className="text-xs mt-1">
                        Try disabling the Legal Ready filter
                      </p>
                    )}
                  </div>
                ) : (
                  <table
                    className="w-full text-sm"
                    data-ocid="admin_dashboard.table"
                  >
                    <thead>
                      <tr className="bg-section-bg border-b border-border">
                        <th className="px-4 py-3 text-left text-xs font-bold text-muted-foreground uppercase tracking-wider">
                          ID
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-bold text-muted-foreground uppercase tracking-wider">
                          Category
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-bold text-muted-foreground uppercase tracking-wider">
                          GPS
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-bold text-muted-foreground uppercase tracking-wider">
                          Timestamp
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-bold text-muted-foreground uppercase tracking-wider">
                          Anon
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-bold text-muted-foreground uppercase tracking-wider">
                          Legal
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginated.map((r, i) => (
                        <tr
                          key={r.id}
                          data-ocid={`admin_dashboard.row.${i + 1}`}
                          className="border-b border-border hover:bg-section-bg/50 transition-colors"
                        >
                          <td className="px-4 py-3 font-mono text-xs text-brand-red">
                            {r.id.slice(0, 12)}...
                          </td>
                          <td className="px-4 py-3">
                            <Badge variant="outline" className="text-xs">
                              {CATEGORY_LABELS[r.category] || r.category}
                            </Badge>
                          </td>
                          <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                            {r.gpsLat !== 0
                              ? `${r.gpsLat.toFixed(3)}, ${r.gpsLon.toFixed(3)}`
                              : "—"}
                          </td>
                          <td className="px-4 py-3 text-xs text-muted-foreground">
                            {r.clientTimestamp
                              ? new Date(r.clientTimestamp).toLocaleString()
                              : "—"}
                          </td>
                          <td className="px-4 py-3 text-center">
                            {r.anonymous ? (
                              <span className="text-muted-foreground text-xs">
                                Yes
                              </span>
                            ) : (
                              <span className="text-foreground text-xs">
                                No
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            {isLegalReady(r) ? (
                              <span className="flex items-center gap-1 text-brand-green text-xs font-semibold">
                                <CheckCircle className="w-3.5 h-3.5" /> Ready
                              </span>
                            ) : (
                              <span className="flex items-center gap-1 text-brand-red text-xs">
                                <XCircle className="w-3.5 h-3.5" /> Missing
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}

            {totalPages > 1 && (
              <div className="flex items-center justify-between px-5 py-3 border-t border-border">
                <span className="text-xs text-muted-foreground">
                  Showing {(page - 1) * PAGE_SIZE + 1}–
                  {Math.min(page * PAGE_SIZE, filtered.length)} of{" "}
                  {filtered.length}
                </span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    data-ocid="admin_dashboard.pagination_prev"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="px-3 py-1 text-xs rounded-lg border border-border hover:bg-section-bg disabled:opacity-40 transition-colors"
                  >
                    Prev
                  </button>
                  <button
                    type="button"
                    data-ocid="admin_dashboard.pagination_next"
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="px-3 py-1 text-xs rounded-lg border border-border hover:bg-section-bg disabled:opacity-40 transition-colors"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function NigeriaHotspotMap({ reports }: { reports: Report[] }) {
  const zones = [
    { label: "NW", x: 80, y: 40 },
    { label: "NE", x: 190, y: 38 },
    { label: "NC", x: 135, y: 70 },
    { label: "SW", x: 75, y: 105 },
    { label: "SS", x: 155, y: 115 },
    { label: "SE", x: 195, y: 100 },
  ];
  const total = Math.max(1, reports.length);
  return (
    <div className="relative">
      <svg
        role="img"
        aria-label="Nigeria incident hotspot map"
        viewBox="0 0 260 150"
        className="w-full"
        xmlns="http://www.w3.org/2000/svg"
      >
        <title>Nigeria incident hotspot map</title>
        <rect x="0" y="0" width="260" height="150" fill="#f0fdf4" rx="8" />
        <path
          d="M65,18 L200,14 L220,42 L210,85 L190,125 L160,135 L120,128 L85,118 L60,92 L55,60 L58,38 Z"
          fill="#bbf7d0"
          stroke="#4ade80"
          strokeWidth="1"
          opacity="0.8"
        />
        {zones.map((z) => {
          const count = reports.filter((r) => {
            if (z.label === "NW") return r.gpsLat > 11 && r.gpsLon < 10;
            if (z.label === "NE") return r.gpsLat > 11 && r.gpsLon >= 10;
            if (z.label === "NC") return r.gpsLat >= 8 && r.gpsLat <= 11;
            if (z.label === "SW") return r.gpsLat < 8 && r.gpsLon < 7;
            if (z.label === "SS")
              return r.gpsLat < 8 && r.gpsLon >= 7 && r.gpsLon < 10;
            return r.gpsLat < 8 && r.gpsLon >= 10;
          }).length;
          const rad = count > 0 ? Math.min(18, 6 + (count / total) * 16) : 6;
          return (
            <g key={z.label}>
              {count > 0 && (
                <circle
                  cx={z.x}
                  cy={z.y}
                  r={rad + 5}
                  fill="#c62828"
                  opacity="0.12"
                />
              )}
              <circle
                cx={z.x}
                cy={z.y}
                r={rad}
                fill={count > 0 ? "#c62828" : "#d1fae5"}
                stroke={count > 0 ? "#991b1b" : "#4ade80"}
                strokeWidth="1"
                opacity="0.85"
              />
              <text
                x={z.x}
                y={z.y + 1}
                textAnchor="middle"
                dominantBaseline="middle"
                fill={count > 0 ? "white" : "#166534"}
                fontSize="8"
                fontWeight="bold"
              >
                {count > 0 ? count : z.label}
              </text>
            </g>
          );
        })}
      </svg>
      <p className="text-xs text-muted-foreground text-center mt-2">
        Pin size = report density by zone
      </p>
    </div>
  );
}
