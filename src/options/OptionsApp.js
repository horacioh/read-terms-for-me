import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState, useCallback } from 'react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { TextArea } from '../components/ui/TextArea';
import { Label } from '../components/ui/Label';
import { ErrorMessage } from '../components/ui/ErrorMessage';
import { getSettings, setSettings, resetSettings, createDefaultPreference } from '../shared/storage';
import { getDefaultBaseUrl, getDefaultModel } from '../shared/llm';
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
    const [settings, setLocalSettings] = useState(null);
    const [saved, setSaved] = useState(false);
    const [error, setError] = useState(null);
    useEffect(() => {
        getSettings().then(setLocalSettings).catch((err) => {
            setError(err instanceof Error ? err.message : 'Failed to load settings');
        });
    }, []);
    const updateField = useCallback((key, value) => {
        setLocalSettings((prev) => {
            if (!prev)
                return prev;
            const next = { ...prev, [key]: value };
            if (key === 'provider') {
                next.baseUrl = getDefaultBaseUrl(value);
                next.model = getDefaultModel(value);
            }
            return next;
        });
    }, []);
    const updatePreference = useCallback((id, patch) => {
        setLocalSettings((prev) => {
            if (!prev)
                return prev;
            return {
                ...prev,
                privacyPreferences: prev.privacyPreferences.map((p) => p.id === id ? { ...p, ...patch } : p),
            };
        });
    }, []);
    const removePreference = useCallback((id) => {
        setLocalSettings((prev) => {
            if (!prev)
                return prev;
            return {
                ...prev,
                privacyPreferences: prev.privacyPreferences.filter((p) => p.id !== id),
            };
        });
    }, []);
    const addPreference = useCallback(() => {
        setLocalSettings((prev) => {
            if (!prev)
                return prev;
            return {
                ...prev,
                privacyPreferences: [...prev.privacyPreferences, createDefaultPreference()],
            };
        });
    }, []);
    const handleSave = useCallback(async () => {
        if (!settings)
            return;
        try {
            await setSettings(settings);
            setSaved(true);
            setTimeout(() => setSaved(false), 2000);
        }
        catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to save settings');
        }
    }, [settings]);
    const handleReset = useCallback(async () => {
        await resetSettings();
        const fresh = await getSettings();
        setLocalSettings(fresh);
    }, []);
    if (!settings) {
        return _jsx("div", { className: "p-8", children: "Loading settings..." });
    }
    return (_jsxs("div", { className: "mx-auto max-w-3xl p-6", children: [_jsx("h1", { className: "text-2xl font-bold mb-6", children: "Settings" }), error && _jsx(ErrorMessage, { message: error }), _jsxs("section", { className: "mb-8 rounded-lg border border-gray-200 p-4", children: [_jsx("h2", { className: "text-lg font-semibold mb-4", children: "LLM Provider" }), _jsxs("div", { className: "grid gap-4", children: [_jsxs("div", { className: "grid gap-2", children: [_jsx(Label, { htmlFor: "provider", children: "Provider" }), _jsx(Select, { id: "provider", value: settings.provider, onChange: (value) => updateField('provider', value), options: providers })] }), _jsxs("div", { className: "grid gap-2", children: [_jsx(Label, { htmlFor: "baseUrl", children: "Base URL" }), _jsx(Input, { id: "baseUrl", value: settings.baseUrl, onChange: (value) => updateField('baseUrl', value), placeholder: getDefaultBaseUrl(settings.provider) })] }), _jsxs("div", { className: "grid gap-2", children: [_jsx(Label, { htmlFor: "model", children: "Model" }), _jsx(Input, { id: "model", value: settings.model, onChange: (value) => updateField('model', value), placeholder: getDefaultModel(settings.provider) })] }), (settings.provider === 'openai' || settings.provider === 'deepseek') && (_jsxs("div", { className: "grid gap-2", children: [_jsx(Label, { htmlFor: "apiKey", children: "API Key" }), _jsx(Input, { id: "apiKey", type: "password", value: settings.apiKey, onChange: (value) => updateField('apiKey', value), placeholder: "sk-..." }), _jsx("p", { className: "text-xs text-gray-500", children: "Your API key is stored locally in the browser. It is never sent anywhere except to the provider you configured." })] })), _jsxs("div", { className: "grid gap-2", children: [_jsx(Label, { htmlFor: "language", children: "Summary Language" }), _jsx(Input, { id: "language", value: settings.language, onChange: (value) => updateField('language', value), placeholder: "English" })] })] })] }), _jsxs("section", { className: "mb-8 rounded-lg border border-gray-200 p-4", children: [_jsx("h2", { className: "text-lg font-semibold mb-4", children: "Summary Prompt" }), _jsxs("div", { className: "grid gap-2", children: [_jsx(Label, { htmlFor: "summaryPrompt", children: "System Prompt" }), _jsx(TextArea, { id: "summaryPrompt", value: settings.summaryPrompt, onChange: (value) => updateField('summaryPrompt', value), rows: 10 }), _jsxs("p", { className: "text-xs text-gray-500", children: ["Use ", '{{document}}', " to insert the Terms of Service text and ", '{{language}}', " for the language."] })] })] }), _jsxs("section", { className: "mb-8 rounded-lg border border-gray-200 p-4", children: [_jsx("h2", { className: "text-lg font-semibold mb-4", children: "Privacy Preferences" }), _jsx("p", { className: "text-sm text-gray-600 mb-4", children: "Mark what you care about. The extension will check each analyzed Terms of Service against these preferences and warn you about matches." }), _jsxs("div", { className: "space-y-4", children: [settings.privacyPreferences.map((pref) => (_jsx("div", { className: "rounded-md border border-gray-200 p-3", children: _jsxs("div", { className: "grid gap-3", children: [_jsxs("div", { className: "grid gap-2", children: [_jsx(Label, { htmlFor: `pref-label-${pref.id}`, children: "Label" }), _jsx(Input, { id: `pref-label-${pref.id}`, value: pref.label, onChange: (value) => updatePreference(pref.id, { label: value }), placeholder: "e.g., Data selling" })] }), _jsxs("div", { className: "grid gap-2", children: [_jsx(Label, { htmlFor: `pref-desc-${pref.id}`, children: "Description" }), _jsx(TextArea, { id: `pref-desc-${pref.id}`, value: pref.description, onChange: (value) => updatePreference(pref.id, { description: value }), rows: 2, placeholder: "Describe what this preference means..." })] }), _jsxs("div", { className: "grid gap-2", children: [_jsx(Label, { htmlFor: `pref-severity-${pref.id}`, children: "Severity" }), _jsx(Select, { id: `pref-severity-${pref.id}`, value: pref.severity, onChange: (value) => updatePreference(pref.id, { severity: value }), options: severities })] }), _jsxs("div", { className: "grid gap-2", children: [_jsx(Label, { htmlFor: `pref-user-${pref.id}`, children: "User note (optional)" }), _jsx(Input, { id: `pref-user-${pref.id}`, value: pref.userDescription || '', onChange: (value) => updatePreference(pref.id, { userDescription: value }), placeholder: "Additional context for the LLM" })] }), _jsx("div", { className: "flex justify-end", children: _jsx(Button, { variant: "ghost", size: "sm", onPress: () => removePreference(pref.id), children: "Remove" }) })] }) }, pref.id))), _jsx(Button, { variant: "secondary", onPress: addPreference, children: "Add custom preference" })] })] }), _jsxs("section", { className: "mb-8 rounded-lg border border-gray-200 p-4", children: [_jsx("h2", { className: "text-lg font-semibold mb-4", children: "History" }), _jsxs("div", { className: "grid gap-2", children: [_jsx(Label, { htmlFor: "historyExpiration", children: "Keep summaries for (days)" }), _jsx(Input, { id: "historyExpiration", type: "number", min: 1, value: String(settings.historyExpirationDays), onChange: (value) => updateField('historyExpirationDays', parseInt(value, 10) || 30) })] })] }), _jsxs("div", { className: "flex items-center gap-4", children: [_jsx(Button, { onPress: handleSave, children: saved ? 'Saved!' : 'Save settings' }), _jsx(Button, { variant: "secondary", onPress: handleReset, children: "Reset to defaults" })] })] }));
}
