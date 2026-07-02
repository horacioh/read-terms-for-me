import { callOpenAI } from './openai';
import { callOllama } from './ollama';
import { callDeepSeek } from './deepseek';
export async function callLLM(request) {
    const { settings } = request;
    if (settings.provider === 'openai') {
        return callOpenAI(request);
    }
    if (settings.provider === 'ollama') {
        return callOllama(request);
    }
    if (settings.provider === 'deepseek') {
        return callDeepSeek(request);
    }
    return { text: '', error: `Unknown provider: ${settings.provider}` };
}
export function getDefaultModel(provider) {
    if (provider === 'openai')
        return 'gpt-4o-mini';
    if (provider === 'deepseek')
        return 'deepseek-chat';
    return 'llama3.2';
}
export function getDefaultBaseUrl(provider) {
    if (provider === 'openai')
        return 'https://api.openai.com/v1';
    if (provider === 'deepseek')
        return 'https://api.deepseek.com/v1';
    return 'http://localhost:11434';
}
