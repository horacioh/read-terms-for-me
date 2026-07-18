import type { Settings, PrivacyPreference, ScoringRule, UsageStats } from './types';
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

export async function recordAnalysis(preferences: { preferenceId: string }[]): Promise<void> {
  const stats = await getUsageStats();
  stats.totalAnalyses += 1;
  for (const { preferenceId } of preferences) {
    stats.termMatches[preferenceId] = (stats.termMatches[preferenceId] ?? 0) + 1;
  }
  await chrome.storage.local.set({ usageStats: stats });
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
