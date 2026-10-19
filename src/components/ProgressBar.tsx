import React from 'react';
import type { RawCandidateMessage } from '../types';
import { Loader2, Sparkles, ShieldCheck } from 'lucide-react';

interface ProgressBarProps {
  isProcessing: boolean;
  current: number;
  total: number;
  currentItem?: RawCandidateMessage | null;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  isProcessing,
  current,
  total,
  currentItem,
}) => {
  if (!isProcessing) return null;

  const percent = total > 0 ? Math.round((current / total) * 100) : 0;

  return (
    <div className="bg-gradient-to-r from-indigo-900 via-slate-900 to-indigo-950 text-white rounded-2xl p-4 shadow-xl border border-indigo-500/30 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2.5">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center">
            <Loader2 className="w-4 h-4 text-indigo-400 animate-spin" />
          </div>
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-300 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              Running Hybrid AI Inbox Triage Pipeline
            </h4>
            <p className="text-xs text-slate-300">
              {currentItem ? (
                <>
                  Analyzing <span className="font-semibold text-white">{currentItem.sender_name}</span> ({currentItem.applied_role || 'Candidate'})
                </>
              ) : (
                'Initializing pipeline guardrails & semantic classifier...'
              )}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs font-mono font-bold text-indigo-200">
            {current} of {total} messages ({percent}%)
          </span>
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
            <ShieldCheck className="w-3 h-3" />
            Zero-Trust Guardrails
          </span>
        </div>
      </div>

      {/* Progress Track */}
      <div className="w-full bg-slate-800/80 rounded-full h-2 overflow-hidden p-0.5 border border-slate-700">
        <div
          className="bg-gradient-to-r from-indigo-500 via-violet-400 to-emerald-400 h-full rounded-full transition-all duration-300 shadow-sm shadow-indigo-500/50"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
};
