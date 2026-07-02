import { useEffect, useState, useCallback } from 'react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { TextArea } from '../components/ui/TextArea';
import { Label } from '../components/ui/Label';
import { ErrorMessage } from '../components/ui/ErrorMessage';
import { getSettings, setSettings, resetSettings, createDefaultPreference } from '../shared/storage';
import { getDefaultBaseUrl, getDefaultModel } from '../shared/llm';
import type { Settings, PrivacyPreference } from '../shared/types';

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

export function OptionsApp() {
  const [settings, setLocalSettings] = useState<Settings | null>(null);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getSettings().then(setLocalSettings).catch((err) => {
      setError(err instanceof Error ? err.message : 'Failed to load settings');
    });
  }, []);

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
        privacyPreferences: prev.privacyPreferences.map((p) =>
          p.id === id ? { ...p, ...patch } : p
        ),
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

  const handleSave = useCallback(async () => {
    if (!settings) return;
    try {
      await setSettings(settings);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save settings');
    }
  }, [settings]);

  const handleReset = useCallback(async () => {
    await resetSettings();
    const fresh = await getSettings();
    setLocalSettings(fresh);
  }, []);

  if (!settings) {
    return <div className="p-8">Loading settings...</div>;
  }

  return (
    <div className="mx-auto max-w-3xl p-6">
      <h1 className="text-2xl font-bold mb-6">Settings</h1>

      {error && <ErrorMessage message={error} />}

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
                Your API key is stored locally in the browser. It is never sent anywhere except to the provider you configured.
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
        <h2 className="text-lg font-semibold mb-4">Summary Prompt</h2>
        <div className="grid gap-2">
          <Label htmlFor="summaryPrompt">System Prompt</Label>
          <TextArea
            id="summaryPrompt"
            value={settings.summaryPrompt}
            onChange={(value: string) => updateField('summaryPrompt', value)}
            rows={10}
          />
          <p className="text-xs text-gray-500">
            Use {'{{document}}'} to insert the Terms of Service text and {'{{language}}'} for the language.
          </p>
        </div>
      </section>

      <section className="mb-8 rounded-lg border border-gray-200 p-4">
        <h2 className="text-lg font-semibold mb-4">Privacy Preferences</h2>
        <p className="text-sm text-gray-600 mb-4">
          Mark what you care about. The extension will check each analyzed Terms of Service against these preferences and warn you about matches.
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
                    onChange={(value: string) =>
                      updatePreference(pref.id, { severity: value as PrivacyPreference['severity'] })
                    }
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
        <h2 className="text-lg font-semibold mb-4">History</h2>
        <div className="grid gap-2">
          <Label htmlFor="historyExpiration">Keep summaries for (days)</Label>
          <Input
            id="historyExpiration"
            type="number"
            min={1}
            value={String(settings.historyExpirationDays)}
            onChange={(value: string) => updateField('historyExpirationDays', parseInt(value, 10) || 30)}
          />
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
