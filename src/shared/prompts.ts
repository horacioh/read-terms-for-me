import type { Settings, SummaryResult, PrivacyPreference } from './types';

export function buildSummaryPrompt(settings: Settings, document: string): string {
  return settings.summaryPrompt
    .replace(/\{\{document\}\}/g, document)
    .replace(/\{\{language\}\}/g, settings.language);
}

function formatPreferences(preferences: PrivacyPreference[]): string {
  return preferences
    .map(
      (p, index) =>
        `${index + 1}. ${p.label} (Severity: ${p.severity}) - ${p.description}${p.userDescription ? ` User note: ${p.userDescription}` : ''}`
    )
    .join('\n');
}

export function buildPreferencesPrompt(settings: Settings, document: string): string {
  return settings.preferencesPrompt
    .replace(/\{\{preferences\}\}/g, formatPreferences(settings.privacyPreferences))
    .replace(/\{\{document\}\}/g, document);
}

export function parsePreferencesResponse(response: string): SummaryResult['preferencesAnalysis'] {
  try {
    const clean = response.replace(/```json\s*/i, '').replace(/```\s*$/i, '').trim();
    const parsed = JSON.parse(clean);
    if (Array.isArray(parsed)) return parsed;
  } catch {
    // Fall through to manual extraction
  }

  return [];
}

export function parseSummaryResponse(response: string): Partial<SummaryResult> {
  const lines = response.split('\n');
  const summary: Partial<SummaryResult> = {
    summary: '',
    keyPoints: [],
    redFlags: [],
    dataUsage: '',
    restrictions: [],
    termination: '',
    preferencesAnalysis: [],
  };

  let currentKey: keyof SummaryResult | null = null;

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) continue;

    if (/^summary|overview/i.test(line)) {
      currentKey = 'summary';
      continue;
    }
    if (/^key points|highlights/i.test(line)) {
      currentKey = 'keyPoints';
      continue;
    }
    if (/^red flags|concerns/i.test(line)) {
      currentKey = 'redFlags';
      continue;
    }
    if (/^data usage|data collection/i.test(line)) {
      currentKey = 'dataUsage';
      continue;
    }
    if (/^restrictions|key restrictions/i.test(line)) {
      currentKey = 'restrictions';
      continue;
    }
    if (/^termination|account termination/i.test(line)) {
      currentKey = 'termination';
      continue;
    }

    if (currentKey === 'summary') {
      summary.summary += (summary.summary ? ' ' : '') + line;
    } else if (currentKey === 'dataUsage') {
      summary.dataUsage += (summary.dataUsage ? ' ' : '') + line;
    } else if (currentKey === 'termination') {
      summary.termination += (summary.termination ? ' ' : '') + line;
    } else if (currentKey === 'keyPoints' || currentKey === 'redFlags' || currentKey === 'restrictions') {
      const clean = line.replace(/^[-*•]\s*/, '').trim();
      if (clean) {
        summary[currentKey] = [...(summary[currentKey] ?? []), clean];
      }
    }
  }

  return summary;
}
