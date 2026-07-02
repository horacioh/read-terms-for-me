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
export function buildScoresPrompt(document) {
    return `Analyze the following Terms of Service and score it on four categories.

Each score is 0–100 where higher is better FOR THE USER:
- **privacy**: How well user data is protected. 90-100 = minimal collection, no tracking/selling. 50-89 = some collection but transparent, limited sharing. 0-49 = extensive collection, tracking, or data selling/sharing.
- **userRights**: How much control the user retains. 90-100 = user owns all content, fair termination, court access. 50-89 = some content license, reasonable termination. 0-49 = broad content license, termination without notice, forced arbitration.
- **transparency**: How clear and fair the terms are. 90-100 = plain language, advance notice of changes, no hidden clauses. 50-89 = generally clear with some complexity. 0-49 = dense legalese, no change notices, hidden or unusual clauses.
- **freedom**: How few restrictions are imposed. 90-100 = minimal restrictions, fair liability, easy to leave. 50-89 = standard restrictions, some liability limits. 0-49 = heavy restrictions, broad liability waivers, lock-in effects.

Return ONLY a JSON object (no markdown fences):
{
  "privacy": { "score": <number>, "summary": "<one sentence>" },
  "userRights": { "score": <number>, "summary": "<one sentence>" },
  "transparency": { "score": <number>, "summary": "<one sentence>" },
  "freedom": { "score": <number>, "summary": "<one sentence>" }
}

Document:
${document}`;
}
const DEFAULT_CATEGORY = { score: 50, summary: 'Could not determine' };
export function parseScoresResponse(response) {
    try {
        const clean = response.replace(/```json\s*/i, '').replace(/```\s*$/i, '').trim();
        const parsed = JSON.parse(clean);
        function toCategory(val) {
            if (val && typeof val === 'object' && 'score' in val && 'summary' in val) {
                const obj = val;
                return {
                    score: Math.max(0, Math.min(100, Math.round(Number(obj.score) || 50))),
                    summary: String(obj.summary ?? ''),
                };
            }
            return DEFAULT_CATEGORY;
        }
        return {
            privacy: toCategory(parsed.privacy),
            userRights: toCategory(parsed.userRights),
            transparency: toCategory(parsed.transparency),
            freedom: toCategory(parsed.freedom),
        };
    }
    catch {
        return null;
    }
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
