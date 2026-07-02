export async function callDeepSeek(request) {
    const { settings, prompt, systemPrompt } = request;
    if (!settings.apiKey.trim()) {
        return { text: '', error: 'Deepseek API key is not configured. Add it in the extension settings.' };
    }
    const baseUrl = settings.baseUrl.trim() || 'https://api.deepseek.com/v1';
    const model = settings.model.trim() || 'deepseek-chat';
    try {
        const messages = systemPrompt ? [{ role: 'system', content: systemPrompt }] : [];
        messages.push({ role: 'user', content: prompt });
        const response = await fetch(`${baseUrl}/chat/completions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${settings.apiKey}`,
            },
            body: JSON.stringify({
                model,
                messages,
                temperature: 0.2,
            }),
        });
        if (!response.ok) {
            const body = await response.text().catch(() => '');
            let error = `Deepseek returned ${response.status}${body ? `: ${body}` : ''}`;
            if (response.status === 401) {
                error = 'Invalid Deepseek API key. Check the key in extension settings.';
            }
            else if (response.status === 429) {
                error = 'Deepseek rate limit exceeded. Wait a moment and try again.';
            }
            else if (response.status >= 500) {
                error = 'Deepseek server error. Try again in a moment.';
            }
            else if (response.status === 404) {
                error = `Model '${model}' not found. Check the model name in settings.`;
            }
            return { text: '', error };
        }
        const data = (await response.json());
        const text = data.choices?.[0]?.message?.content?.trim() ?? '';
        return { text };
    }
    catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        if (message.includes('fetch') || message.includes('Failed to fetch') || message.includes('NetworkError')) {
            return { text: '', error: `Could not reach ${baseUrl}. Check your network or base URL.` };
        }
        return { text: '', error: `Deepseek request failed: ${message}` };
    }
}
