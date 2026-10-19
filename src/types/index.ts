export type Intent =
  | 'STATUS_INQUIRY'
  | 'INTERVIEW_RESCHEDULE'
  | 'COMPENSATION_QUESTION'
  | 'WITHDRAWAL'
  | 'GENERAL_QUERY'
  | 'REQUIRES_MANUAL_REVIEW';

export type Urgency = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type ReviewStatus = 'PENDING' | 'APPROVED' | 'EDITED' | 'REJECTED' | 'FLAGGED_MANUAL';

export interface RawCandidateMessage {
  id: string;
  sender_name: string;
  sender_email: string;
  date_received?: string;
  subject?: string;
  applied_role?: string;
  stage?: string;
  body: string;
}

export interface CandidateMessageAnalysis {
  id: string;
  sender_name: string;
  sender_email: string;
  subject: string;
  original_text: string;
  applied_role: string;
  stage: string;
  received_at: string;
  detected_intent: Intent;
  confidence_score: number;
  urgency: Urgency;
  reasoning: string;
  proposed_draft: string;
  review_status: ReviewStatus;
  guardrail_flags: string[];
  edited_draft?: string;
  reviewer_notes?: string;
  reviewed_at?: string;
  is_processed: boolean;
}

export type DatasetType = 'base' | 'stress' | 'custom' | 'connected';

export type EmailProvider = 'gmail' | 'outlook' | 'imap';

export interface ConnectedAccount {
  email: string;
  provider: EmailProvider;
  connectedAt: string;
}

export interface EngineSettings {
  apiKey: string;
  model: string;
  useLiveApi: boolean;
}

export interface GuardrailResult {
  isSafe: boolean;
  forcedIntent?: Intent;
  forcedUrgency?: Urgency;
  flags: string[];
  reasoningNotes: string[];
  safeDraftOverride?: string;
}

export interface ToastMessage {
  id: string;
  title: string;
  description?: string;
  type?: 'success' | 'info' | 'warning' | 'error';
}
