# HR Candidate Inbox Helper

An AI-first inbox triage tool that clusters candidate emails by intent, drafts context-aware responses, and enforces a strict human-in-the-loop review gate before any message is sent.

Built for the **"Unlearn, Use, Raise the Load"** quest (Format A: Inbox Helper)

---

## Live Demo
- **Hosted App:** https://hrcandidateinbox.netlify.app/
- **5-Minute Loom Video Walkthrough:**

---

## Core Features
- **Semantic Intent Clustering:** Categorizes messages into 6 standardized categories (`STATUS_INQUIRY`, `INTERVIEW_RESCHEDULE`, `COMPENSATION_QUESTION`, `WITHDRAWAL`, `GENERAL_QUERY`, `REQUIRES_MANUAL_REVIEW`).
- **Human-in-the-Loop Review Gate:** Recruiter reviews every AI-generated draft, with full inline editing and explicit Approve, Reject, or Flag actions.
- **Dual Processing Engine:**
  - *Default Mode:* Client-side semantic engine that runs out of the box with zero setup.
  - *Live Gemini Mode:* Connect directly to Gemini 2.5 Flash using your own API key.
- **Stress-Testing ("Raise the Load"):** Built-in dataset switcher to test against prompt injections, multi-intent emails, foreign language text, and hostile sentiment.
- **Custom JSON Ingestion:** Upload any downloaded candidate message dataset directly into the interface for immediate processing.

---

## Project Structure
```text
├── data/
│   ├── base_inbox.json         # Standard test messages
│   └── stress_inbox.json       # Adversarial and edge-case dataset
├── src/
│   ├── App.tsx                 # Main triage interface and state management
│   ├── types.ts                # TypeScript definitions and Pydantic-aligned schema
│   ├── services/
│   │   ├── engine.ts           # Core semantic triage and draft generation
│   │   └── gemini.ts           # Optional direct LLM integration
├── tests/
│   └── triage.test.ts          # Schema validation and logic tests
├── intent.md                   # Problem definition and non-negotiables
├── final_directive.md          # System prompts, taxonomy, and safety rules
├── unlearned.md                # Reflection on unlearning old coding habits
├── logs/                       # Daily build logs (Days 1–5)
├── netlify.toml                # Netlify deployment configuration
└── package.json
