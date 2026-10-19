import React, { useState, useEffect } from 'react';
import type { CandidateMessageAnalysis, Intent, Urgency, ReviewStatus } from '../types';
import { GuardrailEngine } from '../services/guardrails';
import {
  Calendar,
  Check,
  X,
  Flag,
  Sparkles,
  AlertTriangle,
  Copy,
  Clock,
  RotateCcw,
  CheckCircle2,
  FileEdit,
  ShieldAlert,
} from 'lucide-react';

interface MessageCardProps {
  message: CandidateMessageAnalysis;
  onApprove: (id: string, effectiveDraft: string) => void;
  onReject: (id: string) => void;
  onFlagManual: (id: string) => void;
  onDraftChange: (id: string, newDraft: string) => void;
}

export const MessageCard: React.FC<MessageCardProps> = ({
  message,
  onApprove,
  onReject,
  onFlagManual,
  onDraftChange,
}) => {
  const [draft, setDraft] = useState(message.edited_draft ?? message.proposed_draft);
  const [copied, setCopied] = useState(false);

  // Sync draft state if message changes (e.g. reprocessing or reset)
  useEffect(() => {
    setDraft(message.edited_draft ?? message.proposed_draft);
  }, [message.edited_draft, message.proposed_draft]);

  const isEdited = draft !== message.proposed_draft;

  // Real-time draft validation check
  const draftValidation = GuardrailEngine.postValidateDraft(draft);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setDraft(val);
    onDraftChange(message.id, val);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(draft);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Quick Macros
  const insertMacro = (macroText: string) => {
    const updated = draft ? `${draft}\n\n${macroText}` : macroText;
    setDraft(updated);
    onDraftChange(message.id, updated);
  };

  const resetDraft = () => {
    setDraft(message.proposed_draft);
    onDraftChange(message.id, message.proposed_draft);
  };

  // Intent badge styling
  const getIntentBadge = (intent: Intent) => {
    switch (intent) {
      case 'STATUS_INQUIRY':
        return {
          label: 'Status Inquiry',
          className: 'bg-blue-50 text-blue-700 border-blue-200',
        };
      case 'INTERVIEW_RESCHEDULE':
        return {
          label: 'Interview Reschedule',
          className: 'bg-amber-50 text-amber-700 border-amber-200',
        };
      case 'COMPENSATION_QUESTION':
        return {
          label: 'Compensation Question',
          className: 'bg-purple-50 text-purple-700 border-purple-200',
        };
      case 'WITHDRAWAL':
        return {
          label: 'Withdrawal',
          className: 'bg-slate-100 text-slate-700 border-slate-300',
        };
      case 'GENERAL_QUERY':
        return {
          label: 'General Query',
          className: 'bg-teal-50 text-teal-700 border-teal-200',
        };
      case 'REQUIRES_MANUAL_REVIEW':
      default:
        return {
          label: 'Requires Manual Review',
          className: 'bg-rose-50 text-rose-700 border-rose-200',
        };
    }
  };

  // Urgency pill styling
  const getUrgencyBadge = (urgency: Urgency) => {
    switch (urgency) {
      case 'CRITICAL':
        return {
          label: 'Critical SLA',
          className: 'bg-rose-100 text-rose-800 border-rose-300',
          dot: 'bg-rose-500 animate-ping',
        };
      case 'HIGH':
        return {
          label: 'High SLA',
          className: 'bg-orange-100 text-orange-800 border-orange-200',
          dot: 'bg-orange-500',
        };
      case 'MEDIUM':
        return {
          label: 'Medium SLA',
          className: 'bg-amber-100 text-amber-800 border-amber-200',
          dot: 'bg-amber-500',
        };
      case 'LOW':
      default:
        return {
          label: 'Low SLA',
          className: 'bg-emerald-100 text-emerald-800 border-emerald-200',
          dot: 'bg-emerald-500',
        };
    }
  };

  // Review status badge styling
  const getStatusBadge = (status: ReviewStatus) => {
    switch (status) {
      case 'APPROVED':
        return {
          label: 'Approved',
          className: 'bg-emerald-50 text-emerald-700 border-emerald-300',
          icon: CheckCircle2,
        };
      case 'EDITED':
        return {
          label: 'Edited & Approved',
          className: 'bg-indigo-50 text-indigo-700 border-indigo-300',
          icon: FileEdit,
        };
      case 'REJECTED':
        return {
          label: 'Rejected',
          className: 'bg-slate-100 text-slate-600 border-slate-300 line-through',
          icon: X,
        };
      case 'FLAGGED_MANUAL':
        return {
          label: 'Flagged for Escalation',
          className: 'bg-rose-100 text-rose-800 border-rose-300',
          icon: Flag,
        };
      case 'PENDING':
      default:
        return {
          label: 'Pending Review',
          className: 'bg-amber-50 text-amber-700 border-amber-300',
          icon: Clock,
        };
    }
  };

  const intentStyle = getIntentBadge(message.detected_intent);
  const urgencyStyle = getUrgencyBadge(message.urgency);
  const statusStyle = getStatusBadge(message.review_status);
  const StatusIcon = statusStyle.icon;

  const confPercent = Math.round(message.confidence_score * 100);

  return (
    <div
      className={`bg-white rounded-2xl border transition-all duration-200 overflow-hidden shadow-sm hover:shadow-md ${
        message.review_status === 'APPROVED' || message.review_status === 'EDITED'
          ? 'border-emerald-200 bg-emerald-50/10'
          : message.review_status === 'REJECTED'
          ? 'border-slate-200 opacity-75'
          : message.review_status === 'FLAGGED_MANUAL'
          ? 'border-rose-300 bg-rose-50/10'
          : 'border-slate-200'
      }`}
    >
      {/* Card Header */}
      <div className="p-4 sm:p-5 border-b border-slate-100 bg-slate-50/50">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Candidate Info */}
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-800 text-white font-bold flex items-center justify-center text-sm shadow-sm shrink-0">
              {message.sender_name
                .split(' ')
                .map((n) => n[0])
                .join('')
                .slice(0, 2)
                .toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-sm font-bold text-slate-900">{message.sender_name}</h3>
                <span className="text-xs text-slate-500 font-normal">
                  &lt;{message.sender_email}&gt;
                </span>
                <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-100 text-slate-700">
                  {message.applied_role}
                </span>
              </div>
              <div className="flex items-center gap-3 text-[11px] text-slate-500 mt-1 flex-wrap">
                <span>Stage: <strong className="text-slate-700">{message.stage}</strong></span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {new Date(message.received_at).toLocaleString([], {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
            </div>
          </div>

          {/* Review Status Indicator Tag */}
          <div className="flex items-center gap-2 shrink-0">
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${statusStyle.className}`}
            >
              <StatusIcon className="w-3.5 h-3.5" />
              {statusStyle.label}
            </span>
          </div>
        </div>

        {/* Metadata Badges Bar: Intent, Urgency, Confidence */}
        <div className="flex items-center gap-2 mt-3.5 pt-3 border-t border-slate-200/60 flex-wrap">
          {/* Intent Badge */}
          <span
            className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${intentStyle.className}`}
          >
            {intentStyle.label}
          </span>

          {/* Urgency Pill */}
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border ${urgencyStyle.className}`}
          >
            <span className={`w-2 h-2 rounded-full ${urgencyStyle.dot}`} />
            {urgencyStyle.label}
          </span>

          {/* Confidence Meter */}
          <div
            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-mono font-bold border ${
              confPercent >= 85
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : confPercent >= 70
                ? 'bg-amber-50 text-amber-700 border-amber-200'
                : 'bg-rose-50 text-rose-700 border-rose-200'
            }`}
            title={`Classifier Confidence: ${confPercent}%`}
          >
            <span>Confidence:</span>
            <span>{confPercent}%</span>
          </div>

          {message.guardrail_flags && message.guardrail_flags.length > 0 && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-300">
              <ShieldAlert className="w-3 h-3 text-rose-600" />
              {message.guardrail_flags.length} Guardrail Triggered
            </span>
          )}
        </div>
      </div>

      {/* Card Body */}
      <div className="p-4 sm:p-5 space-y-4">
        {/* Guardrail Violation Callout Banner (if applicable) */}
        {message.guardrail_flags && message.guardrail_flags.length > 0 && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 space-y-1 text-xs">
            <div className="flex items-center gap-1.5 font-bold text-rose-800">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>Guardrail Safety Intercept Triggered</span>
            </div>
            <div className="flex flex-wrap gap-1.5 mt-1">
              {message.guardrail_flags.map((flag, idx) => (
                <span
                  key={idx}
                  className="px-2 py-0.5 rounded font-mono font-bold text-[10px] bg-rose-200/80 text-rose-900"
                >
                  {flag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Original Candidate Message Box */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase tracking-wider">
            <span>Inbound Candidate Message: "{message.subject}"</span>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 font-sans leading-relaxed whitespace-pre-wrap selection:bg-indigo-100">
            {message.original_text}
          </div>
        </div>

        {/* AI Reasoning Callout */}
        <div className="p-3.5 rounded-xl bg-indigo-50/60 border border-indigo-100 text-xs text-slate-700 space-y-1">
          <div className="flex items-center gap-1.5 font-bold text-indigo-900">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
            <span>AI Triage & Guardrail Reasoning</span>
          </div>
          <p className="leading-relaxed pl-5 text-indigo-950/90">{message.reasoning}</p>
        </div>

        {/* Editable Proposed Draft Response */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Proposed Draft Response
              </label>
              {isEdited && (
                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-indigo-100 text-indigo-700">
                  Custom Edited
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-400 font-mono text-[11px]">
                {draft.length} chars
              </span>
              <button
                type="button"
                onClick={handleCopy}
                className="flex items-center gap-1 text-slate-500 hover:text-slate-800 transition-colors"
                title="Copy response to clipboard"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>{copied ? 'Copied!' : 'Copy'}</span>
              </button>
            </div>
          </div>

          <div className="relative">
            <textarea
              rows={4}
              value={draft}
              onChange={handleTextChange}
              placeholder="Type your response draft here..."
              className={`w-full p-3 rounded-xl text-xs font-sans text-slate-900 leading-relaxed border transition-all focus:outline-none focus:ring-2 ${
                !draftValidation.isValid
                  ? 'border-rose-400 focus:ring-rose-500 bg-rose-50/30'
                  : 'border-slate-200 focus:ring-indigo-500 bg-white'
              }`}
            />
          </div>

          {/* Draft Violation Warning */}
          {!draftValidation.isValid && (
            <div className="p-2 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
              <span>
                Directive Warning: Draft contains prohibited text ({draftValidation.violations.join(', ')}).
              </span>
            </div>
          )}

          {/* Quick Macro Buttons */}
          <div className="flex items-center justify-between gap-2 pt-1 flex-wrap">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mr-1">
                Macros:
              </span>
              <button
                type="button"
                onClick={() =>
                  insertMacro(
                    'You can find a convenient slot directly on our team calendar here: https://calendly.com/talent-interview-ops'
                  )
                }
                className="px-2 py-1 rounded-md text-[11px] font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition-colors"
              >
                + Calendly Link
              </button>

              <button
                type="button"
                onClick={() =>
                  insertMacro(
                    'Please note that posted ranges represent broad market benchmarks and do not constitute a formal employment offer.'
                  )
                }
                className="px-2 py-1 rounded-md text-[11px] font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition-colors"
              >
                + Comp Safe-Harbor
              </button>

              <button
                type="button"
                onClick={() =>
                  insertMacro(
                    'Thank you again for your enthusiasm, and we look forward to continuing the conversation!'
                  )
                }
                className="px-2 py-1 rounded-md text-[11px] font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition-colors"
              >
                + Warm Sign-Off
              </button>
            </div>

            {isEdited && (
              <button
                type="button"
                onClick={resetDraft}
                className="flex items-center gap-1 text-[11px] font-medium text-slate-500 hover:text-slate-800 transition-colors"
              >
                <RotateCcw className="w-3 h-3" />
                Reset Draft
              </button>
            )}
          </div>
        </div>

        {/* Action Buttons Row */}
        <div className="flex items-center justify-between gap-2 pt-3 border-t border-slate-100 flex-wrap">
          <div className="flex items-center gap-2">
            {/* Approve & Send Button */}
            <button
              onClick={() => onApprove(message.id, draft)}
              disabled={!draftValidation.isValid}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm shadow-emerald-500/20 transition-all"
            >
              <Check className="w-4 h-4" />
              <span>{isEdited ? 'Approve Edited Draft' : 'Approve & Send'}</span>
            </button>

            {/* Reject Button */}
            <button
              onClick={() => onReject(message.id)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-rose-700 bg-slate-100 hover:bg-rose-50 border border-slate-200 hover:border-rose-200 transition-colors"
            >
              <X className="w-4 h-4" />
              <span>Reject</span>
            </button>
          </div>

          {/* Flag Manual Review Button */}
          <button
            onClick={() => onFlagManual(message.id)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-colors"
          >
            <Flag className="w-3.5 h-3.5 text-rose-600" />
            <span>Flag for Senior Recruiter</span>
          </button>
        </div>
      </div>
    </div>
  );
};
