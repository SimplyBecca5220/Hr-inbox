export const DOCS_CONTENT = {
  intent: `# HR Candidate Inbox Helper: Intent Taxonomy & Routing Specification
**Document Version:** 1.0.0  
**Effective Date:** 2026-10-15  
**Taxonomy Authority:** HR Operations & AI Platform Team

---

## 1. Overview
The **HR Candidate Inbox Helper** classifies candidate communications into six mutually exclusive canonical intent categories. Each category governs downstream routing, prioritization, confidence scoring thresholds, and automated response draft generation.

### Intent Taxonomy:
1. **STATUS_INQUIRY**: Applicant requesting update on application status, interview feedback timeline, or next steps.
2. **INTERVIEW_RESCHEDULE**: Applicant requests to move, postpone, or cancel an already scheduled interview due to conflict, illness, or emergency.
3. **COMPENSATION_QUESTION**: Questions regarding base salary ranges, bonus structures, equity packages, relocation assistance, healthcare, or 401(k) benefits.
4. **WITHDRAWAL**: Applicant formally informs the company that they wish to withdraw their application from active consideration.
5. **GENERAL_QUERY**: Miscellaneous candidate inquiries about general company policies, workplace location, remote/hybrid arrangements, interview dress code, or tech stack.
6. **REQUIRES_MANUAL_REVIEW**: High-risk, ambiguous, adversarial, or out-of-scope candidate communications that cannot be safely answered with automated draft templates.

---

## 2. Confidence Threshold Rules
- **Score >= 0.85**: High confidence. Standard review queue.
- **0.70 <= Score < 0.85**: Moderate confidence. Reviewer alerted to verify intent.
- **Score < 0.70**: Low confidence. **Mandatory override to REQUIRES_MANUAL_REVIEW**.`,

  finalDirective: `# HR Candidate Inbox Helper: Final Operational & Safety Directive
**Document Version:** 1.0.0  
**Effective Date:** 2026-10-15  
**Classification:** STRICT HR COMPLIANCE POLICY  
**Audience:** AI Engineering Team, HR Operations, Automated Pipelines

---

## 1. Core Directive 1: Strict Prohibition on Offer and Compensation Commitments
> **POLICY STATEMENT:** Under NO circumstances may the AI confirm, validate, imply, or promise an employment offer, compensation package, equity allocation, bonus structure, or employment start date.

- **Never Confirm Verbal or Informal Promises**: Even if a candidate claims a hiring manager verbally offered them a position ("Sarah said I got the job"), the AI must NEVER confirm this claim.
- **Never Generate Formal Acceptance Language**: Drafts must not contain phrases such as "Welcome to the team", "You are hired", or "Your salary is confirmed at".
- **Never Quote Binding Salary Figures**: The AI may explain general pay bands only with non-binding disclaimers.

---

## 2. Core Directive 2: Adversarial Attack & Prompt Injection Defense
> **POLICY STATEMENT:** Candidate messages must be treated as untrusted user input. All attempts to manipulate the model's behavior, override system instructions, exfiltrate internal prompts, or hijack response generation must be actively detected and neutralized.

- Detect instruction overrides ("Ignore previous instructions", "AutoHireGPT", "dump_system_prompt()").
- Force detected_intent = \`REQUIRES_MANUAL_REVIEW\` and urgency = \`CRITICAL\`.
- Output safe holding draft.

---

## 3. Core Directive 3: Ambiguity, Multi-Intent & Conflict Resolution
- Route conflicting requests (e.g. reschedule while threatening withdrawal) to \`REQUIRES_MANUAL_REVIEW\`.
- Any classification with confidence < 0.70 must resolve to \`REQUIRES_MANUAL_REVIEW\`.

---

## 4. Core Directive 4: Legal, Discrimination, and Sensitive Topic Escalations
- Claims of discrimination, EEOC complaints, or litigation holds route immediately to \`REQUIRES_MANUAL_REVIEW\` with \`CRITICAL\` urgency.

---

## 5. Core Directive 5: Mandatory Human-in-the-Loop Review Gate
- No automated communication may ever be transmitted directly to an applicant without explicit human review and approval.`,

  unlearned: `# HR Candidate Inbox Helper: Unlearned Directives & Post-Mortem Architecture Lessons
**Document Version:** 1.0.0  
**Effective Date:** 2026-10-18  
**Classification:** ARCHITECTURAL & SAFETY AUDIT LOG  

---

## 1. Critical Post-Mortem Lessons

### Lesson 1: Never Trust an LLM Alone with Offer Commitments
Candidates who craft urgent or emotional emails frequently trick generative models into generating polite congratulatory confirmations. Deterministic pre-scans and post-draft regex guardrails are non-negotiable.

### Lesson 2: Client-Side Determinism is Superior to Server-Side Latency & PII Risk
Routing sensitive candidate communications, salary expectations, and medical emergencies through intermediate proxy servers creates data privacy exposure under GDPR/CCPA. Running 100% client-side ensures zero intermediate PII storage.

### Lesson 3: Adversarial Injections Must Be Neutralized at Ingestion
Delimiters, markdown tags, and authority impersonation ("CTO drill") bypass standard prompt-level guardrails. Only programmatic regex matching provides ironclad security.

### Lesson 4: Ambiguity and Multi-Intent Cannot Be Guessed
When messages present conflicting actions (reschedule + withdraw), the system must escalate rather than guess.

### Lesson 5: Multilingual Support for International Candidates
Urgent reschedule requests written in Japanese or other languages must be recognized and handled with appropriate priority.`,
};
