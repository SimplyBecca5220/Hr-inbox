import React from 'react';
import type { Intent, ReviewStatus } from '../types';
import {
  Search,
  Sparkles,
  CheckCheck,
  Download,
  Filter,
} from 'lucide-react';

interface FilterBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedIntent: Intent | 'ALL';
  onSelectIntent: (intent: Intent | 'ALL') => void;
  selectedStatus: ReviewStatus | 'ALL';
  onSelectStatus: (status: ReviewStatus | 'ALL') => void;
  intentCounts: Record<string, number>;
  statusCounts: Record<string, number>;
  onProcessInbox: () => void;
  isProcessing: boolean;
  onBatchApproveClean: () => void;
  onExportJson: () => void;
}

const INTENT_CONFIG: { id: Intent | 'ALL'; label: string; color: string }[] = [
  { id: 'ALL', label: 'All Categories', color: 'bg-slate-100 text-slate-800 border-slate-200' },
  { id: 'STATUS_INQUIRY', label: 'Status Inquiry', color: 'bg-blue-50 text-blue-700 border-blue-200' },
  { id: 'INTERVIEW_RESCHEDULE', label: 'Reschedule', color: 'bg-amber-50 text-amber-700 border-amber-200' },
  { id: 'COMPENSATION_QUESTION', label: 'Compensation', color: 'bg-purple-50 text-purple-700 border-purple-200' },
  { id: 'WITHDRAWAL', label: 'Withdrawal', color: 'bg-slate-100 text-slate-700 border-slate-300' },
  { id: 'GENERAL_QUERY', label: 'General Query', color: 'bg-teal-50 text-teal-700 border-teal-200' },
  { id: 'REQUIRES_MANUAL_REVIEW', label: 'Manual Review', color: 'bg-rose-50 text-rose-700 border-rose-200' },
];

const STATUS_CONFIG: { id: ReviewStatus | 'ALL'; label: string }[] = [
  { id: 'ALL', label: 'All Status' },
  { id: 'PENDING', label: 'Pending' },
  { id: 'APPROVED', label: 'Approved' },
  { id: 'EDITED', label: 'Edited' },
  { id: 'REJECTED', label: 'Rejected' },
  { id: 'FLAGGED_MANUAL', label: 'Flagged' },
];

export const FilterBar: React.FC<FilterBarProps> = ({
  searchQuery,
  onSearchChange,
  selectedIntent,
  onSelectIntent,
  selectedStatus,
  onSelectStatus,
  intentCounts,
  statusCounts,
  onProcessInbox,
  isProcessing,
  onBatchApproveClean,
  onExportJson,
}) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-sm space-y-4">
      {/* Top Action Row: Search + Process Button + Batch Actions */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search Bar */}
        <div className="relative flex-1 max-w-lg">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search candidate name, role, email, or message text..."
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-slate-800 placeholder:text-slate-400 transition-all"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onProcessInbox}
            disabled={isProcessing}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 disabled:opacity-60 shadow-md shadow-indigo-500/20 transition-all"
          >
            <Sparkles className={`w-3.5 h-3.5 ${isProcessing ? 'animate-spin' : ''}`} />
            <span>{isProcessing ? 'Processing Triage...' : 'Process Inbox'}</span>
          </button>

          <button
            onClick={onBatchApproveClean}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition-colors"
            title="Approve all high-confidence clean messages"
          >
            <CheckCheck className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Approve Clean</span>
          </button>

          <button
            onClick={onExportJson}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 border border-slate-200 transition-colors"
            title="Export processed decisions to JSON"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Export</span>
          </button>
        </div>
      </div>

      {/* Intent Taxonomy Filter Pills */}
      <div>
        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
          <Filter className="w-3.5 h-3.5" />
          <span>Filter by Canonical Intent</span>
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          {INTENT_CONFIG.map((item) => {
            const isSelected = selectedIntent === item.id;
            const count = intentCounts[item.id] || 0;
            return (
              <button
                key={item.id}
                onClick={() => onSelectIntent(item.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                  isSelected
                    ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                    : `${item.color} hover:opacity-80`
                }`}
              >
                <span>{item.label}</span>
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                    isSelected
                      ? 'bg-slate-700 text-slate-200'
                      : 'bg-white/80 shadow-xs'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Review Status Secondary Filter */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100">
        <div className="flex items-center gap-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mr-2">
            Status:
          </span>
          {STATUS_CONFIG.map((status) => {
            const isSelected = selectedStatus === status.id;
            const count = statusCounts[status.id] || 0;
            return (
              <button
                key={status.id}
                onClick={() => onSelectStatus(status.id)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                  isSelected
                    ? 'bg-indigo-50 text-indigo-700 font-bold'
                    : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
                }`}
              >
                {status.label} ({count})
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
