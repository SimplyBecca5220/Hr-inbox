import React, { useState } from 'react';
import { DOCS_CONTENT } from '../data/docsContent';
import { X, BookOpen, ShieldAlert, Award, FileText } from 'lucide-react';

interface DocsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type TabType = 'intent' | 'directive' | 'unlearned';

export const DocsModal: React.FC<DocsModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<TabType>('intent');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-50 border-b border-slate-200 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-100 text-indigo-700">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Repository Policy & Directives</h3>
              <p className="text-xs text-slate-500">Authoritative guidelines governing intent, guardrails & unlearned directives</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200/50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Bar */}
        <div className="flex border-b border-slate-200 bg-slate-100/50 px-6 pt-3 gap-2 shrink-0">
          <button
            onClick={() => setActiveTab('intent')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-t-xl transition-all border-b-2 ${
              activeTab === 'intent'
                ? 'bg-white text-indigo-600 border-indigo-600 shadow-sm'
                : 'text-slate-600 hover:text-slate-900 border-transparent hover:bg-slate-200/50'
            }`}
          >
            <Award className="w-4 h-4" />
            intent.md (Taxonomy)
          </button>

          <button
            onClick={() => setActiveTab('directive')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-t-xl transition-all border-b-2 ${
              activeTab === 'directive'
                ? 'bg-white text-rose-600 border-rose-600 shadow-sm'
                : 'text-slate-600 hover:text-slate-900 border-transparent hover:bg-slate-200/50'
            }`}
          >
            <ShieldAlert className="w-4 h-4" />
            final_directive.md (Safety)
          </button>

          <button
            onClick={() => setActiveTab('unlearned')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-t-xl transition-all border-b-2 ${
              activeTab === 'unlearned'
                ? 'bg-white text-amber-600 border-amber-600 shadow-sm'
                : 'text-slate-600 hover:text-slate-900 border-transparent hover:bg-slate-200/50'
            }`}
          >
            <FileText className="w-4 h-4" />
            unlearned.md (Lessons)
          </button>
        </div>

        {/* Document Body */}
        <div className="p-6 overflow-y-auto flex-1 font-mono text-xs leading-relaxed text-slate-800 bg-slate-50/30 whitespace-pre-wrap">
          {activeTab === 'intent' && DOCS_CONTENT.intent}
          {activeTab === 'directive' && DOCS_CONTENT.finalDirective}
          {activeTab === 'unlearned' && DOCS_CONTENT.unlearned}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-3.5 bg-slate-50 border-t border-slate-200 shrink-0">
          <span className="text-xs text-slate-500">
            Source files preserved at repository root: <code>intent.md</code>, <code>final_directive.md</code>, <code>unlearned.md</code>
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 shadow-sm"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
