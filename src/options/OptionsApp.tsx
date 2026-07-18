import { useEffect, useState, useCallback, useMemo } from 'react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { TextArea } from '../components/ui/TextArea';
import { Label } from '../components/ui/Label';
import { ErrorMessage } from '../components/ui/ErrorMessage';
import {
  getSettings,
  setSettings,
  resetSettings,
  createDefaultPreference,
  createDefaultRule,
  DEFAULT_SUMMARY_PROMPT,
  DEFAULT_PREFERENCES_PROMPT,
  getUsageStats,
  resetUsageStats,
  setConsent,
  clearHistory,
} from '../shared/storage';
import { getDefaultBaseUrl, getDefaultModel } from '../shared/llm';
import { DEFAULT_SCORING_RULES } from '../shared/scoring/rules';
import type { Settings, PrivacyPreference, ScoringRule, ScoreCategory, UsageStats } from '../shared/types';

const providers = [
  { value: 'ollama', label: 'Ollama (local)' },
  { value: 'openai', label: 'OpenAI (BYOK)' },
  { value: 'deepseek', label: 'Deepseek (BYOK)' },
];

const severities = [
  { value: 'block', label: 'Block — dealbreaker' },
  { value: 'warn', label: 'Warn — concerning' },
  { value: 'allow', label: 'Allow — acceptable' },
];

const categories = [
  { value: 'privacy', label: 'Privacy' },
  { value: 'userRights', label: 'User Rights' },
  { value: 'transparency', label: 'Transparency' },
  { value: 'freedom', label: 'Freedom' },
];

function validatePrompts(settings: Settings): string | null {
  if (!settings.summaryPrompt.includes('{{document}}')) {
    return 'Summary prompt must include {{document}}.';
  }
  if (!settings.preferencesPrompt.includes('{{document}}')) {
    return 'Preferences prompt must include {{document}}.';
  }
  if (!settings.preferencesPrompt.includes('{{preferences}}')) {
    return 'Preferences prompt must include {{preferences}}.';
  }
  return null;
}

export function OptionsApp() {
  const [settings, setLocalSettings] = useState<Settings | null>(null);
  const [usageStats, setUsageStats] = useState<UsageStats | null>(null);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadStats = useCallback(async () => {
    const stats = await getUsageStats();
    setUsageStats(stats);
  }, []);

  useEffect(() => {
    getSettings()
      .then((s) => {
        setLocalSettings(s);
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : 'Failed to load settings');
      });
    void loadStats();
  }, [loadStats]);

  const updateField = useCallback(<K extends keyof Settings>(key: K, value: Settings[K]) => {
    setLocalSettings((prev) => {
      if (!prev) return prev;
      const next = { ...prev, [key]: value };
      if (key === 'provider') {
        next.baseUrl = getDefaultBaseUrl(value as Settings['provider']);
        next.model = getDefaultModel(value as Settings['provider']);
      }
      return next;
    });
  }, []);

  const updatePreference = useCallback((id: string, patch: Partial<PrivacyPreference>) => {
    setLocalSettings((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        privacyPreferences: prev.privacyPreferences.map((p) => (p.id === id ? { ...p, ...patch } : p)),
      };
    });
  }, []);

  const removePreference = useCallback((id: string) => {
    setLocalSettings((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        privacyPreferences: prev.privacyPreferences.filter((p) => p.id !== id),
      };
    });
  }, []);

  const addPreference = useCallback(() => {
    setLocalSettings((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        privacyPreferences: [...prev.privacyPreferences, createDefaultPreference()],
      };
    });
  }, []);

  const updateRule = useCallback((id: string, patch: Partial<ScoringRule>) => {
    setLocalSettings((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        scoringRules: prev.scoringRules.map((r) => (r.id === id ? { ...r, ...patch } : r)),
      };
    });
  }, []);

  const removeRule = useCallback((id: string) => {
    setLocalSettings((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        scoringRules: prev.scoringRules.filter((r) => r.id !== id),
      };
    });
  }, []);

  const addRule = useCallback(() => {
    setLocalSettings((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        scoringRules: [...prev.scoringRules, createDefaultRule()],
      };
    });
  }, []);

  const resetRules = useCallback(() => {
    setLocalSettings((prev) => {
      if (!prev) return prev;
      return { ...prev, scoringRules: DEFAULT_SCORING_RULES };
    });
  }, []);

  const handleSave = useCallback(async () => {
    if (!settings) return;
    const validation = validatePrompts(settings);
    if (validation) {
      setError(validation);
      return;
    }
    try {
      await setSettings(settings);
      setSaved(true);
      setError(null);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save settings');
    }
  }, [settings]);

  const handleReset = useCallback(async () => {
    await resetSettings();
    const fresh = await getSettings();
    setLocalSettings(fresh);
    await loadStats();
  }, [loadStats]);

  const handleResetStats = useCallback(async () => {
    await resetUsageStats();
    await loadStats();
  }, [loadStats]);

  const giveConsent = useCallback(async () => {
    await setConsent(true);
    updateField('consentGiven', true);
  }, []);

  const handleClearHistory = useCallback(async () => {
    await clearHistory();
  }, []);

  const consentMissing = settings && !settings.consentGiven;

  const topMatches = useMemo(() => {
    if (!usageStats) return [];
    return Object.entries(usageStats.termMatches)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);
  }, [usageStats]);

  if (!settings) {
    return <div className="p-8">Loading settings...</div>;
  }

  return (
    <div className="mx-auto max-w-3xl p-6">
      <h1 className="text-2xl font-bold mb-6">Settings</h1>

      {error && <ErrorMessage message={error} />}

      {consentMissing && (
        <section className="mb-8 rounded-lg border border-blue-200 bg-blue-50 p-4">
          <h2 className="text-lg font-semibold mb-2">Before you start</h2>
          <p className="text-sm text-gray-700 mb-4">
            Read Terms For Me keeps everything on your device. Your analysis history, settings, and anonymous usage counts are stored locally in your browser and are never uploaded.
            When you click Summarize, only the selected Terms of Service text is sent to the LLM provider you choose.
          </p>
          <Button onPress={giveConsent}>I understand</Button>
        </section>
      )}

      <section className="mb-8 rounded-lg border border-gray-200 p-4">
        <h2 className="text-lg font-semibold mb-4">LLM Provider</h2>
        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="provider">Provider</Label>
            <Select
              id="provider"
              value={settings.provider}
              onChange={(value: string) => updateField('provider', value as Settings['provider'])}
              options={providers}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="baseUrl">Base URL</Label>
            <Input
              id="baseUrl"
              value={settings.baseUrl}
              onChange={(value: string) => updateField('baseUrl', value)}
              placeholder={getDefaultBaseUrl(settings.provider)}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="model">Model</Label>
            <Input
              id="model"
              value={settings.model}
              onChange={(value: string) => updateField('model', value)}
              placeholder={getDefaultModel(settings.provider)}
            />
          </div>

          {(settings.provider === 'openai' || settings.provider === 'deepseek') && (
            <div className="grid gap-2">
              <Label htmlFor="apiKey">API Key</Label>
              <Input
                id="apiKey"
                type="password"
                value={settings.apiKey}
                onChange={(value: string) => updateField('apiKey', value)}
                placeholder="sk-..."
              />
              <p className="text-xs text-gray-500">
                Your API key is stored locally in the browser. It is only sent to the provider you configured.
              </p>
            </div>
          )}

          <div className="grid gap-2">
            <Label htmlFor="language">Summary Language</Label>
            <Input
              id="language"
              value={settings.language}
              onChange={(value: string) => updateField('language', value)}
              placeholder="English"
            />
          </div>
        </div>
      </section>

      <section className="mb-8 rounded-lg border border-gray-200 p-4">
        <h2 className="text-lg font-semibold mb-4">Prompts</h2>
        <p className="text-sm text-gray-600 mb-4">
          Edit the prompts sent to your LLM. Default prompts are used if you reset.
        </p>

        <div className="space-y-6">
          <div className="grid gap-2">
            <Label htmlFor="summaryPrompt">Summary Prompt</Label>
            <TextArea
              id="summaryPrompt"
              value={settings.summaryPrompt}
              onChange={(value: string) => updateField('summaryPrompt', value)}
              rows={8}
            />
            <p className="text-xs text-gray-500">Required placeholder: {'{{document}}'}, optional: {'{{language}}'}</p>
            <Button variant="ghost" size="sm" onPress={() => updateField('summaryPrompt', DEFAULT_SUMMARY_PROMPT)}>
              Reset to default
            </Button>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="preferencesPrompt">Preferences Prompt</Label>
            <TextArea
              id="preferencesPrompt"
              value={settings.preferencesPrompt}
              onChange={(value: string) => updateField('preferencesPrompt', value)}
              rows={8}
            />
            <p className="text-xs text-gray-500">Required placeholders: {'{{preferences}}'}, {'{{document}}'}</p>
            <Button
              variant="ghost"
              size="sm"
              onPress={() => updateField('preferencesPrompt', DEFAULT_PREFERENCES_PROMPT)}
            >
              Reset to default
            </Button>
          </div>

        </div>
      </section>

      <section className="mb-8 rounded-lg border border-gray-200 p-4">
        <h2 className="text-lg font-semibold mb-4">Privacy Preferences</h2>
        <p className="text-sm text-gray-600 mb-4">
          Mark what you care about. The extension checks each analyzed Terms of Service against these preferences.
        </p>

        <div className="space-y-4">
          {settings.privacyPreferences.map((pref) => (
            <div key={pref.id} className="rounded-md border border-gray-200 p-3">
              <div className="grid gap-3">
                <div className="grid gap-2">
                  <Label htmlFor={`pref-label-${pref.id}`}>Label</Label>
                  <Input
                    id={`pref-label-${pref.id}`}
                    value={pref.label}
                    onChange={(value: string) => updatePreference(pref.id, { label: value })}
                    placeholder="e.g., Data selling"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor={`pref-desc-${pref.id}`}>Description</Label>
                  <TextArea
                    id={`pref-desc-${pref.id}`}
                    value={pref.description}
                    onChange={(value: string) => updatePreference(pref.id, { description: value })}
                    rows={2}
                    placeholder="Describe what this preference means..."
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor={`pref-severity-${pref.id}`}>Severity</Label>
                  <Select
                    id={`pref-severity-${pref.id}`}
                    value={pref.severity}
                    onChange={(value: string) => updatePreference(pref.id, { severity: value as PrivacyPreference['severity'] })}
                    options={severities}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor={`pref-user-${pref.id}`}>User note (optional)</Label>
                  <Input
                    id={`pref-user-${pref.id}`}
                    value={pref.userDescription || ''}
                    onChange={(value: string) => updatePreference(pref.id, { userDescription: value })}
                    placeholder="Additional context for the LLM"
                  />
                </div>

                <div className="flex justify-end">
                  <Button variant="ghost" size="sm" onPress={() => removePreference(pref.id)}>
                    Remove
                  </Button>
                </div>
              </div>
            </div>
          ))}

          <Button variant="secondary" onPress={addPreference}>
            Add custom preference
          </Button>
        </div>
      </section>

      <section className="mb-8 rounded-lg border border-gray-200 p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Scoring Rules</h2>
          <Button variant="ghost" size="sm" onPress={resetRules}>
            Reset to defaults
          </Button>
        </div>
        <p className="text-sm text-gray-600 mb-4">
          Enable or disable built-in signals, or add your own regex-based rules. Scores start at 50 per category and adjust by each rule's weight.
        </p>

        <div className="space-y-4">
          {settings.scoringRules.map((rule) => (
            <RuleEditor
              key={rule.id}
              rule={rule}
              onChange={(patch) => updateRule(rule.id, patch)}
              onRemove={() => removeRule(rule.id)}
            />
          ))}

          <Button variant="secondary" onPress={addRule}>
            Add custom rule
          </Button>
        </div>
      </section>

      <section className="mb-8 rounded-lg border border-gray-200 p-4">
        <h2 className="text-lg font-semibold mb-4">Anonymous Usage Stats</h2>
        <p className="text-sm text-gray-600 mb-4">
          Only an anonymous count of analyses and matched privacy-preference categories are stored locally.
        </p>

        {usageStats && (
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label>Total analyses</Label>
              <p className="text-2xl font-semibold">{usageStats.totalAnalyses}</p>
            </div>

            {topMatches.length > 0 && (
              <div className="grid gap-2">
                <Label>Top matched categories</Label>
                <ul className="text-sm text-gray-700 space-y-1">
                  {topMatches.map(([id, count]) => (
                    <li key={id} className="flex justify-between">
                      <span>{id}</span>
                      <span>{count}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <Button variant="secondary" size="sm" onPress={handleResetStats}>
              Reset anonymous stats
            </Button>
          </div>
        )}
      </section>

      <section className="mb-8 rounded-lg border border-gray-200 p-4">
        <h2 className="text-lg font-semibold mb-4">Local History</h2>
        <p className="text-sm text-gray-600 mb-4">
          All analysis results, URLs, and page titles are stored locally in your browser. They are never uploaded.
        </p>

        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="historyExpirationDays">Keep history for (days)</Label>
            <Input
              id="historyExpirationDays"
              type="number"
              min={1}
              value={String(settings.historyExpirationDays)}
              onChange={(value: string) => updateField('historyExpirationDays', parseInt(value, 10) || 30)}
            />
          </div>

          <Button variant="secondary" size="sm" onPress={handleClearHistory}>
            Clear all history
          </Button>
        </div>
      </section>

      <div className="flex items-center gap-4">
        <Button onPress={handleSave}>{saved ? 'Saved!' : 'Save settings'}</Button>
        <Button variant="secondary" onPress={handleReset}>
          Reset to defaults
        </Button>
      </div>
    </div>
  );
}

interface RuleEditorProps {
  rule: ScoringRule;
  onChange: (patch: Partial<ScoringRule>) => void;
  onRemove: () => void;
}

function RuleEditor({ rule, onChange, onRemove }: RuleEditorProps) {
  const isBuiltIn = !rule.isCustom;

  return (
    <div className="rounded-md border border-gray-200 p-3 space-y-3">
      <div className="flex items-start gap-3">
        <input
          type="checkbox"
          id={`rule-enabled-${rule.id}`}
          checked={rule.enabled}
          onChange={(e) => onChange({ enabled: e.target.checked })}
          className="mt-1 h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
        />
        <div className="flex-1 grid gap-3">
          <div className="grid gap-2">
            <Label htmlFor={`rule-label-${rule.id}`}>Label</Label>
            <Input
              id={`rule-label-${rule.id}`}
              value={rule.label}
              disabled={isBuiltIn}
              onChange={(value: string) => onChange({ label: value })}
              placeholder="Rule label"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor={`rule-desc-${rule.id}`}>Description</Label>
            <TextArea
              id={`rule-desc-${rule.id}`}
              value={rule.description}
              disabled={isBuiltIn}
              onChange={(value: string) => onChange({ description: value })}
              rows={2}
              placeholder="What this rule looks for"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor={`rule-category-${rule.id}`}>Category</Label>
            <Select
              id={`rule-category-${rule.id}`}
              value={rule.category}
              disabled={isBuiltIn}
              onChange={(value: string) => onChange({ category: value as ScoreCategory })}
              options={categories}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor={`rule-weight-${rule.id}`}>Weight</Label>
            <Input
              id={`rule-weight-${rule.id}`}
              type="number"
              disabled={isBuiltIn}
              value={String(rule.weight)}
              onChange={(value: string) => onChange({ weight: Math.max(0, parseInt(value, 10) || 0) })}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor={`rule-positive-${rule.id}`}>Positive signals (one regex per line)</Label>
            <TextArea
              id={`rule-positive-${rule.id}`}
              value={(rule.positive ?? ['']).join('\n')}
              disabled={isBuiltIn}
              onChange={(value: string) => onChange({ positive: value.split('\n').map((s) => s.trim()) })}
              rows={3}
              placeholder="Regex patterns that improve the score"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor={`rule-negative-${rule.id}`}>Negative signals (one regex per line)</Label>
            <TextArea
              id={`rule-negative-${rule.id}`}
              value={(rule.negative ?? ['']).join('\n')}
              disabled={isBuiltIn}
              onChange={(value: string) => onChange({ negative: value.split('\n').map((s) => s.trim()) })}
              rows={3}
              placeholder="Regex patterns that reduce the score"
            />
          </div>
        </div>
      </div>

      {!isBuiltIn && (
        <div className="flex justify-end">
          <Button variant="ghost" size="sm" onPress={onRemove}>
            Remove
          </Button>
        </div>
      )}
    </div>
  );
}
