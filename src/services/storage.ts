import type {
  CandidateMessageAnalysis,
  ConnectedAccount,
  DatasetType,
  EngineSettings,
  RawCandidateMessage,
} from '../types';

const STORAGE_KEYS = {
  CURRENT_DATASET: 'hr_inbox_current_dataset',
  DATASET_BASE: 'hr_inbox_dataset_base_v2',
  DATASET_STRESS: 'hr_inbox_dataset_stress_v2',
  DATASET_CUSTOM: 'hr_inbox_dataset_custom_v2',
  DATASET_CONNECTED: 'hr_inbox_dataset_connected_v2',
  CUSTOM_RAW: 'hr_inbox_custom_raw_v2',
  CUSTOM_FILE_NAME: 'hr_inbox_custom_file_name_v2',
  CONNECTED_ACCOUNT: 'hr_inbox_connected_account_v2',
  CONNECTED_RAW: 'hr_inbox_connected_raw_v2',
  SETTINGS: 'hr_inbox_settings_v2',
};

export const DEFAULT_SETTINGS: EngineSettings = {
  apiKey: '',
  model: 'gemini-2.5-flash',
  useLiveApi: false,
};

export class StorageService {
  public static getDatasetType(): DatasetType {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CURRENT_DATASET);
      if (
        saved === 'base' ||
        saved === 'stress' ||
        saved === 'custom' ||
        saved === 'connected'
      ) {
        return saved;
      }
    } catch {
      // ignore
    }
    return 'base';
  }

  public static setDatasetType(type: DatasetType): void {
    try {
      localStorage.setItem(STORAGE_KEYS.CURRENT_DATASET, type);
    } catch {
      // ignore
    }
  }

  private static getKeyForDataset(type: DatasetType): string {
    switch (type) {
      case 'stress':
        return STORAGE_KEYS.DATASET_STRESS;
      case 'custom':
        return STORAGE_KEYS.DATASET_CUSTOM;
      case 'connected':
        return STORAGE_KEYS.DATASET_CONNECTED;
      case 'base':
      default:
        return STORAGE_KEYS.DATASET_BASE;
    }
  }

  public static getStoredMessages(type: DatasetType): CandidateMessageAnalysis[] | null {
    try {
      const key = this.getKeyForDataset(type);
      const raw = localStorage.getItem(key);
      if (raw) {
        return JSON.parse(raw);
      }
    } catch (err) {
      console.warn('Failed to read messages from localStorage:', err);
    }
    return null;
  }

  public static saveMessages(type: DatasetType, messages: CandidateMessageAnalysis[]): void {
    try {
      const key = this.getKeyForDataset(type);
      localStorage.setItem(key, JSON.stringify(messages));
    } catch (err) {
      console.warn('Failed to save messages to localStorage:', err);
    }
  }

  public static getCustomRaw(): RawCandidateMessage[] | null {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.CUSTOM_RAW);
      if (raw) {
        return JSON.parse(raw);
      }
    } catch (err) {
      console.warn('Failed to read custom raw messages from localStorage:', err);
    }
    return null;
  }

  public static setCustomRaw(messages: RawCandidateMessage[] | null): void {
    try {
      if (messages) {
        localStorage.setItem(STORAGE_KEYS.CUSTOM_RAW, JSON.stringify(messages));
      } else {
        localStorage.removeItem(STORAGE_KEYS.CUSTOM_RAW);
      }
    } catch (err) {
      console.warn('Failed to save custom raw messages to localStorage:', err);
    }
  }

  public static getCustomFileName(): string | null {
    try {
      return localStorage.getItem(STORAGE_KEYS.CUSTOM_FILE_NAME);
    } catch {
      return null;
    }
  }

  public static setCustomFileName(fileName: string | null): void {
    try {
      if (fileName) {
        localStorage.setItem(STORAGE_KEYS.CUSTOM_FILE_NAME, fileName);
      } else {
        localStorage.removeItem(STORAGE_KEYS.CUSTOM_FILE_NAME);
      }
    } catch {
      // ignore
    }
  }

  public static clearCustomDataset(): void {
    try {
      localStorage.removeItem(STORAGE_KEYS.DATASET_CUSTOM);
      localStorage.removeItem(STORAGE_KEYS.CUSTOM_RAW);
      localStorage.removeItem(STORAGE_KEYS.CUSTOM_FILE_NAME);
    } catch (err) {
      console.warn('Failed to clear custom dataset:', err);
    }
  }

  public static getConnectedAccount(): ConnectedAccount | null {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.CONNECTED_ACCOUNT);
      if (raw) {
        return JSON.parse(raw);
      }
    } catch (err) {
      console.warn('Failed to read connected account:', err);
    }
    return null;
  }

  public static setConnectedAccount(account: ConnectedAccount | null): void {
    try {
      if (account) {
        localStorage.setItem(STORAGE_KEYS.CONNECTED_ACCOUNT, JSON.stringify(account));
      } else {
        localStorage.removeItem(STORAGE_KEYS.CONNECTED_ACCOUNT);
      }
    } catch (err) {
      console.warn('Failed to save connected account:', err);
    }
  }

  public static getConnectedRaw(): RawCandidateMessage[] | null {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.CONNECTED_RAW);
      if (raw) {
        return JSON.parse(raw);
      }
    } catch (err) {
      console.warn('Failed to read connected raw messages:', err);
    }
    return null;
  }

  public static setConnectedRaw(messages: RawCandidateMessage[] | null): void {
    try {
      if (messages) {
        localStorage.setItem(STORAGE_KEYS.CONNECTED_RAW, JSON.stringify(messages));
      } else {
        localStorage.removeItem(STORAGE_KEYS.CONNECTED_RAW);
      }
    } catch (err) {
      console.warn('Failed to save connected raw messages:', err);
    }
  }

  public static clearConnectedAccount(): void {
    try {
      localStorage.removeItem(STORAGE_KEYS.CONNECTED_ACCOUNT);
      localStorage.removeItem(STORAGE_KEYS.CONNECTED_RAW);
      localStorage.removeItem(STORAGE_KEYS.DATASET_CONNECTED);
    } catch (err) {
      console.warn('Failed to clear connected account:', err);
    }
  }

  public static clearDataset(type: DatasetType): void {
    try {
      const key = this.getKeyForDataset(type);
      localStorage.removeItem(key);
      if (type === 'custom') {
        this.clearCustomDataset();
      } else if (type === 'connected') {
        this.clearConnectedAccount();
      }
    } catch (err) {
      console.warn('Failed to clear dataset from localStorage:', err);
    }
  }

  public static resetAll(): void {
    try {
      localStorage.removeItem(STORAGE_KEYS.DATASET_BASE);
      localStorage.removeItem(STORAGE_KEYS.DATASET_STRESS);
      localStorage.removeItem(STORAGE_KEYS.DATASET_CUSTOM);
      localStorage.removeItem(STORAGE_KEYS.DATASET_CONNECTED);
      localStorage.removeItem(STORAGE_KEYS.CUSTOM_RAW);
      localStorage.removeItem(STORAGE_KEYS.CUSTOM_FILE_NAME);
      localStorage.removeItem(STORAGE_KEYS.CONNECTED_ACCOUNT);
      localStorage.removeItem(STORAGE_KEYS.CONNECTED_RAW);
      localStorage.removeItem(STORAGE_KEYS.CURRENT_DATASET);
    } catch (err) {
      console.warn('Failed to reset localStorage:', err);
    }
  }

  public static getSettings(): EngineSettings {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (raw) {
        return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
      }
    } catch {
      // ignore
    }
    return DEFAULT_SETTINGS;
  }

  public static saveSettings(settings: EngineSettings): void {
    try {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    } catch (err) {
      console.warn('Failed to save settings to localStorage:', err);
    }
  }
}
