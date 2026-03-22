export interface PdfReportData {
  incidentId: string;
  category: string;
  description: string;
  gpsLat: number;
  gpsLon: number;
  timestamp: string;
  deviceId: string;
  anonymous: boolean;
  signatureDataUrl: string;
}

async function loadJsPDF(): Promise<any> {
  if ((window as any).jspdf?.jsPDF) {
    return (window as any).jspdf.jsPDF;
  }
  await new Promise<void>((resolve, reject) => {
    const existing = document.querySelector("script[data-jspdf]");
    if (existing) {
      existing.addEventListener("load", () => resolve());
      return;
    }
    const script = document.createElement("script");
    script.setAttribute("data-jspdf", "true");
    script.src =
      "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js";
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load jsPDF"));
    document.head.appendChild(script);
  });
  return (window as any).jspdf.jsPDF;
}

export async function generateStatementPDF(data: PdfReportData): Promise<void> {
  const JsPDF = await loadJsPDF();
  const doc = new JsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

  const pageW = 210;
  const margin = 15;
  const contentW = pageW - margin * 2;

  // Red header banner
  doc.setFillColor(198, 40, 40);
  doc.rect(0, 0, pageW, 32, "F");

  // White header text
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text("EiE NIGERIA | REVODA", margin, 13);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text("Voter Legal Defense System", margin, 21);

  // Green accent bar
  doc.setFillColor(11, 122, 67);
  doc.rect(0, 32, pageW, 4, "F");

  let y = 48;

  // Title
  doc.setTextColor(17, 24, 39);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text("VOTER'S STATEMENT OF FACT", margin, y);
  y += 10;

  // Incident ID box
  doc.setFillColor(242, 244, 247);
  doc.roundedRect(margin, y, contentW, 14, 2, 2, "F");
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(198, 40, 40);
  doc.text("INCIDENT ID:", margin + 4, y + 5);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(17, 24, 39);
  doc.text(data.incidentId, margin + 34, y + 5);
  y += 20;

  // Section: Incident Details
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(17, 24, 39);
  doc.text("INCIDENT DETAILS", margin, y);
  y += 2;
  doc.setDrawColor(198, 40, 40);
  doc.setLineWidth(0.5);
  doc.line(margin, y, margin + contentW, y);
  y += 6;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text("Category:", margin, y);
  doc.setFont("helvetica", "normal");
  doc.text(data.category.replace(/_/g, " "), margin + 28, y);
  y += 7;

  doc.setFont("helvetica", "bold");
  doc.text("Anonymous:", margin, y);
  doc.setFont("helvetica", "normal");
  doc.text(data.anonymous ? "Yes" : "No", margin + 28, y);
  y += 10;

  doc.setFont("helvetica", "bold");
  doc.text("Description:", margin, y);
  y += 6;
  doc.setFont("helvetica", "normal");
  const descLines: string[] = doc.splitTextToSize(data.description, contentW);
  doc.text(descLines, margin, y);
  y += descLines.length * 5 + 8;

  // Section: Signature
  if (data.signatureDataUrl && data.signatureDataUrl.length > 100) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text("DECLARANT SIGNATURE", margin, y);
    y += 2;
    doc.line(margin, y, margin + contentW, y);
    y += 6;
    try {
      doc.addImage(data.signatureDataUrl, "PNG", margin, y, 70, 30);
      y += 36;
    } catch {
      doc.setFont("helvetica", "italic");
      doc.setFontSize(10);
      doc.text("[Signature captured digitally]", margin, y);
      y += 10;
    }
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(107, 114, 128);
    doc.text(
      "I swear this statement is true and accurate to the best of my knowledge.",
      margin,
      y,
    );
    y += 8;
  }

  // Section: Technical Audit
  doc.setTextColor(17, 24, 39);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("TECHNICAL AUDIT TRAIL", margin, y);
  y += 2;
  doc.line(margin, y, margin + contentW, y);
  y += 6;

  doc.setFillColor(242, 244, 247);
  doc.roundedRect(margin, y, contentW, 30, 2, 2, "F");
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(17, 24, 39);
  const audit = [
    `GPS Coordinates: ${data.gpsLat !== 0 ? data.gpsLat.toFixed(6) : "Unavailable"}, ${data.gpsLon !== 0 ? data.gpsLon.toFixed(6) : "Unavailable"}`,
    `Client Timestamp: ${data.timestamp}`,
    `Device ID: ${data.deviceId}`,
    `Report Generated: ${new Date().toISOString()}`,
  ];
  audit.forEach((line, i) => {
    doc.text(line, margin + 4, y + 6 + i * 6);
  });
  y += 36;

  // Footer
  const pageH = 297;
  doc.setFillColor(17, 24, 39);
  doc.rect(0, pageH - 18, pageW, 18, "F");
  doc.setFont("helvetica", "italic");
  doc.setFontSize(8);
  doc.setTextColor(255, 255, 255);
  const footerText =
    "This document was generated by the Revoda system in accordance with Section 84 of the Nigerian Evidence Act.";
  doc.text(footerText, pageW / 2, pageH - 8, { align: "center" });

  doc.save(`Revoda_Statement_${data.incidentId}.pdf`);
}
