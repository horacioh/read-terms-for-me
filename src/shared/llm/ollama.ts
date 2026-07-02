import type { LLMRequest, LLMResponse } from './index';

export async function callOllama(request: LLMRequest): Promise<LLMResponse> {
  const { settings, prompt, systemPrompt } = request;

  const baseUrl = settings.baseUrl.trim() || 'http://localhost:11434';
  const model = settings.model.trim() || 'llama3.2';

  try {
    const response = await fetch(`${baseUrl}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model,
        messages: [
          ...(systemPrompt ? [{ role: 'system', content: systemPrompt }] : []),
          { role: 'user', content: prompt },
        ],
        stream: false,
        options: {
          temperature: 0.2,
        },
      }),
    });

    if (!response.ok) {
      const body = await response.text().catch(() => '');
      if (response.status === 403) {
        return {
          text: '',
          error: `Ollama blocked the request (403). CORS is likely disabled for Chrome extensions. Stop Ollama and restart it with:\nOLLAMA_ORIGINS="chrome-extension://*" ollama serve`,
        };
      }
      return {
        text: '',
        error: `Ollama returned ${response.status}${body ? `: ${body}` : ''}. Check the model '${model}' is available with 'ollama list'.`,
      };
    }

    const data = (await response.json()) as {
      message?: { content?: string };
    };
    const text = data.message?.content?.trim() ?? '';
    return { text };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    if (message.includes('fetch') || message.includes('Failed to fetch') || message.includes('NetworkError')) {
      return {
        text: '',
        error: `Could not reach Ollama at ${baseUrl}. Is Ollama running?`,
      };
    }
    return {
      text: '',
      error: `Ollama request failed: ${message}`,
    };
  }
}
