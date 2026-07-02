import type { Settings, HistoryEntry, PrivacyPreference } from './types';

const DEFAULT_SETTINGS: Settings = {
  provider: 'ollama',
  apiKey: '',
  baseUrl: 'http://localhost:11434',
  model: 'llama3.2',
  summaryPrompt: `You are a legal-document assistant. Summarize the following Terms of Service for a non-expert user.

- Keep it concise but comprehensive.
- Use bullet points.
- Highlight any unusual or concerning clauses.
- Mention any data the service collects or shares.
- Note key restrictions and termination terms.
- Respond in the user's language if specified.

Document:
{{document}}`,
  privacyPreferences: [
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
  ],
  historyExpirationDays: 30,
  language: 'English',
};

export async function getSettings(): Promise<Settings> {
  const result = await chrome.storage.local.get('settings');
  return { ...DEFAULT_SETTINGS, ...(result.settings ?? {}) };
}

export async function setSettings(settings: Settings): Promise<void> {
  await chrome.storage.local.set({ settings });
}

export async function resetSettings(): Promise<void> {
  await chrome.storage.local.set({ settings: DEFAULT_SETTINGS });
}

export async function getHistory(): Promise<HistoryEntry[]> {
  const result = await chrome.storage.local.get('history');
  const entries: HistoryEntry[] = result.history ?? [];
  return pruneExpired(entries);
}

export async function addHistoryEntry(entry: HistoryEntry): Promise<void> {
  const history = await getHistory();
  const filtered = history.filter((e) => e.url !== entry.url);
  filtered.unshift(entry);
  await chrome.storage.local.set({ history: filtered });
}

export async function deleteHistoryEntry(id: string): Promise<void> {
  const history = await getHistory();
  await chrome.storage.local.set({
    history: history.filter((e) => e.id !== id),
  });
}

export async function clearHistory(): Promise<void> {
  await chrome.storage.local.set({ history: [] });
}

async function pruneExpired(entries: HistoryEntry[]): Promise<HistoryEntry[]> {
  const settings = await getSettings();
  const cutoff = Date.now() - settings.historyExpirationDays * 24 * 60 * 60 * 1000;
  return entries.filter((e) => e.createdAt >= cutoff);
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
