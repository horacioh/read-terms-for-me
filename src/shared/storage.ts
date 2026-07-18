import type { Settings, PrivacyPreference, ScoringRule, UsageStats, HistoryEntry } from './types';
import { DEFAULT_SCORING_RULES } from './scoring/rules';

const DEFAULT_PRIVACY_PREFERENCES: PrivacyPreference[] = [
  {
    id: 'data-selling',
    label: 'Data selling to third parties',
    description: 'The service may sell or share personal data with third parties for advertising or other purposes.',
    severity: 'block',
  },
  {
    id: 'forced-arbitration',
    label: 'Forced arbitration',
    description: 'The service requires disputes to be resolved through arbitration rather than courts, often waiving class-action rights.',
    severity: 'block',
  },
  {
    id: 'broad-content-license',
    label: 'Broad license to user content',
    description: 'The service claims a wide, perpetual, or irrevocable license to content you upload or create.',
    severity: 'warn',
  },
  {
    id: 'termination-without-notice',
    label: 'Account termination without notice',
    description: 'The service may terminate your account without prior notice or clear recourse.',
    severity: 'warn',
  },
  {
    id: 'tracking',
    label: 'Extensive tracking',
    description: 'The service collects extensive behavioral, location, or cross-site tracking data.',
    severity: 'warn',
  },
];

export const DEFAULT_SUMMARY_PROMPT = `You are a legal-document assistant. Summarize the following Terms of Service for a non-expert user.

- Keep it concise but comprehensive.
- Use bullet points.
- Highlight any unusual or concerning clauses.
- Mention any data the service collects or shares.
- Note key restrictions and termination terms.
- Respond in the user's language if specified.

Document:
{{document}}`;

export const DEFAULT_PREFERENCES_PROMPT = `You are a legal-document assistant. Analyze the following Terms of Service against the user's privacy preferences.

User preferences:
{{preferences}}

For each preference, determine whether the document indicates the service engages in the described practice. Return a JSON array with objects shaped like:
{
  "preferenceId": "<id>",
  "label": "<label>",
  "severity": "<block|warn|allow>",
  "matched": true|false,
  "explanation": "<one-sentence explanation with a quote or reference if possible>"
}

Only include preferences from the list above. Be conservative: only set matched=true if the document clearly supports it.

Document:
{{document}}`;

const DEFAULT_SETTINGS: Settings = {
  provider: 'ollama',
  apiKey: '',
  baseUrl: 'http://localhost:11434',
  model: 'llama3.2',
  language: 'English',
  summaryPrompt: DEFAULT_SUMMARY_PROMPT,
  preferencesPrompt: DEFAULT_PREFERENCES_PROMPT,
  privacyPreferences: DEFAULT_PRIVACY_PREFERENCES,
  scoringRules: DEFAULT_SCORING_RULES,
  historyExpirationDays: 30,
  consentGiven: false,
};

export async function getSettings(): Promise<Settings> {
  const result = await chrome.storage.local.get('settings');
  const stored = (result.settings ?? {}) as Partial<Settings>;
  return {
    ...DEFAULT_SETTINGS,
    ...stored,
    // Always use the default rule set as the source of truth for built-in rules,
    // while preserving user toggles and custom rules.
    scoringRules: mergeRules(DEFAULT_SCORING_RULES, stored.scoringRules ?? []),
  };
}

function mergeRules(defaults: ScoringRule[], stored: ScoringRule[]): ScoringRule[] {
  const custom = stored.filter((r) => r.isCustom || !defaults.find((d) => d.id === r.id));
  const mergedDefaults = defaults.map((d) => {
    const saved = stored.find((r) => r.id === d.id && !r.isCustom);
    return saved ? { ...d, enabled: saved.enabled } : d;
  });
  return [...mergedDefaults, ...custom];
}

export async function setSettings(settings: Settings): Promise<void> {
  await chrome.storage.local.set({ settings });
}

export async function resetSettings(): Promise<void> {
  await chrome.storage.local.set({ settings: DEFAULT_SETTINGS });
}

export async function getUsageStats(): Promise<UsageStats> {
  const result = await chrome.storage.local.get('usageStats');
  return (result.usageStats as UsageStats | undefined) ?? { totalAnalyses: 0, termMatches: {} };
}

export async function resetUsageStats(): Promise<void> {
  await chrome.storage.local.set({ usageStats: { totalAnalyses: 0, termMatches: {} } });
}

export async function setConsent(value: boolean): Promise<void> {
  const result = await chrome.storage.local.get('settings');
  const stored = (result.settings ?? {}) as Partial<Settings>;
  await chrome.storage.local.set({ settings: { ...DEFAULT_SETTINGS, ...stored, consentGiven: value } });
}

export async function recordAnalysis(preferences: { preferenceId: string }[]): Promise<void> {
  const stats = await getUsageStats();
  stats.totalAnalyses += 1;
  for (const { preferenceId } of preferences) {
    stats.termMatches[preferenceId] = (stats.termMatches[preferenceId] ?? 0) + 1;
  }
  await chrome.storage.local.set({ usageStats: stats });
}

const HISTORY_KEY = 'analysisHistory';
const MAX_HISTORY = 100;

function now() {
  return Date.now();
}

function computeExpiresAt(createdAt: number, ttlDays: number): number {
  return createdAt + ttlDays * 24 * 60 * 60 * 1000;
}

function cleanHistory(entries: HistoryEntry[], ttlDays: number): HistoryEntry[] {
  const cutoff = now() - ttlDays * 24 * 60 * 60 * 1000;
  return entries
    .filter((e) => e.createdAt >= cutoff && e.expiresAt > now())
    .sort((a, b) => b.createdAt - a.createdAt)
    .slice(0, MAX_HISTORY);
}

export async function getHistory(ttlDays?: number): Promise<HistoryEntry[]> {
  const days = ttlDays ?? (await getSettings()).historyExpirationDays;
  const result = await chrome.storage.local.get(HISTORY_KEY);
  const entries = (result[HISTORY_KEY] as HistoryEntry[] | undefined) ?? [];
  return cleanHistory(entries, days);
}

export async function addHistoryEntry(entry: HistoryEntry): Promise<void> {
  const settings = await getSettings();
  if (!entry.expiresAt) {
    entry.expiresAt = computeExpiresAt(entry.createdAt, settings.historyExpirationDays);
  }
  const result = await chrome.storage.local.get(HISTORY_KEY);
  const entries = (result[HISTORY_KEY] as HistoryEntry[] | undefined) ?? [];
  const cleaned = cleanHistory(entries, settings.historyExpirationDays);
  const exists = cleaned.findIndex((e) => e.id === entry.id);
  if (exists >= 0) {
    cleaned[exists] = entry;
  } else {
    cleaned.unshift(entry);
  }
  await chrome.storage.local.set({ [HISTORY_KEY]: cleanHistory(cleaned, settings.historyExpirationDays) });
}

export async function deleteHistoryEntry(id: string): Promise<void> {
  const result = await chrome.storage.local.get(HISTORY_KEY);
  const entries = (result[HISTORY_KEY] as HistoryEntry[] | undefined) ?? [];
  await chrome.storage.local.set({ [HISTORY_KEY]: entries.filter((e) => e.id !== id) });
}

export async function clearHistory(): Promise<void> {
  await chrome.storage.local.remove(HISTORY_KEY);
}

export async function getCachedAnalysis(url: string, textHash?: string): Promise<HistoryEntry | null> {
  const settings = await getSettings();
  const result = await chrome.storage.local.get(HISTORY_KEY);
  const entries = (result[HISTORY_KEY] as HistoryEntry[] | undefined) ?? [];
  let matches = entries.filter(
    (e) =>
      e.url === url &&
      e.expiresAt > now() &&
      e.createdAt > now() - settings.historyExpirationDays * 24 * 60 * 60 * 1000
  );
  if (textHash) {
    matches = matches.filter((e) => e.textHash === textHash);
  }
  return matches.sort((a, b) => b.createdAt - a.createdAt)[0] ?? null;
}

export function createDefaultPreference(): PrivacyPreference {
  return {
    id: crypto.randomUUID(),
    label: '',
    description: '',
    severity: 'warn',
    isCustom: true,
  };
}

export function createDefaultRule(): ScoringRule {
  return {
    id: crypto.randomUUID(),
    category: 'privacy',
    label: '',
    description: '',
    weight: 5,
    positive: [''],
    negative: [''],
    enabled: true,
    isCustom: true,
  };
}
