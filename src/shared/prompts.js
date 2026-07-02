export function buildSummaryPrompt(settings, document) {
    return settings.summaryPrompt
        .replace('{{document}}', document)
        .replace('{{language}}', settings.language);
}
export function buildPreferencesPrompt(settings, document) {
    const prefs = settings.privacyPreferences
        .map((p, index) => `${index + 1}. ${p.label} (Severity: ${p.severity}) - ${p.description}${p.userDescription ? ` User note: ${p.userDescription}` : ''}`)
        .join('\n');
    return `You are a legal-document assistant. Analyze the following Terms of Service against the user's privacy preferences.

User preferences:
${prefs}

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
${document}`;
}
export function parsePreferencesResponse(response) {
    try {
        const clean = response.replace(/```json\s*/i, '').replace(/```\s*$/i, '').trim();
        const parsed = JSON.parse(clean);
        if (Array.isArray(parsed))
            return parsed;
    }
    catch {
        // Fall through to manual extraction
    }
    return [];
}
export function parseSummaryResponse(response) {
    const lines = response.split('\n');
    const summary = {
        summary: '',
        keyPoints: [],
        redFlags: [],
        dataUsage: '',
        restrictions: [],
        termination: '',
        preferencesAnalysis: [],
    };
    let currentKey = null;
    for (const rawLine of lines) {
        const line = rawLine.trim();
        if (!line)
            continue;
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
        }
        else if (currentKey === 'dataUsage') {
            summary.dataUsage += (summary.dataUsage ? ' ' : '') + line;
        }
        else if (currentKey === 'termination') {
            summary.termination += (summary.termination ? ' ' : '') + line;
        }
        else if (currentKey === 'keyPoints' || currentKey === 'redFlags' || currentKey === 'restrictions') {
            const clean = line.replace(/^[-*•]\s*/, '').trim();
            if (clean) {
                summary[currentKey] = [...(summary[currentKey] ?? []), clean];
            }
        }
    }
    return summary;
}
