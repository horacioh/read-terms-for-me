export type LLMProvider = 'openai' | 'ollama' | 'deepseek';

export type ScoreCategory = 'privacy' | 'userRights' | 'transparency' | 'freedom';

export interface ActiveAnalysis {
  status: 'loading' | 'error' | 'complete';
  url: string;
  message?: string;
  result?: SummaryResult;
  analyzedAt?: number;
}

export interface Settings {
  provider: LLMProvider;
  apiKey: string;
  baseUrl: string;
  model: string;
  language: string;
  summaryPrompt: string;
  preferencesPrompt: string;
  privacyPreferences: PrivacyPreference[];
  scoringRules: ScoringRule[];
  historyExpirationDays: number;
  consentGiven: boolean;
}

export interface PrivacyPreference {
  id: string;
  label: string;
  description: string;
  severity: 'block' | 'warn' | 'allow';
  userDescription?: string;
  isCustom?: boolean;
}

export interface ScoringRule {
  id: string;
  category: ScoreCategory;
  label: string;
  description: string;
  weight: number;
  positive?: string[];
  negative?: string[];
  enabled: boolean;
  isCustom?: boolean;
}

export interface DetectedLink {
  url: string;
  text: string;
  score: number;
}

export interface CategoryScore {
  score: number;
  summary: string;
}

export interface TermsScores {
  privacy: CategoryScore;
  userRights: CategoryScore;
  transparency: CategoryScore;
  freedom: CategoryScore;
}

export interface SummaryResult {
  summary: string;
  keyPoints: string[];
  redFlags: string[];
  dataUsage: string;
  restrictions: string[];
  termination: string;
  preferencesAnalysis: PreferenceAnalysis[];
  scores?: TermsScores;
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
  pageUrl?: string;
  pageTitle?: string;
  title: string;
  summary: SummaryResult;
  createdAt: number;
  expiresAt: number;
}

export interface UsageStats {
  totalAnalyses: number;
  termMatches: Record<string, number>;
}

export interface AnalyzeMessage {
  type: 'ANALYZE';
  url: string;
  windowId?: number;
  pageUrl?: string;
  pageTitle?: string;
}

export interface AnalyzeResultMessage {
  type: 'ANALYZE_RESULT';
  url: string;
  result: SummaryResult;
}

export interface UpdateBadgeMessage {
  type: 'UPDATE_BADGE';
  count: number;
  tabId: number | null;
}

export interface GetDetectedLinksMessage {
  type: 'GET_DETECTED_LINKS';
}

export interface DetectedLinksMessage {
  type: 'DETECTED_LINKS';
  links: DetectedLink[];
}

export interface ErrorMessage {
  type: 'ERROR';
  message: string;
}

export type BackgroundMessage =
  | AnalyzeMessage
  | UpdateBadgeMessage
  | GetDetectedLinksMessage;

export type ContentMessage = DetectedLinksMessage;

export type PopupMessage = AnalyzeResultMessage | ErrorMessage;
