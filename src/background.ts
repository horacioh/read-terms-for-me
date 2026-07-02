import { callLLM } from './shared/llm';
import { getSettings, addHistoryEntry } from './shared/storage';
import { extractTextFromHtml, truncateText } from './shared/extractor';
import { buildSummaryPrompt, buildPreferencesPrompt, parseSummaryResponse, parsePreferencesResponse } from './shared/prompts';
import type { AnalyzeMessage, BackgroundMessage, HistoryEntry, SummaryResult } from './shared/types';

const MAX_CHARS = 12000;

chrome.runtime.onMessage.addListener((message: BackgroundMessage, sender, sendResponse) => {
  if (message.type === 'ANALYZE') {
    handleAnalyze(message).then(sendResponse).catch((err) => {
      sendResponse({ type: 'ERROR', message: err instanceof Error ? err.message : 'Unknown error' });
    });
    return true;
  }

  if (message.type === 'GET_HISTORY') {
    chrome.storage.local.get('history').then((result) => {
      sendResponse({ type: 'HISTORY', history: result.history ?? [] });
    });
    return true;
  }

  if (message.type === 'UPDATE_BADGE') {
    const tabId = message.tabId ?? sender.tab?.id;
    if (tabId) {
      const text = message.count > 0 ? (message.count > 9 ? '9+' : String(message.count)) : '';
      void chrome.action.setBadgeText({ text, tabId });
      void chrome.action.setBadgeBackgroundColor({ color: '#2563eb' });
    }
    return false;
  }

  return false;
});

async function handleAnalyze(message: AnalyzeMessage) {
  const { url, pageUrl, pageTitle } = message;
  const settings = await getSettings();

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Could not fetch Terms of Service: ${response.status} ${response.statusText}`);
  }

  const html = await response.text();
  const text = truncateText(extractTextFromHtml(html), MAX_CHARS);

  const [summaryRes, prefsRes] = await Promise.all([
    callLLM({
      settings,
      prompt: buildSummaryPrompt(settings, text),
      systemPrompt: 'You are a helpful legal assistant. Summarize the provided Terms of Service in plain language.',
    }),
    callLLM({
      settings,
      prompt: buildPreferencesPrompt(settings, text),
      systemPrompt: 'You are a helpful legal assistant. Respond only with valid JSON.',
    }),
  ]);

  if (summaryRes.error) {
    throw new Error(summaryRes.error);
  }

  const parsedSummary = parseSummaryResponse(summaryRes.text);
  const preferencesAnalysis = prefsRes.error ? [] : parsePreferencesResponse(prefsRes.text);

  const summary: SummaryResult = {
    summary: parsedSummary.summary || summaryRes.text,
    keyPoints: parsedSummary.keyPoints ?? [],
    redFlags: parsedSummary.redFlags ?? [],
    dataUsage: parsedSummary.dataUsage ?? '',
    restrictions: parsedSummary.restrictions ?? [],
    termination: parsedSummary.termination ?? '',
    preferencesAnalysis,
  };

  const entry: HistoryEntry = {
    id: crypto.randomUUID(),
    url,
    pageUrl,
    pageTitle,
    title: pageTitle || url,
    summary,
    createdAt: Date.now(),
  };

  await addHistoryEntry(entry);
  try {
    await chrome.sidePanel.open({ windowId: message.windowId });
  } catch {
    // Side panel may already be open; ignore.
  }

  return { type: 'ANALYZE_RESULT', entry } as const;
}

chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.set({ activeAnalysis: null });
});
