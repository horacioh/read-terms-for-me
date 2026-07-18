import { callLLM } from './shared/llm';
import { getSettings, recordAnalysis } from './shared/storage';
import { extractTextFromHtml, truncateText } from './shared/extractor';
import {
  buildSummaryPrompt,
  buildPreferencesPrompt,
  parseSummaryResponse,
  parsePreferencesResponse,
} from './shared/prompts';
import { scoreDocument } from './shared/scoring/rules';
import type { ActiveAnalysis, AnalyzeMessage, BackgroundMessage, SummaryResult } from './shared/types';

const MAX_CHARS = 12000;

function setActiveAnalysis(value: ActiveAnalysis | null): Promise<void> {
  return chrome.storage.session.set({ activeAnalysis: value });
}

chrome.runtime.onMessage.addListener((message: BackgroundMessage, sender, sendResponse) => {
  if (message.type === 'ANALYZE') {
    const analyzeMessage = message as AnalyzeMessage;

    if (analyzeMessage.windowId) {
      // sidePanel.open() must be called synchronously in the user-gesture context.
      void chrome.sidePanel.open({ windowId: analyzeMessage.windowId });
    }

    void (async () => {
      try {
        await setActiveAnalysis({ status: 'loading', url: analyzeMessage.url });
        await handleAnalyze(analyzeMessage);
      } catch (err) {
        console.error('[RTFM:bg] handleAnalyze failed:', err);
        await setActiveAnalysis({
          status: 'error',
          url: analyzeMessage.url,
          message: err instanceof Error ? err.message : 'Unknown error',
        });
      }
    })();

    sendResponse({ type: 'ANALYZE_STARTED' });
    return false;
  }

  if (message.type === 'GET_DETECTED_LINKS') {
    // Content script handles this directly; background just echoes to keep the listener shape clear.
    return false;
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

async function handleAnalyze(message: AnalyzeMessage): Promise<void> {
  const { url } = message;

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
  const scores = scoreDocument(text, settings.scoringRules);

  const summary: SummaryResult = {
    summary: parsedSummary.summary || summaryRes.text,
    keyPoints: parsedSummary.keyPoints ?? [],
    redFlags: parsedSummary.redFlags ?? [],
    dataUsage: parsedSummary.dataUsage ?? '',
    restrictions: parsedSummary.restrictions ?? [],
    termination: parsedSummary.termination ?? '',
    preferencesAnalysis,
    scores,
  };

  await recordAnalysis(preferencesAnalysis.filter((p) => p.matched).map((p) => ({ preferenceId: p.preferenceId })));
  await setActiveAnalysis({ status: 'complete', url, result: summary, analyzedAt: Date.now() });
}

chrome.action.onClicked.addListener((tab) => {
  if (tab.windowId) {
    void chrome.sidePanel.open({ windowId: tab.windowId });
  }
});

chrome.runtime.onInstalled.addListener(() => {
  void chrome.storage.session.set({ activeAnalysis: null });
  void getSettings().then((settings) => {
    if (!settings.consentGiven) {
      void chrome.runtime.openOptionsPage();
    }
  });
});
