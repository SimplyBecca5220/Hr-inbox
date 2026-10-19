import React from 'react';
import type { CandidateMessageAnalysis } from '../types';
import {
  Inbox,
  Clock,
  CheckCircle,
  AlertOctagon,
  ShieldAlert,
  Percent,
} from 'lucide-react';

interface MetricsBarProps {
  messages: CandidateMessageAnalysis[];
}

export const MetricsBar: React.FC<MetricsBarProps> = ({ messages }) => {
  const total = messages.length;
  const approvedOrEdited = messages.filter(
    (m) => m.review_status === 'APPROVED' || m.review_status === 'EDITED'
  ).length;
  const pending = messages.filter((m) => m.review_status === 'PENDING').length;
  const flagged = messages.filter(
    (m) =>
      m.review_status === 'FLAGGED_MANUAL' ||
      m.detected_intent === 'REQUIRES_MANUAL_REVIEW'
  ).length;

  const totalFlags = messages.reduce((acc, m) => acc + (m.guardrail_flags?.length || 0), 0);
  const avgConf =
    total > 0
      ? Math.round(
          (messages.reduce((acc, m) => acc + m.confidence_score, 0) / total) * 100
        )
      : 0;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
      {/* Total Messages */}
      <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center gap-3">
        <div className="p-2.5 rounded-xl bg-slate-100 text-slate-700">
          <Inbox className="w-5 h-5" />
        </div>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
            Total Inbound
          </p>
          <p className="text-xl font-bold text-slate-900">{total}</p>
        </div>
      </div>

      {/* Pending Review */}
      <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center gap-3">
        <div className="p-2.5 rounded-xl bg-amber-50 text-amber-600">
          <Clock className="w-5 h-5" />
        </div>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
            Pending Review
          </p>
          <p className="text-xl font-bold text-amber-600">{pending}</p>
        </div>
      </div>

      {/* Approved / Edited */}
      <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center gap-3">
        <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600">
          <CheckCircle className="w-5 h-5" />
        </div>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
            Approved / Edited
          </p>
          <p className="text-xl font-bold text-emerald-600">{approvedOrEdited}</p>
        </div>
      </div>

      {/* Flagged Manual Review */}
      <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center gap-3">
        <div className="p-2.5 rounded-xl bg-rose-50 text-rose-600">
          <AlertOctagon className="w-5 h-5" />
        </div>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
            Manual Review
          </p>
          <p className="text-xl font-bold text-rose-600">{flagged}</p>
        </div>
      </div>

      {/* Avg Confidence */}
      <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center gap-3">
        <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600">
          <Percent className="w-5 h-5" />
        </div>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
            Avg Confidence
          </p>
          <p className="text-xl font-bold text-indigo-600">{avgConf}%</p>
        </div>
      </div>

      {/* Guardrail Alerts */}
      <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center gap-3">
        <div className="p-2.5 rounded-xl bg-violet-50 text-violet-600">
          <ShieldAlert className="w-5 h-5" />
        </div>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
            Guardrail Flags
          </p>
          <p className="text-xl font-bold text-violet-600">{totalFlags}</p>
        </div>
      </div>
    </div>
  );
};
