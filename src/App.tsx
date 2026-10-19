import { useState, useEffect, useMemo, useCallback } from 'react';
import baseInboxData from './data/base_inbox.json';
import stressInboxData from './data/stress_inbox.json';
import type {
  CandidateMessageAnalysis,
  ConnectedAccount,
  DatasetType,
  EngineSettings,
  Intent,
  RawCandidateMessage,
  ReviewStatus,
  ToastMessage,
} from './types';
import { ProcessingEngine } from './services/engine';
import { StorageService } from './services/storage';
import { FileParserService } from './services/fileParser';
import { generateConnectedInboxMessages } from './data/connectedInboxTemplate';
import { Navbar } from './components/Navbar';
import { MetricsBar } from './components/MetricsBar';
import { FilterBar } from './components/FilterBar';
import { ProgressBar } from './components/ProgressBar';
import { MessageCard } from './components/MessageCard';
import { SettingsModal } from './components/SettingsModal';
import { ConnectInboxModal } from './components/ConnectInboxModal';
import { ToastContainer } from './components/ToastContainer';
import { Inbox } from 'lucide-react';

export default function App() {
  // 1. Settings state
  const [settings, setSettings] = useState<EngineSettings>(() =>
    StorageService.getSettings()
  );

  // 2. Connected Mailbox Account state
  const [connectedAccount, setConnectedAccount] = useState<ConnectedAccount | null>(() =>
    StorageService.getConnectedAccount()
  );
  const [connectedRawMessages, setConnectedRawMessages] = useState<RawCandidateMessage[]>(() =>
    StorageService.getConnectedRaw() || []
  );

  // 3. Custom dataset states
  const [customFileName, setCustomFileName] = useState<string | null>(() =>
    StorageService.getCustomFileName()
  );
  const [customRawMessages, setCustomRawMessages] = useState<RawCandidateMessage[]>(() =>
    StorageService.getCustomRaw() || []
  );

  // 4. Active dataset type
  const [currentDataset, setCurrentDataset] = useState<DatasetType>(() => {
    const saved = StorageService.getDatasetType();
    if (saved === 'custom' && !StorageService.getCustomFileName()) {
      return 'base';
    }
    if (saved === 'connected' && !StorageService.getConnectedAccount()) {
      return 'base';
    }
    return saved;
  });

  // 5. Messages state
  const [messages, setMessages] = useState<CandidateMessageAnalysis[]>([]);

  // 6. Processing states
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState<{
    current: number;
    total: number;
    currentItem?: RawCandidateMessage | null;
  }>({ current: 0, total: 0 });

  // 7. Filter & Search states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIntent, setSelectedIntent] = useState<Intent | 'ALL'>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<ReviewStatus | 'ALL'>('ALL');

  // 8. Modals & Toasts
  const [isConnectModalOpen, setIsConnectModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = useCallback(
    (title: string, description?: string, type: ToastMessage['type'] = 'success') => {
      const id = `${Date.now()}-${Math.random()}`;
      setToasts((prev) => [...prev, { id, title, description, type }]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 4500);
    },
    []
  );

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Get raw messages for current dataset
  const getRawMessages = useCallback(
    (type: DatasetType): RawCandidateMessage[] => {
      if (type === 'connected') {
        return connectedRawMessages;
      }
      if (type === 'custom') {
        return customRawMessages;
      }
      return type === 'base'
        ? (baseInboxData as RawCandidateMessage[])
        : (stressInboxData as RawCandidateMessage[]);
    },
    [connectedRawMessages, customRawMessages]
  );

  // Hydrate messages on load or dataset change
  useEffect(() => {
    const stored = StorageService.getStoredMessages(currentDataset);
    if (stored && stored.length > 0) {
      setMessages(stored);
    } else {
      const raw = getRawMessages(currentDataset);
      if (raw.length === 0) {
        if (currentDataset === 'custom' || currentDataset === 'connected') {
          setCurrentDataset('base');
          StorageService.setDatasetType('base');
          return;
        }
      }

      let isMounted = true;
      (async () => {
        const batch = await ProcessingEngine.processBatch(raw, settings);
        if (isMounted) {
          setMessages(batch);
          StorageService.saveMessages(currentDataset, batch);
        }
      })();

      return () => {
        isMounted = false;
      };
    }
  }, [currentDataset, getRawMessages, settings]);

  // Handle switching datasets
  const handleSelectDataset = async (type: DatasetType) => {
    if (type === currentDataset) return;
    setCurrentDataset(type);
    StorageService.setDatasetType(type);

    const stored = StorageService.getStoredMessages(type);
    if (stored && stored.length > 0) {
      setMessages(stored);
    } else {
      const raw = getRawMessages(type);
      const batch = await ProcessingEngine.processBatch(raw, settings);
      setMessages(batch);
      StorageService.saveMessages(type, batch);
    }

    const label =
      type === 'base'
        ? 'Base Inbox'
        : type === 'stress'
        ? 'Stress Inbox'
        : type === 'connected'
        ? `Synced Mailbox (${connectedAccount?.email || ''})`
        : customFileName || 'Custom Dataset';
    const count =
      type === 'base'
        ? baseInboxData.length
        : type === 'stress'
        ? stressInboxData.length
        : type === 'connected'
        ? connectedRawMessages.length
        : customRawMessages.length;

    addToast(`Switched to ${label}`, `Loaded ${count} candidate messages.`, 'info');
  };

  // Connect Inbox Authentication Workflow
  const handleConnectInbox = async (account: ConnectedAccount) => {
    setConnectedAccount(account);
    StorageService.setConnectedAccount(account);

    // Generate realistic unread emails tailored to this recruiter's mailbox
    const rawSynced = generateConnectedInboxMessages(account);
    setConnectedRawMessages(rawSynced);
    StorageService.setConnectedRaw(rawSynced);

    // Switch to connected inbox dataset
    setCurrentDataset('connected');
    StorageService.setDatasetType('connected');

    // Automatically trigger AI triage on synced emails
    setIsProcessing(true);
    setProgress({ current: 0, total: rawSynced.length, currentItem: null });

    try {
      const batch = await ProcessingEngine.processBatch(
        rawSynced,
        settings,
        (current, total, item) => {
          setProgress({ current, total, currentItem: item });
        }
      );
      setMessages(batch);
      StorageService.saveMessages('connected', batch);
      addToast(
        'Inbox Connected & Synced',
        `Successfully synced ${rawSynced.length} new candidate emails from ${account.email}.`,
        'success'
      );
    } catch (err) {
      console.error(err);
      addToast('Sync Error', 'Failed to complete triage on synced emails.', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  // Disconnect Mailbox Workflow
  const handleDisconnectInbox = () => {
    StorageService.clearConnectedAccount();
    setConnectedAccount(null);
    setConnectedRawMessages([]);

    // Revert to Base Inbox preset
    setCurrentDataset('base');
    StorageService.setDatasetType('base');

    const storedBase = StorageService.getStoredMessages('base');
    if (storedBase && storedBase.length > 0) {
      setMessages(storedBase);
    } else {
      const rawBase = baseInboxData as RawCandidateMessage[];
      ProcessingEngine.processBatch(rawBase, settings).then((batch) => {
        setMessages(batch);
        StorageService.saveMessages('base', batch);
      });
    }

    addToast('Mailbox Disconnected', 'Logged out and returned to Base Inbox preset.', 'info');
  };

  // Upload Custom JSON Dataset Workflow
  const handleUploadFile = async (file: File) => {
    const result = await FileParserService.parseCandidateJsonFile(file);
    if (!result.success || !result.data) {
      addToast('File Parsing Error', result.error || 'Failed to parse JSON file.', 'error');
      return;
    }

    const validRaw = result.data;
    setCustomFileName(result.fileName);
    setCustomRawMessages(validRaw);
    StorageService.setCustomFileName(result.fileName);
    StorageService.setCustomRaw(validRaw);

    // Switch to custom dataset immediately
    setCurrentDataset('custom');
    StorageService.setDatasetType('custom');

    // Automatically trigger AI triage on uploaded custom dataset
    setIsProcessing(true);
    setProgress({ current: 0, total: validRaw.length, currentItem: null });

    try {
      const batch = await ProcessingEngine.processBatch(
        validRaw,
        settings,
        (current, total, item) => {
          setProgress({ current, total, currentItem: item });
        }
      );
      setMessages(batch);
      StorageService.saveMessages('custom', batch);
      addToast(
        'Custom Dataset Triaged',
        `Loaded ${validRaw.length} candidate messages from "${result.fileName}".${
          result.skippedCount ? ` (${result.skippedCount} incomplete entries skipped)` : ''
        }`,
        'success'
      );
    } catch (err) {
      console.error(err);
      addToast('Triage Error', 'Failed to complete triage on uploaded file.', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  // Clear Custom Dataset and return to defaults
  const handleClearCustom = () => {
    StorageService.clearCustomDataset();
    setCustomFileName(null);
    setCustomRawMessages([]);

    // Switch to Base Inbox
    setCurrentDataset('base');
    StorageService.setDatasetType('base');

    const storedBase = StorageService.getStoredMessages('base');
    if (storedBase && storedBase.length > 0) {
      setMessages(storedBase);
    } else {
      const rawBase = baseInboxData as RawCandidateMessage[];
      ProcessingEngine.processBatch(rawBase, settings).then((batch) => {
        setMessages(batch);
        StorageService.saveMessages('base', batch);
      });
    }

    addToast('Custom Dataset Cleared', 'Switched back to Base Inbox preset.', 'info');
  };

  // Full process inbox triage workflow with animated progress
  const handleProcessInbox = async () => {
    if (isProcessing) return;
    setIsProcessing(true);
    const raw = getRawMessages(currentDataset);
    setProgress({ current: 0, total: raw.length, currentItem: null });

    try {
      const results = await ProcessingEngine.processBatch(
        raw,
        settings,
        (current, total, item) => {
          setProgress({ current, total, currentItem: item });
        }
      );

      // Preserve existing manual approval/rejection review statuses if already reviewed
      const merged = results.map((newAnalysis) => {
        const existing = messages.find((m) => m.id === newAnalysis.id);
        if (existing && existing.review_status !== 'PENDING') {
          return {
            ...newAnalysis,
            review_status: existing.review_status,
            edited_draft: existing.edited_draft,
          };
        }
        return newAnalysis;
      });

      setMessages(merged);
      StorageService.saveMessages(currentDataset, merged);
      addToast(
        'Inbox Triage Complete',
        `Successfully triaged ${results.length} candidate communications.`,
        'success'
      );
    } catch (err) {
      console.error(err);
      addToast('Triage Error', 'Failed to complete inbox processing.', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  // Action: Approve & Send
  const handleApprove = (id: string, effectiveDraft: string) => {
    setMessages((prev) => {
      const updated = prev.map((m) => {
        if (m.id === id) {
          const isEdited = effectiveDraft.trim() !== m.proposed_draft.trim();
          return {
            ...m,
            review_status: (isEdited ? 'EDITED' : 'APPROVED') as ReviewStatus,
            edited_draft: isEdited ? effectiveDraft : undefined,
            reviewed_at: new Date().toISOString(),
          };
        }
        return m;
      });
      StorageService.saveMessages(currentDataset, updated);
      return updated;
    });

    const target = messages.find((m) => m.id === id);
    const isEdited = target && effectiveDraft.trim() !== target.proposed_draft.trim();
    addToast(
      isEdited ? 'Approved with Edits' : 'Draft Approved & Queued',
      `Response for ${target?.sender_name || 'candidate'} authorized.`,
      'success'
    );
  };

  // Action: Reject
  const handleReject = (id: string) => {
    setMessages((prev) => {
      const updated = prev.map((m) => {
        if (m.id === id) {
          return {
            ...m,
            review_status: 'REJECTED' as ReviewStatus,
            reviewed_at: new Date().toISOString(),
          };
        }
        return m;
      });
      StorageService.saveMessages(currentDataset, updated);
      return updated;
    });

    const target = messages.find((m) => m.id === id);
    addToast('Draft Rejected', `Dismissed draft for ${target?.sender_name || 'candidate'}.`, 'info');
  };

  // Action: Flag Manual Review
  const handleFlagManual = (id: string) => {
    setMessages((prev) => {
      const updated = prev.map((m) => {
        if (m.id === id) {
          return {
            ...m,
            detected_intent: 'REQUIRES_MANUAL_REVIEW' as Intent,
            review_status: 'FLAGGED_MANUAL' as ReviewStatus,
            reviewed_at: new Date().toISOString(),
          };
        }
        return m;
      });
      StorageService.saveMessages(currentDataset, updated);
      return updated;
    });

    const target = messages.find((m) => m.id === id);
    addToast(
      'Flagged for Recruiter Review',
      `Escalated ${target?.sender_name || 'candidate'} to Senior Talent Partner desk.`,
      'warning'
    );
  };

  // Action: Inline draft modification
  const handleDraftChange = (id: string, newDraft: string) => {
    setMessages((prev) => {
      const updated = prev.map((m) => {
        if (m.id === id) {
          return {
            ...m,
            edited_draft: newDraft,
          };
        }
        return m;
      });
      StorageService.saveMessages(currentDataset, updated);
      return updated;
    });
  };

  // Action: Batch approve all clean high-confidence messages
  const handleBatchApproveClean = () => {
    let count = 0;
    setMessages((prev) => {
      const updated = prev.map((m) => {
        if (
          m.review_status === 'PENDING' &&
          m.confidence_score >= 0.85 &&
          (!m.guardrail_flags || m.guardrail_flags.length === 0) &&
          m.detected_intent !== 'REQUIRES_MANUAL_REVIEW'
        ) {
          count++;
          return {
            ...m,
            review_status: 'APPROVED' as ReviewStatus,
            reviewed_at: new Date().toISOString(),
          };
        }
        return m;
      });
      StorageService.saveMessages(currentDataset, updated);
      return updated;
    });

    if (count > 0) {
      addToast(
        'Batch Approval Complete',
        `Approved ${count} clean, high-confidence candidate drafts.`,
        'success'
      );
    } else {
      addToast(
        'No Eligible Messages',
        'No pending messages meet automatic high-confidence criteria.',
        'info'
      );
    }
  };

  // Action: Export JSON
  const handleExportJson = () => {
    const dataStr =
      'data:text/json;charset=utf-8,' +
      encodeURIComponent(JSON.stringify(messages, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute(
      'download',
      `candidate_inbox_${currentDataset}_${new Date().toISOString().slice(0, 10)}.json`
    );
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    addToast('Dataset Exported', 'Downloaded candidate review decisions as JSON.', 'success');
  };

  // Action: Reset Data
  const handleResetData = async () => {
    const datasetLabel =
      currentDataset === 'base'
        ? 'Base Inbox'
        : currentDataset === 'stress'
        ? 'Stress Inbox'
        : currentDataset === 'connected'
        ? `Synced Mailbox (${connectedAccount?.email})`
        : customFileName || 'Custom Dataset';

    if (
      window.confirm(
        `Are you sure you want to reset "${datasetLabel}"? All approved statuses and customized drafts will return to default state.`
      )
    ) {
      StorageService.clearDataset(currentDataset);
      const raw = getRawMessages(currentDataset);
      const batch = await ProcessingEngine.processBatch(raw, settings);
      setMessages(batch);
      StorageService.saveMessages(currentDataset, batch);
      addToast('Data Reset', `Restored ${datasetLabel} to clean state.`, 'info');
    }
  };

  // Save Settings
  const handleSaveSettings = (newSettings: EngineSettings) => {
    setSettings(newSettings);
    StorageService.saveSettings(newSettings);
    addToast(
      'Settings Updated',
      newSettings.useLiveApi
        ? `Live Gemini Mode active (${newSettings.model}).`
        : 'Deterministic Heuristic Mode active.',
      'success'
    );
  };

  // Filter & Search computation
  const filteredMessages = useMemo(() => {
    return messages.filter((m) => {
      // 1. Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = m.sender_name.toLowerCase().includes(q);
        const matchesEmail = m.sender_email.toLowerCase().includes(q);
        const matchesRole = m.applied_role.toLowerCase().includes(q);
        const matchesSubject = m.subject.toLowerCase().includes(q);
        const matchesText = m.original_text.toLowerCase().includes(q);
        const matchesReasoning = m.reasoning.toLowerCase().includes(q);
        if (
          !matchesName &&
          !matchesEmail &&
          !matchesRole &&
          !matchesSubject &&
          !matchesText &&
          !matchesReasoning
        ) {
          return false;
        }
      }

      // 2. Intent filter
      if (selectedIntent !== 'ALL' && m.detected_intent !== selectedIntent) {
        return false;
      }

      // 3. Status filter
      if (selectedStatus !== 'ALL' && m.review_status !== selectedStatus) {
        return false;
      }

      return true;
    });
  }, [messages, searchQuery, selectedIntent, selectedStatus]);

  // Compute category counts for pills
  const intentCounts = useMemo(() => {
    const counts: Record<string, number> = { ALL: messages.length };
    messages.forEach((m) => {
      counts[m.detected_intent] = (counts[m.detected_intent] || 0) + 1;
    });
    return counts;
  }, [messages]);

  // Compute status counts for tabs
  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = { ALL: messages.length };
    messages.forEach((m) => {
      counts[m.review_status] = (counts[m.review_status] || 0) + 1;
    });
    return counts;
  }, [messages]);

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-900 font-sans antialiased flex flex-col selection:bg-indigo-500 selection:text-white">
      {/* Top Navigation */}
      <Navbar
        currentDataset={currentDataset}
        onSelectDataset={handleSelectDataset}
        baseCount={baseInboxData.length}
        stressCount={stressInboxData.length}
        customCount={customRawMessages.length}
        customFileName={customFileName}
        connectedCount={connectedRawMessages.length}
        connectedAccount={connectedAccount}
        onOpenConnectModal={() => setIsConnectModalOpen(true)}
        onDisconnectInbox={handleDisconnectInbox}
        onUploadFile={handleUploadFile}
        onClearCustom={handleClearCustom}
        settings={settings}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onResetData={handleResetData}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Dynamic Metrics Counters */}
        <MetricsBar messages={messages} />

        {/* Animated Processing Indicator */}
        <ProgressBar
          isProcessing={isProcessing}
          current={progress.current}
          total={progress.total}
          currentItem={progress.currentItem}
        />

        {/* Filter Bar & Controls */}
        <FilterBar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          selectedIntent={selectedIntent}
          onSelectIntent={setSelectedIntent}
          selectedStatus={selectedStatus}
          onSelectStatus={setSelectedStatus}
          intentCounts={intentCounts}
          statusCounts={statusCounts}
          onProcessInbox={handleProcessInbox}
          isProcessing={isProcessing}
          onBatchApproveClean={handleBatchApproveClean}
          onExportJson={handleExportJson}
        />

        {/* Message Cards List */}
        <div className="space-y-4">
          {filteredMessages.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3 shadow-sm">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
                <Inbox className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-800">
                No matching candidate communications
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                No messages match your active filters or search keyword. Try clearing your search query or selecting "All Categories".
              </p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedIntent('ALL');
                  setSelectedStatus('ALL');
                }}
                className="px-4 py-2 text-xs font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-xl transition-colors"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            filteredMessages.map((msg) => (
              <MessageCard
                key={msg.id}
                message={msg}
                onApprove={handleApprove}
                onReject={handleReject}
                onFlagManual={handleFlagManual}
                onDraftChange={handleDraftChange}
              />
            ))
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200 bg-white py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between text-xs text-slate-500">
          <p className="font-medium text-slate-600">Candidate Inbox Helper</p>
          <p className="text-slate-400">Human-in-the-Loop Review Platform</p>
        </div>
      </footer>

      {/* Connect Inbox Modal */}
      <ConnectInboxModal
        isOpen={isConnectModalOpen}
        onClose={() => setIsConnectModalOpen(false)}
        onConnect={handleConnectInbox}
      />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onSave={handleSaveSettings}
      />

      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
