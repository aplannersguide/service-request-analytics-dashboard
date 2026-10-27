# Security Architecture, Data Privacy & Internal Hosting Guide

This document provides Information Technology (IT) and Information Security (InfoSec) reviewers with a complete architectural overview, data-flow boundary analysis, and verification checklist for the **Service Request & CSAT Analytics Dashboard**.

---

## 1. Architectural Posture: Zero-Backend, 100% Client-Side Execution

The dashboard is a **purely static Single-Page Application (SPA)** built with React 18, Vite, and Chart.js.

- **Zero Server-Side Data Processing:** There is no backend API, database server, cloud storage bucket, or telemetry/analytics SDK.
- **Zero Outbound Network Calls:** The codebase contains zero `fetch()`, `XMLHttpRequest`, `WebSocket`, or `navigator.sendBeacon()` calls.
- **Enforced Content Security Policy (`connect-src 'none'`):** [`index.html`](./index.html) enforces a strict browser-level Content Security Policy:
  ```html
  <meta
    http-equiv="Content-Security-Policy"
    content="default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self' data:; connect-src 'none'; object-src 'none'; base-uri 'self'; form-action 'none';"
  />
  ```
  Even if a user uploads sensitive CSV exports, the browser's security sandbox mathematically blocks any outbound network connection (`connect-src 'none'`) or form submission (`form-action 'none'`).
- **Zero Third-Party CDN Requests:** All fonts and icons are rendered via local system font stacks ([`src/index.css`](./src/index.css)) and bundled SVG icons (`lucide-react`), ensuring 100% offline/air-gapped operation on internal networks without leaking client IP addresses to external CDNs.

---

## 2. Data Lifecycle & Privacy Controls

### A. Default State (Synthetic Mock Data)
When opened for the first time (or after clicking **Reset to Demo**), the application loads synthetic demonstration records generated procedurally in [`src/services/mockData.js`](./src/services/mockData.js). No real operational data is bundled in the source repository or static build artifacts.

### B. Local File Ingestion & Memory Safety
When an authorized user drags and drops `Service Requests.csv` and/or `Service Request Surveys.csv` into [`src/components/DropZoneHeader.jsx`](./src/components/DropZoneHeader.jsx):
1. **File Size Guardrail:** Files exceeding **250 MB** (`MAX_FILE_SIZE_BYTES`) are rejected prior to reading to prevent browser tab memory exhaustion.
2. **2-Byte BOM Slicing:** [`readFileAsText()`](./src/services/dataParser.js) slices only the first 2 bytes (`file.slice(0, 2)`) via `FileReader` to auto-detect UTF-16 vs. UTF-8 encoding without double-buffering the file in memory.
3. **Strict Column Whitelisting (Data Minimization):** [`sanitizeRawRow()`](./src/services/dataParser.js) immediately strips non-essential spatial, address, and GIS columns (such as `Location`, `X`, `Y`, `Well Known ID`, `Layer IDs`, `Police Precincts`, and `Council Districts`). Only the explicit columns required for SLA, backlog, and CSAT calculations (`ALLOWED_CSV_KEYS`) are retained in memory or local storage.

### C. Local Browser Storage & 12-Hour Auto-Expiration (Shared Workstation Protection)
- **Storage Mechanism:** [`src/services/storageService.js`](./src/services/storageService.js) caches the whitelisted dataset in the browser's local `IndexedDB` (`ServiceRequestDashboardDB`) so the user does not lose their view upon refreshing the page.
- **Automatic 12-Hour TTL Purge:** Every stored dataset is wrapped with a `savedAt` timestamp and validated against `STORAGE_TTL_MS` (**12 hours**). When the dashboard loads after 12 hours, `getLocalData()` automatically purges `IndexedDB` and `localStorage` and reverts to synthetic demo data.
- **Manual One-Click Purge:** Clicking **Reset to Demo** in the header immediately executes `clearLocalData()`, wiping `IndexedDB` and `localStorage`.

### D. Cross-Site Scripting (XSS) Protection
- All CSV text values (including free-text `Description` and survey `Answer` comments) are rendered exclusively through standard React JSX bindings, which automatically HTML-encode untrusted strings.
- The codebase contains **zero** uses of `dangerouslySetInnerHTML`, `innerHTML`, `outerHTML`, `document.write()`, or `eval()`.

---

## 3. Dependency Footprint (Minimal Supply-Chain Surface)

The production bundle (`package.json` `dependencies`) uses only **6 well-established, open-source packages**:
1. `react` & `react-dom` (`^18.2.0`) — Core UI rendering
2. `chart.js` (`^4.4.1`) & `react-chartjs-2` (`^5.2.0`) — HTML5 `<canvas>` chart rendering
3. `papaparse` (`^5.4.1`) — Local in-browser CSV/TSV parsing
4. `lucide-react` (`^0.344.0`) — Inline SVG icons

---

## 4. Repository & Build Guardrails

1. **Git Ignore Protections ([`.gitignore`](./.gitignore)):** All `*.csv`, `*.tsv`, `*.xlsx`, `*.zip`, and `backups/` paths are ignored by Git.
2. **Automated Pre-Deploy Build Verification (`npm run verify-dist`):** Configured in [`package.json`](./package.json), the build pipeline scans `dist/` and aborts with a non-zero exit code if any `.csv`, `.tsv`, `.xlsx`, or `.zip` file is present in the build output directory.
3. **Localhost-Only Dev Server:** [`vite.config.js`](./vite.config.js) binds the local development server strictly to loopback (`127.0.0.1:3000`).

---

## 5. 5-Minute IT Code Review & Verification Checklist

Reviewers can verify the entire security posture of this repository in under 5 minutes using the following commands:

```bash
# 1. Verify zero outbound network APIs or unsafe DOM injection exist in source code
grep -rnE "fetch\(|XMLHttpRequest|WebSocket|sendBeacon|dangerouslySetInnerHTML|innerHTML|eval\(" src/

# 2. Verify zero CSV/TSV/XLSX files have ever been committed across Git history
git log --all --full-history -- "*.csv" "*.tsv" "*.xlsx"

# 3. Build static production assets and run the automated data-file verification gate
npm ci
npm run build
npm run verify-dist
```

---

## 6. Internal Server Deployment Guide (IIS / Nginx / Apache / SharePoint)

Because [`vite.config.js`](./vite.config.js) configures relative asset paths (`base: './'`), the compiled `dist/` directory (consisting of `index.html`, 1 CSS bundle, and 1 JS bundle) can be deployed to any internal web server or intranet sub-path without code changes:

1. Run `npm ci && npm run build`.
2. Copy the contents of the `dist/` folder to your internal web server directory (e.g., Windows Server IIS, Nginx, Apache, or an Azure App Service / Entra ID-protected static site).
3. *(Recommended)* Configure your web server or reverse proxy to emit the same HTTP response headers:
   - `Content-Security-Policy: default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self' data:; connect-src 'none'; object-src 'none'; base-uri 'self'; form-action 'none'; frame-ancestors 'self';`
   - `X-Content-Type-Options: nosniff`
   - `Referrer-Policy: no-referrer`
