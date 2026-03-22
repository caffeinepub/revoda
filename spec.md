# Revoda Voter Legal Defense Interface

## Current State
New project. No existing code.

## Requested Changes (Diff)

### Add
- Full incident reporting flow (5 steps): category selection, evidence upload, metadata capture, statement, signature
- Automated PDF generation (Voter's Statement of Fact) using jsPDF on the frontend
- GPS coordinate + server-side timestamp capture displayed transparently to user during reporting
- Offline-first behavior: queue reports to localStorage if offline, auto-sync on reconnect
- Anonymous submission toggle
- "Track My Rep" placeholder screen
- Role-based admin dashboard: table of all reports, "Legal Ready" filter (reports with valid GPS+timestamp), basic map view showing report hotspots by Nigerian state
- Admin access via authorization component (admin role)
- On-platform blob storage for media uploads (photos/short videos)
- Backend stores all report data: incident ID, category, description, GPS, timestamp, device ID, media blob references, anonymous flag, signature image

### Modify
N/A (new project)

### Remove
N/A (new project)

## Implementation Plan
1. Motoko backend:
   - Report record type: id, category, description, gpsLat, gpsLon, timestamp, deviceId, mediaKeys (blob refs), anonymous, signatureData, submittedAt
   - submitReport() - stores report, returns generated incident ID
   - getReports() - admin only, returns all reports
   - getReport(id) - returns single report
   - Reports stored in stable var (HashMap)

2. Frontend flows:
   - Landing page: EiE Nigeria brand (red/white/green), two CTAs, ticker
   - 5-step report wizard with progress indicator
   - Step 1: category icons (PU Not Open, Tech/BVAS Failure, Voter Intimidation, Results Mismatch, Violence)
   - Step 2: photo/video capture + file upload, blob storage integration
   - Step 3: auto-fetch GPS + display timestamp
   - Step 4: description textarea + oath checkbox
   - Step 5: finger-draw signature canvas + submit
   - Post-submit: generate and download PDF (jsPDF)
   - Offline queue in localStorage

3. Admin dashboard (auth-gated, admin role):
   - Login screen
   - Reports table with Legal Ready filter
   - Simple map using embedded iframe or SVG Nigeria map showing report counts by state

4. Track My Rep: placeholder screen with "Coming Soon" message
