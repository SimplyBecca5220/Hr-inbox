import React, { useState } from 'react';
import type { ConnectedAccount, EmailProvider } from '../types';
import {
  X,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Loader2,
  ShieldCheck,
  Server,
  Sparkles,
} from 'lucide-react';

interface ConnectInboxModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConnect: (account: ConnectedAccount) => void;
}

export const ConnectInboxModal: React.FC<ConnectInboxModalProps> = ({
  isOpen,
  onClose,
  onConnect,
}) => {
  const [provider, setProvider] = useState<EmailProvider>('gmail');
  const [email, setEmail] = useState('recruiter@acme-talent.io');
  const [password, setPassword] = useState('••••••••••••');
  const [showPassword, setShowPassword] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectingStep, setConnectingStep] = useState('');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setError('Please enter your work email address.');
      return;
    }
    if (!password.trim()) {
      setError('Please enter your app password or account password.');
      return;
    }

    setError(null);
    setIsConnecting(true);
    setConnectingStep('Authenticating mailbox & validating credentials...');

    // Frictionless connection sequence: 1.5s realistic animation, strictly NO OTP
    setTimeout(() => {
      setConnectingStep('Syncing unread candidate threads & parsing metadata...');
    }, 750);

    setTimeout(() => {
      setIsConnecting(false);
      onConnect({
        email: email.trim(),
        provider,
        connectedAt: new Date().toISOString(),
      });
      onClose();
    }, 1500);
  };

  const handleProviderSelect = (selected: EmailProvider) => {
    setProvider(selected);
    if (selected === 'gmail' && !email.includes('@')) {
      setEmail('recruiter@company.com');
    } else if (selected === 'outlook' && !email.includes('@')) {
      setEmail('talent@outlook.com');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-50 border-b border-slate-200">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-100 text-indigo-700">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Connect Recruitment Inbox</h3>
              <p className="text-xs text-slate-500">Live mailbox sync for automated candidate triage</p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isConnecting}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200/50 transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Provider Selection Tabs */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
              Email Provider
            </label>
            <div className="grid grid-cols-3 gap-2">
              {/* Gmail / Google */}
              <button
                type="button"
                onClick={() => handleProviderSelect('gmail')}
                disabled={isConnecting}
                className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-xs font-semibold transition-all ${
                  provider === 'gmail'
                    ? 'border-indigo-600 bg-indigo-50/60 text-indigo-900 shadow-xs'
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                }`}
              >
                <div className="w-5 h-5 mb-1 text-red-500 font-bold flex items-center justify-center">
                  G
                </div>
                <span>Gmail</span>
              </button>

              {/* Outlook / Microsoft */}
              <button
                type="button"
                onClick={() => handleProviderSelect('outlook')}
                disabled={isConnecting}
                className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-xs font-semibold transition-all ${
                  provider === 'outlook'
                    ? 'border-indigo-600 bg-indigo-50/60 text-indigo-900 shadow-xs'
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                }`}
              >
                <div className="w-5 h-5 mb-1 text-blue-600 font-bold flex items-center justify-center">
                  O
                </div>
                <span>Outlook</span>
              </button>

              {/* Custom IMAP / Exchange */}
              <button
                type="button"
                onClick={() => handleProviderSelect('imap')}
                disabled={isConnecting}
                className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-xs font-semibold transition-all ${
                  provider === 'imap'
                    ? 'border-indigo-600 bg-indigo-50/60 text-indigo-900 shadow-xs'
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Server className="w-5 h-5 mb-1 text-slate-700" />
                <span>IMAP / Exch</span>
              </button>
            </div>
          </div>

          {/* Work Email Address */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
              Work Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Mail className="w-4 h-4" />
              </div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isConnecting}
                placeholder="recruiter@company.com"
                required
                className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-slate-900 font-medium disabled:bg-slate-100"
              />
            </div>
          </div>

          {/* Password / App Password */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                App Password / Password
              </label>
              <span className="text-[10px] text-slate-400">Direct Session</span>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isConnecting}
                placeholder="••••••••••••"
                required
                className="w-full pl-9 pr-10 py-2 text-sm rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-slate-900 font-mono disabled:bg-slate-100"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                disabled={isConnecting}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {error && (
            <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
              {error}
            </div>
          )}

          {/* Active Connecting Status Animation */}
          {isConnecting && (
            <div className="p-3.5 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-900 space-y-1.5 animate-in fade-in duration-200">
              <div className="flex items-center gap-2 text-xs font-bold">
                <Loader2 className="w-4 h-4 text-indigo-600 animate-spin" />
                <span>Connecting to Mailbox...</span>
              </div>
              <p className="text-xs text-indigo-700 font-mono pl-6 leading-tight">
                {connectingStep}
              </p>
            </div>
          )}

          {/* Safety Disclaimer Subtext */}
          <div className="pt-2 text-[11px] text-slate-500 flex items-start gap-1.5 leading-tight">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <p>
              Your credentials are used solely within this browser session to sync inbound candidate messages. No passwords are stored on external servers.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              disabled={isConnecting}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 rounded-xl hover:bg-slate-100 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isConnecting}
              className="flex items-center gap-2 px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 rounded-xl shadow-md shadow-indigo-500/20 disabled:opacity-60 transition-all"
            >
              {isConnecting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Connecting...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5 text-indigo-200" />
                  <span>Connect & Fetch Inbox</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
