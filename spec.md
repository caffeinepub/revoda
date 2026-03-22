# Revoda

## Current State
Revoda is a mobile-first PWA for EiE Nigeria. It has:
- 5-step incident reporting wizard (category, media/GPS, sworn statement, signature, submit)
- PDF generation for "Statement of Fact"
- Admin dashboard (Internet Identity login) with report filtering and hotspot map
- Blob storage for media uploads
- Role-based authorization (admin/user/guest)
- "Track My Rep" placeholder

Backend exposes: submitReport, getReportCount, getReports, getReport, plus auth/blob-storage primitives.

## Requested Changes (Diff)

### Add
1. **Reform Lobby** -- A section where EiE legal teams/partners can post reform bills or advocacy items driven by election-day evidence. Citizens can sign petitions. Open submission form (no login required to submit updates/items or sign petitions). Each item has: title, summary, category (e.g. "BVAS Reform", "Polling Unit Access"), evidence link to related incidents, petition signature count, and status ("Active", "Passed", "Pending").

2. **Disenfranchisement Archive** -- A public-facing anonymized dashboard showing aggregated disenfranchisement data from submitted reports. Displays: total incidents by category, incidents by state/LGA (from GPS-derived metadata or user-submitted field), timeline of incidents, and a searchable/filterable archive table. Legal teams/partners can submit archive entries (additional documented cases not in the report wizard) via an open form.

3. **Open Partner Submission Form** -- A shared form (no login required) for legal teams and partners to submit:
   - Reform lobby items (new reform proposals with supporting evidence)
   - Disenfranchisement archive entries (documented cases with location, category, description, source)
   These submissions automatically appear in the respective public sections and the admin dashboard.

### Modify
- Backend: add ReformItem and ArchiveEntry types with their CRUD operations
- App.tsx: add new views for reform-lobby, disenfranchisement-archive, partner-submit
- Admin Dashboard: add tabs/sections for reviewing reform items and archive entries
- Landing page: add navigation links for the two new sections

### Remove
- Nothing removed

## Implementation Plan
1. Backend: add `ReformItem` type (id, title, summary, category, status, evidenceNote, petitionCount, submittedBy, submittedAt), `ArchiveEntry` type (id, caseTitle, state, lga, category, description, source, date, submittedAt). Add public functions: submitReformItem, signPetition, getReformItems, submitArchiveEntry, getArchiveEntries, getPublicStats (aggregated anonymized report stats). Admin function: updateReformItemStatus.
2. Frontend: ReformLobby component (list of reform items, sign petition button, submit new item form)
3. Frontend: DisenfranchisementArchive component (stats dashboard with charts, searchable archive table, submit new entry form)
4. Frontend: Update App.tsx with new views
5. Frontend: Update Landing with navigation to new sections
6. Frontend: Update AdminDashboard with tabs for reform items and archive entries
