import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import {
  AlertTriangle,
  BarChart2,
  CheckCircle,
  ChevronLeft,
  Clock,
  Download,
  Eye,
  EyeOff,
  Flame,
  Loader2,
  MapPin,
  RefreshCw,
  RotateCcw,
  Upload,
  Users,
  X,
  Zap,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import type { AppView } from "../App";
import { useSubmitReport } from "../hooks/useQueries";
import { useStorageClient } from "../hooks/useStorageClient";
import { generateStatementPDF } from "../utils/pdfGenerator";
import { Header } from "./Header";

interface ReportWizardProps {
  navigate: (v: AppView) => void;
}

type Category = {
  id: string;
  label: string;
  icon: React.ElementType;
  color: string;
  bg: string;
};

const CATEGORIES: Category[] = [
  {
    id: "PU_NOT_OPEN",
    label: "Polling Unit Not Open",
    icon: AlertTriangle,
    color: "text-brand-red",
    bg: "bg-red-50 hover:bg-red-100 border-red-200",
  },
  {
    id: "BVAS_FAILURE",
    label: "BVAS / Tech Failure",
    icon: Zap,
    color: "text-orange-600",
    bg: "bg-orange-50 hover:bg-orange-100 border-orange-200",
  },
  {
    id: "VOTER_INTIMIDATION",
    label: "Voter Intimidation",
    icon: Users,
    color: "text-purple-600",
    bg: "bg-purple-50 hover:bg-purple-100 border-purple-200",
  },
  {
    id: "RESULTS_MISMATCH",
    label: "Results Mismatch",
    icon: BarChart2,
    color: "text-blue-600",
    bg: "bg-blue-50 hover:bg-blue-100 border-blue-200",
  },
  {
    id: "VIOLENCE",
    label: "Violence / Disruption",
    icon: Flame,
    color: "text-red-700",
    bg: "bg-red-50 hover:bg-red-100 border-red-200",
  },
];

function getOrCreateDeviceId(): string {
  const key = "revoda_device_id";
  let id = localStorage.getItem(key);
  if (!id) {
    id = `DEV-${Math.random().toString(36).slice(2, 10).toUpperCase()}`;
    localStorage.setItem(key, id);
  }
  return id;
}

function saveOfflineQueue(data: object) {
  const raw = localStorage.getItem("revoda_offline_queue");
  const queue: object[] = raw ? JSON.parse(raw) : [];
  queue.push(data);
  localStorage.setItem("revoda_offline_queue", JSON.stringify(queue));
}

const TOTAL_STEPS = 5;

export function ReportWizard({ navigate }: ReportWizardProps) {
  const [step, setStep] = useState(1);
  const [category, setCategory] = useState("");
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [mediaKey, setMediaKey] = useState("");
  const [mediaPreviewUrl, setMediaPreviewUrl] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [gpsLat, setGpsLat] = useState(0);
  const [gpsLon, setGpsLon] = useState(0);
  const [gpsStatus, setGpsStatus] = useState<
    "idle" | "fetching" | "ok" | "denied"
  >("idle");
  const [timestamp, setTimestamp] = useState("");
  const [anonymous, setAnonymous] = useState(false);
  const [description, setDescription] = useState("");
  const [sworn, setSworn] = useState(false);
  const [signatureDataUrl, setSignatureDataUrl] = useState("");
  const [submittedId, setSubmittedId] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawingRef = useRef(false);
  const lastPosRef = useRef({ x: 0, y: 0 });

  const storageClient = useStorageClient();
  const submitMutation = useSubmitReport();
  const deviceId = getOrCreateDeviceId();

  const fetchGeo = useCallback(() => {
    setGpsStatus("fetching");
    navigator.geolocation?.getCurrentPosition(
      (pos) => {
        setGpsLat(pos.coords.latitude);
        setGpsLon(pos.coords.longitude);
        setGpsStatus("ok");
      },
      () => setGpsStatus("denied"),
      { timeout: 15000, enableHighAccuracy: true },
    );
  }, []);

  useEffect(() => {
    if (step === 2) {
      setTimestamp(new Date().toISOString());
      fetchGeo();
    }
  }, [step, fetchGeo]);

  useEffect(() => {
    const handleOnline = () => {
      const raw = localStorage.getItem("revoda_offline_queue");
      if (!raw) return;
      const queue: unknown[] = JSON.parse(raw);
      if (queue.length === 0) return;
      toast.info(`Retrying ${queue.length} offline report(s)...`);
      localStorage.removeItem("revoda_offline_queue");
    };
    window.addEventListener("online", handleOnline);
    return () => window.removeEventListener("online", handleOnline);
  }, []);

  // Canvas setup — deferred with rAF so AnimatePresence finishes mounting first
  const setupCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // White background so strokes are always visible
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const getPos = (e: MouseEvent | TouchEvent) => {
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      if ("touches" in e && e.touches.length > 0) {
        return {
          x: (e.touches[0].clientX - rect.left) * scaleX,
          y: (e.touches[0].clientY - rect.top) * scaleY,
        };
      }
      const me = e as MouseEvent;
      return {
        x: (me.clientX - rect.left) * scaleX,
        y: (me.clientY - rect.top) * scaleY,
      };
    };

    const onStart = (e: MouseEvent | TouchEvent) => {
      e.preventDefault();
      isDrawingRef.current = true;
      lastPosRef.current = getPos(e);
    };
    const onMove = (e: MouseEvent | TouchEvent) => {
      e.preventDefault();
      if (!isDrawingRef.current) return;
      const pos = getPos(e);
      ctx.beginPath();
      ctx.moveTo(lastPosRef.current.x, lastPosRef.current.y);
      ctx.lineTo(pos.x, pos.y);
      ctx.strokeStyle = "#111827";
      ctx.lineWidth = 2.5;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.stroke();
      lastPosRef.current = pos;
    };
    const onEnd = () => {
      isDrawingRef.current = false;
      setSignatureDataUrl(canvas.toDataURL("image/png"));
    };

    canvas.addEventListener("mousedown", onStart);
    canvas.addEventListener("mousemove", onMove);
    canvas.addEventListener("mouseup", onEnd);
    canvas.addEventListener("mouseleave", onEnd);
    canvas.addEventListener("touchstart", onStart, { passive: false });
    canvas.addEventListener("touchmove", onMove, { passive: false });
    canvas.addEventListener("touchend", onEnd);

    return () => {
      canvas.removeEventListener("mousedown", onStart);
      canvas.removeEventListener("mousemove", onMove);
      canvas.removeEventListener("mouseup", onEnd);
      canvas.removeEventListener("mouseleave", onEnd);
      canvas.removeEventListener("touchstart", onStart);
      canvas.removeEventListener("touchmove", onMove);
      canvas.removeEventListener("touchend", onEnd);
    };
  }, []);

  useEffect(() => {
    if (step !== 4) return;
    // Defer canvas setup until after AnimatePresence finishes mounting
    let raf: number;
    let cleanup: (() => void) | undefined;
    raf = requestAnimationFrame(() => {
      cleanup = setupCanvas();
    });
    return () => {
      cancelAnimationFrame(raf);
      cleanup?.();
    };
  }, [step, setupCanvas]);

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    setSignatureDataUrl("");
  };

  const handleFileChange = async (file: File) => {
    setMediaFile(file);
    const objectUrl = URL.createObjectURL(file);
    setMediaPreviewUrl(objectUrl);

    if (!storageClient) {
      toast.error("Storage not ready — please wait a moment and try again.");
      return;
    }
    setIsUploading(true);
    setUploadProgress(0);
    try {
      const bytes = new Uint8Array(await file.arrayBuffer());
      const { hash } = await storageClient.putFile(bytes, (pct) =>
        setUploadProgress(pct),
      );
      setMediaKey(hash);
      setUploadProgress(100);
      toast.success("Media uploaded successfully");
    } catch (uploadErr) {
      toast.error(
        `Upload failed: ${
          uploadErr instanceof Error ? uploadErr.message : String(uploadErr)
        }`,
      );
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async () => {
    const payload = {
      category,
      description,
      gpsLat,
      gpsLon,
      clientTimestamp: timestamp,
      deviceId,
      mediaKeys: mediaKey ? [mediaKey] : [],
      anonymous,
      signatureData: signatureDataUrl,
    };

    try {
      const id = await submitMutation.mutateAsync(payload);
      setSubmittedId(id);
      setIsSuccess(true);
      toast.success("Report submitted successfully!");
    } catch (err) {
      console.error("Submit error:", err);
      toast.error("Submission failed — saving offline");
      saveOfflineQueue(payload);
    }
  };

  const handleDownloadPdf = async () => {
    setIsGeneratingPdf(true);
    try {
      await generateStatementPDF({
        incidentId: submittedId,
        category,
        description,
        gpsLat,
        gpsLon,
        timestamp,
        deviceId,
        anonymous,
        signatureDataUrl,
      });
    } catch (pdfErr) {
      toast.error(
        `PDF generation failed: ${
          pdfErr instanceof Error ? pdfErr.message : String(pdfErr)
        }`,
      );
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const progressPct = ((step - 1) / (TOTAL_STEPS - 1)) * 100;

  if (isSuccess) {
    return (
      <div className="min-h-screen">
        <Header navigate={navigate} currentView="report-wizard" />
        <div className="max-w-2xl mx-auto px-4 py-16 text-center">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 200 }}
          >
            <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-brand-green" />
            </div>
            <h1 className="text-3xl font-black text-foreground mb-2">
              Report Submitted!
            </h1>
            <p className="text-muted-foreground mb-4">
              Your incident has been recorded and is now part of the official
              Revoda evidence database.
            </p>
            <div className="bg-section-bg rounded-xl p-4 mb-6 font-mono">
              <div className="text-xs text-muted-foreground">INCIDENT ID</div>
              <div
                data-ocid="report.success_state"
                className="text-xl font-bold text-brand-red mt-1"
              >
                {submittedId}
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                type="button"
                data-ocid="report.primary_button"
                onClick={handleDownloadPdf}
                disabled={isGeneratingPdf}
                className="flex items-center justify-center gap-2 bg-brand-red hover:bg-brand-red-dark text-white font-bold px-6 py-3 rounded-xl shadow-cta transition-all hover:scale-105 disabled:opacity-60"
              >
                {isGeneratingPdf ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Download className="w-4 h-4" />
                )}
                {isGeneratingPdf ? "Generating..." : "Download Statement PDF"}
              </button>
              <button
                type="button"
                data-ocid="report.secondary_button"
                onClick={() => navigate("landing")}
                className="flex items-center justify-center gap-2 bg-foreground text-white font-bold px-6 py-3 rounded-xl transition-all hover:scale-105"
              >
                Back to Home
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Header navigate={navigate} currentView="report-wizard" />

      <div className="bg-white border-b border-border sticky top-16 z-40">
        <div className="max-w-2xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-foreground">
              Step {step} of {TOTAL_STEPS}
            </span>
            <button
              type="button"
              data-ocid="report.close_button"
              onClick={() => navigate("landing")}
              className="p-1 rounded-full hover:bg-muted text-muted-foreground transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <Progress value={progressPct} className="h-2" />
          <div className="flex justify-between mt-1">
            {["Category", "Evidence", "Statement", "Sign", "Submit"].map(
              (s, i) => (
                <span
                  key={s}
                  className={`text-[10px] font-medium ${
                    i + 1 === step ? "text-brand-red" : "text-muted-foreground"
                  }`}
                >
                  {s}
                </span>
              ),
            )}
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            {/* ── STEP 1: Category ── */}
            {step === 1 && (
              <div>
                <h2 className="text-2xl font-black text-foreground mb-2">
                  What type of incident?
                </h2>
                <p className="text-muted-foreground mb-6">
                  Select the category that best describes what you witnessed.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {CATEGORIES.map((cat) => (
                    <button
                      type="button"
                      key={cat.id}
                      data-ocid="report.primary_button"
                      onClick={() => {
                        setCategory(cat.id);
                        setStep(2);
                      }}
                      className={`flex items-center gap-4 p-4 rounded-xl border-2 transition-all text-left ${
                        category === cat.id
                          ? "border-brand-red shadow-md bg-red-50"
                          : `${cat.bg} border-transparent`
                      }`}
                    >
                      <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center shadow-xs">
                        <cat.icon className={`w-6 h-6 ${cat.color}`} />
                      </div>
                      <span className="font-semibold text-foreground text-sm">
                        {cat.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* ── STEP 2: Evidence ── */}
            {step === 2 && (
              <div>
                <h2 className="text-2xl font-black text-foreground mb-2">
                  Capture Evidence
                </h2>
                <p className="text-muted-foreground mb-6">
                  Upload a photo or short video. Metadata is auto-captured
                  below.
                </p>

                <label
                  data-ocid="report.dropzone"
                  className={`block border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-colors mb-4 ${
                    storageClient
                      ? "border-border hover:border-brand-red"
                      : "border-border opacity-60 cursor-not-allowed"
                  }`}
                >
                  <input
                    type="file"
                    accept="image/*,video/*"
                    className="hidden"
                    disabled={!storageClient || isUploading}
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) handleFileChange(f);
                    }}
                  />
                  {!storageClient ? (
                    <div>
                      <Loader2 className="w-8 h-8 text-muted-foreground mx-auto mb-2 animate-spin" />
                      <p className="text-sm text-muted-foreground">
                        Initialising storage...
                      </p>
                    </div>
                  ) : mediaPreviewUrl ? (
                    mediaFile?.type.startsWith("video") ? (
                      <video
                        src={mediaPreviewUrl}
                        className="max-h-48 mx-auto rounded-lg"
                        controls
                      >
                        <track kind="captions" label="No captions available" />
                      </video>
                    ) : (
                      <img
                        src={mediaPreviewUrl}
                        alt="Uploaded evidence preview"
                        className="max-h-48 mx-auto rounded-lg object-contain"
                      />
                    )
                  ) : (
                    <div>
                      <Upload className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                      <p className="font-semibold text-foreground">
                        Tap to upload photo or video
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        JPG, PNG, MP4, MOV up to 50 MB
                      </p>
                    </div>
                  )}
                </label>

                {isUploading && (
                  <div data-ocid="report.loading_state" className="mb-4">
                    <div className="flex items-center gap-2 mb-1">
                      <Loader2 className="w-4 h-4 animate-spin text-brand-red" />
                      <span className="text-sm font-medium">
                        Uploading... {uploadProgress}%
                      </span>
                    </div>
                    <Progress value={uploadProgress} className="h-2" />
                  </div>
                )}

                <div className="bg-section-bg rounded-xl p-4 space-y-3">
                  <h3 className="text-xs font-bold tracking-widest uppercase text-muted-foreground">
                    Auto-Captured Metadata
                  </h3>

                  {/* GPS */}
                  <div className="flex items-center gap-3">
                    <MapPin className="w-4 h-4 text-brand-red shrink-0" />
                    <div className="text-sm flex-1">
                      <span className="font-medium">GPS: </span>
                      {gpsStatus === "fetching" && (
                        <span className="text-muted-foreground">
                          Fetching location...
                        </span>
                      )}
                      {gpsStatus === "ok" && (
                        <span className="text-brand-green font-mono">
                          {gpsLat.toFixed(5)}, {gpsLon.toFixed(5)}
                        </span>
                      )}
                      {gpsStatus === "denied" && (
                        <span className="text-brand-red">
                          Location access denied
                        </span>
                      )}
                      {gpsStatus === "idle" && (
                        <span className="text-muted-foreground">
                          Waiting...
                        </span>
                      )}
                    </div>
                    {(gpsStatus === "denied" || gpsStatus === "idle") && (
                      <button
                        type="button"
                        onClick={fetchGeo}
                        className="flex items-center gap-1 text-xs text-brand-red hover:underline shrink-0"
                      >
                        <RefreshCw className="w-3 h-3" /> Retry
                      </button>
                    )}
                  </div>

                  {/* Timestamp */}
                  <div className="flex items-center gap-3">
                    <Clock className="w-4 h-4 text-brand-red shrink-0" />
                    <div className="text-sm font-mono">
                      <span className="font-sans font-medium">Timestamp: </span>
                      {timestamp}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 mt-4 p-4 rounded-xl border border-border">
                  {anonymous ? (
                    <EyeOff className="w-4 h-4 text-muted-foreground" />
                  ) : (
                    <Eye className="w-4 h-4 text-muted-foreground" />
                  )}
                  <div className="flex-1">
                    <Label
                      htmlFor="anon-toggle"
                      className="font-semibold text-sm cursor-pointer"
                    >
                      Submit Anonymously
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      Your identity will not be linked to this report
                    </p>
                  </div>
                  <Switch
                    id="anon-toggle"
                    data-ocid="report.switch"
                    checked={anonymous}
                    onCheckedChange={setAnonymous}
                  />
                </div>
              </div>
            )}

            {/* ── STEP 3: Statement ── */}
            {step === 3 && (
              <div>
                <h2 className="text-2xl font-black text-foreground mb-2">
                  Your Statement
                </h2>
                <p className="text-muted-foreground mb-6">
                  Describe exactly what you witnessed in as much detail as
                  possible.
                </p>
                <div className="relative mb-4">
                  <textarea
                    data-ocid="report.textarea"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe what happened in detail. Include: time, persons involved, actions taken, any threats or pressure you observed..."
                    rows={8}
                    className="w-full rounded-xl border border-border bg-white p-4 text-sm text-foreground placeholder:text-muted-foreground resize-none focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                  <span className="absolute bottom-3 right-3 text-xs text-muted-foreground">
                    {description.split(/\s+/).filter(Boolean).length} words
                  </span>
                </div>
                <div className="flex items-start gap-3 p-4 rounded-xl bg-section-bg border border-border">
                  <Checkbox
                    id="sworn"
                    data-ocid="report.checkbox"
                    checked={sworn}
                    onCheckedChange={(v) => setSworn(v === true)}
                    className="mt-0.5"
                  />
                  <Label
                    htmlFor="sworn"
                    className="text-sm leading-relaxed cursor-pointer"
                  >
                    I swear this statement is <strong>true and accurate</strong>{" "}
                    to the best of my knowledge, and I understand this document
                    may be used as legal evidence in accordance with Section 84
                    of the Nigerian Evidence Act.
                  </Label>
                </div>
              </div>
            )}

            {/* ── STEP 4: Signature ── */}
            {step === 4 && (
              <div>
                <h2 className="text-2xl font-black text-foreground mb-2">
                  Sign Your Statement
                </h2>
                <p className="text-muted-foreground mb-6">
                  Sign using your finger (mobile) or mouse (desktop) in the box
                  below.
                </p>
                <div className="border-2 border-border rounded-2xl overflow-hidden bg-white shadow-sm">
                  <canvas
                    ref={canvasRef}
                    data-ocid="report.canvas_target"
                    width={600}
                    height={200}
                    className="w-full cursor-crosshair block"
                    style={{ touchAction: "none", height: "200px" }}
                  />
                </div>
                <div className="flex items-center justify-between mt-3">
                  <p className="text-xs text-muted-foreground">
                    {signatureDataUrl
                      ? "Signature captured ✓"
                      : "Draw your signature above"}
                  </p>
                  <button
                    type="button"
                    data-ocid="report.secondary_button"
                    onClick={clearSignature}
                    className="flex items-center gap-1 text-sm text-muted-foreground hover:text-brand-red transition-colors"
                  >
                    <RotateCcw className="w-3.5 h-3.5" /> Clear
                  </button>
                </div>
              </div>
            )}

            {/* ── STEP 5: Review & Submit ── */}
            {step === 5 && (
              <div>
                <h2 className="text-2xl font-black text-foreground mb-2">
                  Review &amp; Submit
                </h2>
                <p className="text-muted-foreground mb-6">
                  Review your report before submitting it to the Revoda system.
                </p>

                <div className="space-y-3 mb-6">
                  <ReviewRow
                    label="Category"
                    value={category.replace(/_/g, " ")}
                  />
                  <ReviewRow
                    label="GPS"
                    value={
                      gpsLat !== 0
                        ? `${gpsLat.toFixed(5)}, ${gpsLon.toFixed(5)}`
                        : "Not captured"
                    }
                  />
                  <ReviewRow label="Timestamp" value={timestamp} />
                  <ReviewRow
                    label="Anonymous"
                    value={anonymous ? "Yes" : "No"}
                  />
                  <ReviewRow
                    label="Media"
                    value={mediaKey ? "Uploaded \u2713" : "No media"}
                  />
                  <div className="bg-section-bg rounded-xl p-4">
                    <div className="text-xs font-bold text-muted-foreground mb-2 uppercase tracking-wider">
                      Statement
                    </div>
                    <p className="text-sm text-foreground leading-relaxed">
                      {description || "—"}
                    </p>
                  </div>
                  {signatureDataUrl && (
                    <div className="bg-section-bg rounded-xl p-4">
                      <div className="text-xs font-bold text-muted-foreground mb-2 uppercase tracking-wider">
                        Signature
                      </div>
                      <img
                        src={signatureDataUrl}
                        alt="Your digital signature"
                        className="h-16 border border-border rounded bg-white p-1"
                      />
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 p-3 rounded-xl bg-green-50 border border-green-200 mb-6">
                  <CheckCircle className="w-4 h-4 text-brand-green shrink-0" />
                  <p className="text-xs text-brand-green font-medium">
                    {gpsLat !== 0
                      ? "✓ GPS captured — this report is Legal Ready"
                      : "⚠ No GPS — report will be flagged as incomplete"}
                  </p>
                </div>

                <button
                  type="button"
                  data-ocid="report.submit_button"
                  onClick={handleSubmit}
                  disabled={submitMutation.isPending}
                  className="w-full flex items-center justify-center gap-2 bg-brand-red hover:bg-brand-red-dark text-white font-bold text-lg py-4 rounded-xl shadow-cta transition-all hover:scale-[1.01] disabled:opacity-60"
                >
                  {submitMutation.isPending ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" /> Submitting...
                    </>
                  ) : (
                    <>Submit Report &amp; Generate PDF</>
                  )}
                </button>

                {submitMutation.isError && (
                  <p
                    data-ocid="report.error_state"
                    className="text-sm text-brand-red mt-3 text-center"
                  >
                    {(submitMutation.error as Error)?.message ||
                      "Submission failed"}
                  </p>
                )}
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {step < 5 && (
          <div className="flex items-center justify-between mt-8">
            <button
              type="button"
              data-ocid="report.secondary_button"
              onClick={() =>
                step > 1 ? setStep(step - 1) : navigate("landing")
              }
              className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              {step === 1 ? "Cancel" : "Back"}
            </button>

            <button
              type="button"
              data-ocid="report.primary_button"
              onClick={() => setStep(step + 1)}
              disabled={
                (step === 1 && !category) ||
                (step === 3 && (!description.trim() || !sworn))
              }
              className="flex items-center gap-2 bg-brand-red hover:bg-brand-red-dark text-white font-bold px-6 py-2.5 rounded-xl shadow-cta transition-all hover:scale-105 disabled:opacity-40 disabled:pointer-events-none"
            >
              {step === 4 ? "Review" : "Continue"}
              <Badge
                variant="secondary"
                className="bg-white/20 text-white border-0 text-xs"
              >
                {step}/{TOTAL_STEPS}
              </Badge>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center py-2 border-b border-border">
      <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
        {label}
      </span>
      <span className="text-sm font-medium text-foreground max-w-[200px] text-right truncate">
        {value}
      </span>
    </div>
  );
}
