import { useEffect, useState, useCallback } from 'react';
import { SummaryView } from '../components/SummaryView';
import { HistoryList } from '../components/HistoryList';
import { Button } from '../components/ui/Button';
import { Loading } from '../components/ui/Loading';
import { ErrorMessage } from '../components/ui/ErrorMessage';
import { Badge } from '../components/ui/Badge';
import { Settings, FileText, Link, ArrowLeft, Trash2 } from 'lucide-react';
import { getHistory, deleteHistoryEntry, clearHistory } from '../shared/storage';
import type { ActiveAnalysis, DetectedLink, HistoryEntry } from '../shared/types';

export function SidePanelApp() {
  const [activeAnalysis, setActiveAnalysis] = useState<ActiveAnalysis | null>(null);
  const [links, setLinks] = useState<DetectedLink[]>([]);
  const [currentTab, setCurrentTab] = useState<chrome.tabs.Tab | null>(null);
  const [manualUrl, setManualUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [selectedHistoryId, setSelectedHistoryId] = useState<string | null>(null);

  const loadHistory = useCallback(async () => {
    const entries = await getHistory();
    setHistory(entries);
  }, []);

  const loadLinks = useCallback(async () => {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (!tab?.id) {
        setLinks([]);
        setLoading(false);
        return;
      }
      setCurrentTab(tab);
      const response = await chrome.tabs.sendMessage(tab.id, { type: 'GET_DETECTED_LINKS' });
      if (response?.type === 'DETECTED_LINKS') {
        setLinks(response.links);
      } else {
        setLinks([]);
      }
    } catch {
      setLinks([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadLinks();
    void loadHistory();

    const onActivated = () => {
      void loadLinks();
    };
    const onUpdated = (tabId: number, changeInfo: chrome.tabs.TabChangeInfo) => {
      if (changeInfo.status === 'complete' || changeInfo.url) {
        chrome.tabs.query({ active: true, currentWindow: true }).then(([active]) => {
          if (active?.id === tabId) void loadLinks();
        });
      }
    };

    chrome.tabs.onActivated.addListener(onActivated);
    chrome.tabs.onUpdated.addListener(onUpdated);
    return () => {
      chrome.tabs.onActivated.removeListener(onActivated);
      chrome.tabs.onUpdated.removeListener(onUpdated);
    };
  }, [loadLinks, loadHistory]);

  useEffect(() => {
    chrome.storage.session.get('activeAnalysis').then((result) => {
      setActiveAnalysis((result.activeAnalysis as ActiveAnalysis | null) ?? null);
    });

    const handleStorageChange = (
      changes: { [key: string]: chrome.storage.StorageChange },
      areaName: string
    ) => {
      if (areaName !== 'session' || !changes.activeAnalysis) return;
      const newValue: ActiveAnalysis | null = changes.activeAnalysis.newValue ?? null;
      setActiveAnalysis(newValue);
      if (newValue?.status === 'complete') {
        void loadHistory();
        setSelectedHistoryId(null);
      }
    };

    chrome.storage.onChanged.addListener(handleStorageChange);
    return () => chrome.storage.onChanged.removeListener(handleStorageChange);
  }, [loadHistory]);

  const handleAnalyze = useCallback(
    (url: string, force = false, source?: { pageUrl?: string; pageTitle?: string }) => {
      if (!currentTab?.windowId) return;
      setSelectedHistoryId(null);
      void chrome.runtime.sendMessage({
        type: 'ANALYZE',
        url,
        windowId: currentTab.windowId,
        pageUrl: source?.pageUrl ?? currentTab.url,
        pageTitle: source?.pageTitle ?? currentTab.title,
        force,
      });
    },
    [currentTab]
  );

  const handleManualAnalyze = useCallback(() => {
    const trimmed = manualUrl.trim();
    if (!trimmed) return;
    try {
      new URL(trimmed);
    } catch {
      return;
    }
    handleAnalyze(trimmed);
    setManualUrl('');
  }, [manualUrl, handleAnalyze]);

  const dismissError = useCallback(() => {
    void chrome.storage.session.set({ activeAnalysis: null });
  }, []);

  const openOptions = useCallback(() => {
    void chrome.runtime.openOptionsPage();
  }, []);

  const handleSelectHistory = useCallback((id: string) => {
    setSelectedHistoryId(id);
  }, []);

  const handleDeleteHistory = useCallback(
    async (id: string) => {
      await deleteHistoryEntry(id);
      if (selectedHistoryId === id) {
        setSelectedHistoryId(null);
      }
      await loadHistory();
    },
    [selectedHistoryId, loadHistory]
  );

  const handleClearHistory = useCallback(async () => {
    await clearHistory();
    setSelectedHistoryId(null);
    await loadHistory();
  }, [loadHistory]);

  const selectedHistory = history.find((h) => h.id === selectedHistoryId) ?? null;

  const displayedResult =
    activeAnalysis?.status === 'complete' && activeAnalysis.result && !selectedHistory
      ? {
          result: activeAnalysis.result,
          url: activeAnalysis.url,
          analyzedAt: activeAnalysis.analyzedAt,
          title: undefined,
        }
      : selectedHistory
        ? {
            result: selectedHistory.summary,
            url: selectedHistory.url,
            analyzedAt: selectedHistory.createdAt,
            title: selectedHistory.title,
          }
        : null;

  const showHome =
    !displayedResult && activeAnalysis?.status !== 'loading' && activeAnalysis?.status !== 'error';

  const goHome = useCallback(() => {
    void chrome.storage.session.set({ activeAnalysis: null });
    setSelectedHistoryId(null);
  }, []);

  const handleReanalyze = useCallback(() => {
    if (!displayedResult?.url) return;
    const source = selectedHistory ?? undefined;
    handleAnalyze(displayedResult.url, true, {
      pageUrl: source?.pageUrl,
      pageTitle: source?.pageTitle,
    });
  }, [displayedResult, selectedHistory, handleAnalyze]);

  return (
    <div className="flex h-screen flex-col">
      <header className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
        <div className="flex items-center gap-2">
          {!showHome && (
            <button
              onClick={goHome}
              className="rounded p-1 text-gray-600 hover:bg-gray-100 hover:text-gray-900"
              aria-label="Back to home"
            >
              <ArrowLeft size={18} />
            </button>
          )}
          <h1 className="flex items-center gap-2 text-base font-semibold">
            <FileText size={18} aria-hidden="true" />
            Read Terms For Me
          </h1>
        </div>
        {displayedResult && (
          <Button size="sm" onPress={handleReanalyze}>
            Re-analyze
          </Button>
        )}
        <Button variant="ghost" size="icon" onPress={openOptions} aria-label="Open settings">
          <Settings size={18} aria-hidden="true" />
        </Button>
      </header>

      <div className="flex-1 overflow-y-auto p-4">
        {activeAnalysis?.status === 'loading' && (
          <div className="flex items-center justify-center py-16">
            <Loading label="Analyzing Terms of Service..." />
          </div>
        )}

        {activeAnalysis?.status === 'error' && (
          <div className="flex flex-col items-center justify-center gap-4 px-4 py-16 text-center">
            <ErrorMessage message={activeAnalysis.message ?? 'Analysis failed'} />
            <Button variant="secondary" size="sm" onPress={dismissError}>
              Dismiss
            </Button>
          </div>
        )}

        {displayedResult && (
          <SummaryView
            result={displayedResult.result}
            url={displayedResult.url}
            title={displayedResult.title}
            analyzedAt={displayedResult.analyzedAt}
          />
        )}

        {showHome && (
          <div className="flex flex-col gap-4">
            {loading && <Loading label="Scanning page..." />}

            {!loading && links.length > 0 && (
              <section>
                <h2 className="mb-3 text-sm font-semibold text-gray-700">Found on this page</h2>
                <ul className="flex flex-col gap-2">
                  {links.map((link) => (
                    <li
                      key={link.url}
                      className="rounded-lg border border-gray-200 p-3 flex flex-col gap-2"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-sm font-medium" title={link.text}>
                          {link.text || 'Terms of Service'}
                        </span>
                        <Badge variant="secondary">Score: {link.score}</Badge>
                      </div>
                      <p className="text-xs text-gray-500 break-all" title={link.url}>
                        {link.url}
                      </p>
                      <Button onPress={() => handleAnalyze(link.url)} className="w-full">
                        Summarize
                      </Button>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {!loading && links.length === 0 && (
              <div className="flex flex-col items-center gap-2 py-8 text-center text-sm text-gray-500">
                <FileText size={24} aria-hidden="true" />
                <p>No Terms of Service links detected on this page.</p>
              </div>
            )}

            <section className="border-t border-gray-200 pt-4">
              <h2 className="mb-2 text-sm font-semibold text-gray-700 flex items-center gap-1.5">
                <Link size={14} aria-hidden="true" />
                Analyze a URL
              </h2>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleManualAnalyze();
                }}
                className="flex gap-2"
              >
                <input
                  type="url"
                  value={manualUrl}
                  onChange={(e) => setManualUrl(e.target.value)}
                  placeholder="https://example.com/terms"
                  className="flex-1 rounded-md border border-gray-300 px-3 py-1.5 text-sm placeholder:text-gray-400 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />
                <Button onPress={handleManualAnalyze} isDisabled={!manualUrl.trim()}>
                  Analyze
                </Button>
              </form>
            </section>

            {history.length > 0 && (
              <section className="border-t border-gray-200 pt-4">
                <div className="mb-2 flex items-center justify-between">
                  <h2 className="text-sm font-semibold text-gray-700">Recent analyses</h2>
                  <Button variant="ghost" size="icon" onPress={handleClearHistory} aria-label="Clear history">
                    <Trash2 size={14} aria-hidden="true" />
                  </Button>
                </div>
                <HistoryList
                  entries={history}
                  selectedId={selectedHistoryId}
                  onSelect={handleSelectHistory}
                  onDelete={handleDeleteHistory}
                />
              </section>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
