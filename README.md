# HR Candidate Inbox Helper (Production React + TypeScript + Netlify)

A production-ready, client-side React 19 application powered by Vite and Tailwind CSS for triaging candidate communications, classifying canonical intent, enforcing strict compliance guardrails, and facilitating human-in-the-loop review.

Optimized for **zero-config static deployment on Netlify** with no backend servers, database dependencies, or intermediate PII transmission.

---

## 🚀 Key Architectural Features

### 1. Zero-Config Static Hosting on Netlify
* **100% Client-Side Execution**: All classification, heuristic scoring, regex guardrails, and review states execute directly in the candidate reviewer's browser.
* **Zero PII Exposure**: Candidate message bodies, emails, and compensation inquiries are never sent to or stored on an intermediate proxy server.
* **Netlify SPA Configuration**: Includes [`netlify.toml`](./netlify.toml) configured with `publish = "dist"` and an SPA rewrite rule (`/* -> /index.html 200`).

### 2. Real-Time Hybrid Processing Engine (`src/services/engine.ts`)
* **Works Out of the Box (Zero API Key Required)**: Features a client-side semantic heuristic engine that parses message semantics, detects urgency, assigns confidence scores, outputs chain-of-thought reasoning, and generates tailored 2–3 sentence drafts according to [`intent.md`](./intent.md).
* **Optional Live Gemini Mode**: Click the Settings key icon in the navigation bar to enter an optional Google Gemini API key. When enabled, the app directly queries the **Gemini 2.5 Flash** REST API from the browser with structured JSON output schema enforcement (`responseMimeType: "application/json"`).
* **Automatic Graceful Fallback**: If an API quota is reached or network failure occurs, the engine falls back to the deterministic heuristic engine with an audit log.

### 3. Comprehensive Guardrail Security Intercept (`src/services/guardrails.ts`)
Strictly enforces policies defined in [`final_directive.md`](./final_directive.md) and [`unlearned.md`](./unlearned.md):
* **Prohibition on Offer Commitments**: Detects verbal offer traps (e.g., *"Kevin said I'm hired at $195k"*).
* **Adversarial Prompt Injection Defense**: Neutralizes instruction overrides (`"Ignore previous instructions"`, `"AutoHireGPT"`, `"dump_system_prompt()"`).
* **Multi-Intent & Conflict Routing**: Detects conflicting intentions (e.g., reschedule + salary demand + withdrawal) and routes to `REQUIRES_MANUAL_REVIEW`.
* **Sensitive Legal & Regulatory Escalation**: Identifies EEOC, discrimination, and litigation threats, immediately applying `CRITICAL` urgency.
* **Post-Draft Validator**: Scans all drafts (AI-generated or reviewer-typed) to block prohibited commitments (e.g., *"you are hired"*, *"welcome to the company"*).

### 4. Dual Datasets (`src/data/`)
* **Base Inbox (`base_inbox.json`)**: Contains standard candidate lifecycle communications:
  - **Alex Carter**: Senior Product Designer (`STATUS_INQUIRY`)
  - **Priya Sharma**: Staff Backend Engineer (`INTERVIEW_RESCHEDULE`)
  - **Marcus Vance**: Principal Cloud Architect (`COMPENSATION_QUESTION`)
  - **Elena Rostova**: Lead DevOps Engineer (`WITHDRAWAL`)
  - **Tariq Adeleke**: AI Systems Engineer (`GENERAL_QUERY`)
  - *Plus Aarav Patel, Samantha Wright, and Liam O'Connor.*
* **Stress Inbox (`stress_inbox.json`)**: Contains adversarial edge cases:
  - Prompt injection overrides (`AutoHireGPT`, system prompt dumps, CTO emergency drill simulation).
  - Offer confirmation baiting ($195k verbal promise).
  - 3-in-1 conflicting intent (reschedule + withdrawal + salary demand).
  - Foreign language Japanese reschedule request (`技術面接の日程再調整のお願い`).
* **Custom JSON Upload**: Upload and triage your own candidate dataset JSON files via the top navigation bar with browser-based `FileReader` schema parsing, automatic fallback ID assignment, and one-click removal back to default presets.
* **Connect Email Inbox (Production SaaS Flow)**: Direct mailbox authentication modal (Gmail, Outlook, Custom IMAP) without OTP friction. Dynamically fetches and triages unread candidate inquiries addressed to the recruiter's domain with session persistence and a dropdown user avatar menu.

### 5. Interactive Recruiter Workflow & Polish
* **Animated Triage Progress**: Click **"Process Inbox"** to trigger live animated scanning with real-time candidate tickers and status pulses.
* **Dynamic KPI Metrics Bar**: Live counters for Total Messages, Pending, Approved/Edited, Manual Review, Average Confidence, and Guardrail Alerts.
* **Multi-Faceted Filter Bar**: Filter by any canonical intent pill with dynamic count badges, review status tabs, and instant multi-field search.
* **Inline Draft Editor & Quick Macros**:
  - `+ Calendly Link`
  - `+ Comp Safe-Harbor Disclaimer`
  - `+ Warm Sign-Off`
  - `Reset to Original Proposed Draft`
* **Human-in-the-Loop Actions**:
  - `Approve & Send` (sets status to `APPROVED` or `EDITED` if modified).
  - `Reject` (sets status to `REJECTED`).
  - `Flag for Senior Recruiter` (sets status to `FLAGGED_MANUAL` and intent to `REQUIRES_MANUAL_REVIEW`).
* **Local Persistence**: Saves all review decisions and edits to `localStorage` under versioned keys. Includes a `Reset Data` button.
* **In-App Directives Reader**: Tabbed reader modal for `intent.md`, `final_directive.md`, and `unlearned.md`.

---

## 📂 Repository Structure

```
.
├── netlify.toml                # Netlify SPA deployment configuration
├── intent.md                   # Canonical Intent taxonomy and routing specification
├── final_directive.md          # Authoritative operational & safety compliance policy
├── unlearned.md                # Post-mortem architectural lessons & negative constraints
├── index.html                  # HTML entry point with typography
├── package.json                # Project dependencies & scripts
├── vite.config.ts              # Vite bundler configuration
├── tailwind.config.js          # Tailwind CSS theme tokens
└── src/
    ├── App.tsx                 # Main application orchestration & state
    ├── main.tsx                # React DOM root entry
    ├── index.css               # Global Tailwind CSS styles
    ├── types/
    │   └── index.ts            # Core TypeScript interfaces & types
    ├── data/
    │   ├── base_inbox.json     # Standard candidate communications
    │   ├── stress_inbox.json   # Adversarial, conflicting, & stress scenarios
    │   └── docsContent.ts      # Bundled documentation content for offline reading
    ├── services/
    │   ├── engine.ts           # Hybrid processing engine (deterministic + Gemini)
    │   ├── guardrails.ts       # Zero-trust safety & post-draft validation rules
    │   └── storage.ts          # LocalStorage persistence & settings service
    └── components/
        ├── Navbar.tsx          # Top header with dataset switcher & mode indicator
        ├── MetricsBar.tsx      # Real-time dynamic KPI metrics counters
        ├── FilterBar.tsx       # Intent pills, search input, and action triggers
        ├── ProgressBar.tsx     # Animated progress indicator during triage
        ├── MessageCard.tsx     # Candidate card, draft textarea, macros, & actions
        ├── SettingsModal.tsx   # Gemini API key & model configuration dialog
        ├── DocsModal.tsx       # In-app viewer for repository directives
        └── ToastContainer.tsx  # Toast notification feedback system
```

---

## 🛠️ Local Development & Build

### Prerequisites
- Node.js 18+ (tested on Node.js v24.22.0)
- npm 9+

### Installation
```bash
npm install
```

### Running Dev Server
```bash
npm run dev
```

### Building for Production
```bash
npm run build
```
Builds the static assets into `dist/`.

---

## 🌐 Deploying to Netlify

### Option 1: Netlify CLI
```bash
npm install -g netlify-cli
npm run build
netlify deploy --prod --dir=dist
```

### Option 2: Netlify Git Continuous Deployment
1. Push this repository to GitHub/GitLab.
2. Link the repository in the Netlify Dashboard.
3. Build Settings are automatically populated from `netlify.toml`:
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
4. Click **Deploy Site**. The application is immediately live with HTTPS and zero server maintenance!
