import type { Settings } from '../types';
import { callOpenAI } from './openai';
import { callOllama } from './ollama';
import { callDeepSeek } from './deepseek';

export interface LLMRequest {
  settings: Settings;
  prompt: string;
  systemPrompt?: string;
}

export interface LLMResponse {
  text: string;
  error?: string;
}

export async function callLLM(request: LLMRequest): Promise<LLMResponse> {
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

export function getDefaultModel(provider: Settings['provider']): string {
  if (provider === 'openai') return 'gpt-4o-mini';
  if (provider === 'deepseek') return 'deepseek-chat';
  return 'llama3.2';
}

export function getDefaultBaseUrl(provider: Settings['provider']): string {
  if (provider === 'openai') return 'https://api.openai.com/v1';
  if (provider === 'deepseek') return 'https://api.deepseek.com/v1';
  return 'http://localhost:11434';
}
