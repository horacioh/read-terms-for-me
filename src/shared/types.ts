export type LLMProvider = 'openai' | 'ollama' | 'deepseek';

export interface Settings {
  provider: LLMProvider;
  apiKey: string;
  baseUrl: string;
  model: string;
  summaryPrompt: string;
  privacyPreferences: PrivacyPreference[];
  historyExpirationDays: number;
  language: string;
}

export interface PrivacyPreference {
  id: string;
  label: string;
  description: string;
  severity: 'block' | 'warn' | 'allow';
  userDescription?: string;
  isCustom?: boolean;
}

export interface DetectedLink {
  url: string;
  text: string;
  score: number;
}

export interface SummaryResult {
  summary: string;
  keyPoints: string[];
  redFlags: string[];
  dataUsage: string;
  restrictions: string[];
  termination: string;
  preferencesAnalysis: PreferenceAnalysis[];
}

export interface PreferenceAnalysis {
  preferenceId: string;
  label: string;
  severity: 'block' | 'warn' | 'allow';
  matched: boolean;
  explanation: string;
}

export interface HistoryEntry {
  id: string;
  url: string;
  pageUrl: string;
  pageTitle: string;
  title: string;
  summary: SummaryResult;
  createdAt: number;
}

export interface AnalyzeMessage {
  type: 'ANALYZE';
  url: string;
  pageUrl: string;
  pageTitle: string;
  windowId: number;
}

export interface DetectedLinksMessage {
  type: 'DETECTED_LINKS';
  links: DetectedLink[];
}

export interface ErrorMessage {
  type: 'ERROR';
  message: string;
}

export interface AnalyzeResultMessage {
  type: 'ANALYZE_RESULT';
  entry: HistoryEntry;
}

export interface UpdateBadgeMessage {
  type: 'UPDATE_BADGE';
  count: number;
  tabId: number | null;
}

export interface GetHistoryMessage {
  type: 'GET_HISTORY';
}

export type BackgroundMessage = AnalyzeMessage | UpdateBadgeMessage | GetHistoryMessage;
export type ContentMessage = DetectedLinksMessage;
export type PopupMessage = AnalyzeResultMessage | ErrorMessage;
