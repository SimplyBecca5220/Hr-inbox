import React, { useRef, useState, useEffect } from 'react';
import type { ConnectedAccount, DatasetType, EngineSettings } from '../types';
import {
  Inbox,
  ShieldCheck,
  Settings,
  RotateCcw,
  Sparkles,
  AlertTriangle,
  Upload,
  FileText,
  X,
  Mail,
  LogOut,
  ChevronDown,
} from 'lucide-react';

interface NavbarProps {
  currentDataset: DatasetType;
  onSelectDataset: (type: DatasetType) => void;
  baseCount: number;
  stressCount: number;
  customCount?: number;
  customFileName?: string | null;
  connectedCount?: number;
  connectedAccount?: ConnectedAccount | null;
  onOpenConnectModal: () => void;
  onDisconnectInbox: () => void;
  onUploadFile: (file: File) => void;
  onClearCustom: () => void;
  settings: EngineSettings;
  onOpenSettings: () => void;
  onResetData: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentDataset,
  onSelectDataset,
  baseCount,
  stressCount,
  customCount = 0,
  customFileName,
  connectedCount = 0,
  connectedAccount,
  onOpenConnectModal,
  onDisconnectInbox,
  onUploadFile,
  onClearCustom,
  settings,
  onOpenSettings,
  onResetData,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const accountMenuRef = useRef<HTMLDivElement>(null);
  const [showAccountMenu, setShowAccountMenu] = useState(false);

  // Click outside to close account menu
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        accountMenuRef.current &&
        !accountMenuRef.current.contains(event.target as Node)
      ) {
        setShowAccountMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onUploadFile(file);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      onUploadFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-slate-900/95 backdrop-blur-md border-b border-slate-800 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand / Title */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Inbox className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-base font-bold tracking-tight text-white leading-tight">
              Candidate Inbox Helper
            </h1>
          </div>
        </div>

        {/* Dataset Switcher & Upload Controls in Center */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-slate-800/80 p-1 rounded-xl border border-slate-700/60 shadow-inner">
            {/* Connected Mailbox Pill (if connected) */}
            {connectedAccount && (
              <button
                onClick={() => onSelectDataset('connected')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  currentDataset === 'connected'
                    ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-500/30'
                    : 'text-emerald-300 hover:text-white hover:bg-emerald-950/50'
                }`}
                title={`Synced from ${connectedAccount.email}`}
              >
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Synced</span>
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                    currentDataset === 'connected'
                      ? 'bg-emerald-700 text-white'
                      : 'bg-emerald-900 text-emerald-200'
                  }`}
                >
                  {connectedCount}
                </span>
              </button>
            )}

            {/* Base Inbox Button */}
            <button
              onClick={() => onSelectDataset('base')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                currentDataset === 'base'
                  ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-500/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <span>Base</span>
              <span
                className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                  currentDataset === 'base'
                    ? 'bg-indigo-700 text-white'
                    : 'bg-slate-700 text-slate-300'
                }`}
              >
                {baseCount}
              </span>
            </button>

            {/* Stress Inbox Button */}
            <button
              onClick={() => onSelectDataset('stress')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                currentDataset === 'stress'
                  ? 'bg-rose-600 text-white shadow-sm shadow-rose-500/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5 text-amber-300" />
              <span>Stress</span>
              <span
                className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                  currentDataset === 'stress'
                    ? 'bg-rose-700 text-white'
                    : 'bg-slate-700 text-slate-300'
                }`}
              >
                {stressCount}
              </span>
            </button>

            {/* Custom File Pill (if loaded) */}
            {customFileName && (
              <div
                className={`flex items-center gap-1.5 pl-2.5 pr-1 py-1 rounded-lg text-xs font-semibold transition-all ${
                  currentDataset === 'custom'
                    ? 'bg-violet-600 text-white shadow-sm shadow-violet-500/30'
                    : 'text-violet-300 bg-violet-950/40 hover:bg-violet-900/40'
                }`}
              >
                <button
                  onClick={() => onSelectDataset('custom')}
                  className="flex items-center gap-1.5 focus:outline-none"
                  title={`Active custom dataset: ${customFileName}`}
                >
                  <FileText className="w-3.5 h-3.5 text-violet-300 shrink-0" />
                  <span className="max-w-[90px] truncate" title={customFileName}>
                    {customFileName}
                  </span>
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                      currentDataset === 'custom'
                        ? 'bg-violet-700 text-white'
                        : 'bg-violet-900 text-violet-200'
                    }`}
                  >
                    {customCount}
                  </span>
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onClearCustom();
                  }}
                  className="p-1 rounded-md text-violet-300 hover:text-white hover:bg-violet-800/80 transition-colors"
                  title="Remove custom dataset & return to defaults"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>

          {/* Upload JSON Button */}
          <div>
            <input
              type="file"
              ref={fileInputRef}
              accept=".json,application/json"
              onChange={handleFileChange}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 hover:text-white border border-slate-700 transition-all shadow-sm"
              title="Upload custom candidate JSON dataset"
            >
              <Upload className="w-3.5 h-3.5 text-indigo-400" />
              <span className="hidden sm:inline">Upload JSON</span>
            </button>
          </div>
        </div>

        {/* Action Controls & Authentication Status */}
        <div className="flex items-center gap-2.5 shrink-0">
          {/* Connect Inbox / Account Avatar Button */}
          {connectedAccount ? (
            <div className="relative" ref={accountMenuRef}>
              <button
                onClick={() => setShowAccountMenu(!showAccountMenu)}
                className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-950/60 text-emerald-200 border border-emerald-500/40 hover:bg-emerald-900/60 transition-all shadow-sm"
                title={`Connected mailbox: ${connectedAccount.email}`}
              >
                <div className="w-5 h-5 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center font-bold text-[10px] shadow-xs">
                  {connectedAccount.email.charAt(0).toUpperCase()}
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="max-w-[140px] truncate hidden md:inline">
                    {connectedAccount.email}
                  </span>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-emerald-400" />
              </button>

              {/* Account Dropdown Menu */}
              {showAccountMenu && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-slate-200 text-slate-800 p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="p-2.5 border-b border-slate-100">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Connected Mailbox
                    </p>
                    <p className="text-xs font-bold text-slate-900 truncate mt-0.5">
                      {connectedAccount.email}
                    </p>
                    <p className="text-[11px] text-emerald-600 flex items-center gap-1 mt-1 font-semibold">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      {connectedAccount.provider.toUpperCase()} Synced
                    </p>
                  </div>
                  <div className="p-1 space-y-1">
                    <button
                      onClick={() => {
                        onSelectDataset('connected');
                        setShowAccountMenu(false);
                      }}
                      className="w-full flex items-center gap-2 px-2.5 py-2 text-xs rounded-lg hover:bg-slate-100 font-medium text-slate-700 transition-colors text-left"
                    >
                      <Inbox className="w-4 h-4 text-indigo-600" />
                      <span>View Synced Emails ({connectedCount})</span>
                    </button>
                    <button
                      onClick={() => {
                        onDisconnectInbox();
                        setShowAccountMenu(false);
                      }}
                      className="w-full flex items-center gap-2 px-2.5 py-2 text-xs rounded-lg hover:bg-rose-50 font-semibold text-rose-600 transition-colors text-left"
                    >
                      <LogOut className="w-4 h-4 text-rose-600" />
                      <span>Disconnect / Log Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={onOpenConnectModal}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 shadow-md shadow-indigo-600/30 transition-all border border-indigo-500/50"
              title="Connect real recruitment email inbox (Gmail, Outlook, IMAP)"
            >
              <Mail className="w-3.5 h-3.5 text-white" />
              <span>Connect Inbox</span>
            </button>
          )}

          {/* Active Engine Pill */}
          <button
            onClick={onOpenSettings}
            className={`hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border transition-colors ${
              settings.useLiveApi && settings.apiKey
                ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/20'
                : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-750'
            }`}
            title="Click to configure AI Engine settings"
          >
            {settings.useLiveApi && settings.apiKey ? (
              <>
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                <span>Live Gemini ({settings.model})</span>
              </>
            ) : (
              <>
                <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
                <span>Deterministic Heuristic</span>
              </>
            )}
          </button>

          {/* Settings Button */}
          <button
            onClick={onOpenSettings}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors relative"
            title="Engine Settings & API Key"
          >
            <Settings className="w-4 h-4" />
            {settings.useLiveApi && settings.apiKey && (
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            )}
          </button>

          {/* Reset Button */}
          <button
            onClick={onResetData}
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-rose-950/40 text-slate-400 hover:text-rose-400 border border-slate-700/60 hover:border-rose-800/40 transition-colors"
            title="Reset dataset to defaults"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
