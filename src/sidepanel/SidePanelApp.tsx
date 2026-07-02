import { useEffect, useState, useCallback, useRef } from 'react';
import { SummaryView } from '../components/SummaryView';
import { Button } from '../components/ui/Button';
import { Loading } from '../components/ui/Loading';
import { ErrorMessage } from '../components/ui/ErrorMessage';
import { Badge } from '../components/ui/Badge';
import { getHistory, deleteHistoryEntry, clearHistory } from '../shared/storage';
import { Settings, FileText, ChevronDown, ChevronRight, Trash2, ArrowLeft } from 'lucide-react';
import type { ActiveAnalysis, DetectedLink, HistoryEntry } from '../shared/types';

type View = 'home' | 'summary';

export function SidePanelApp() {
  const [view, setView] = useState<View>('home');
  const [links, setLinks] = useState<DetectedLink[]>([]);
  const [currentTab, setCurrentTab] = useState<chrome.tabs.Tab | null>(null);

  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [activeAnalysis, setActiveAnalysis] = useState<ActiveAnalysis | null>(null);
  const wasAnalyzingRef = useRef(false);

  const [historyOpen, setHistoryOpen] = useState(false);

  // --- Load detected links for the active tab ---
  const loadLinks = useCallback(async () => {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (!tab?.id) {
        setLinks([]);
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
    }
  }, []);

  useEffect(() => {
    void loadLinks();

    const onActivated = () => { void loadLinks(); };
    const onUpdated = (tabId: number, changeInfo: chrome.tabs.TabChangeInfo) => {
      if (changeInfo.status === 'complete' || changeInfo.url) {
        // Only reload if the updated tab is the active one
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
  }, [loadLinks]);

  // --- Load history + activeAnalysis from storage ---
  const loadHistory = useCallback(async () => {
    try {
      const entries = await getHistory();
      setHistory(entries);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load history');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadHistory();

    chrome.storage.local.get('activeAnalysis').then((result) => {
      const value: ActiveAnalysis | null = result.activeAnalysis ?? null;
      setActiveAnalysis(value);
      wasAnalyzingRef.current = value?.status === 'loading';
    });

    const handleStorageChange = (changes: { [key: string]: chrome.storage.StorageChange }) => {
      if (changes.history) {
        void loadHistory();
      }
      if (changes.activeAnalysis) {
        const newValue: ActiveAnalysis | null = changes.activeAnalysis.newValue ?? null;
        setActiveAnalysis(newValue);

        if (wasAnalyzingRef.current && newValue === null) {
          getHistory().then((entries) => {
            setHistory(entries);
            if (entries.length > 0) {
              setSelectedId(entries[0].id);
              setView('summary');
            }
          });
        }
        wasAnalyzingRef.current = newValue?.status === 'loading';
      }
    };

    chrome.storage.local.onChanged.addListener(handleStorageChange);
    return () => chrome.storage.local.onChanged.removeListener(handleStorageChange);
  }, [loadHistory]);

  // --- Actions ---
  const handleAnalyze = useCallback(
    (url: string) => {
      if (!currentTab?.id) return;
      void chrome.runtime.sendMessage({
        type: 'ANALYZE',
        url,
        pageUrl: currentTab.url || '',
        pageTitle: currentTab.title || '',
        windowId: currentTab.windowId,
      });
    },
    [currentTab]
  );

  const handleSelectEntry = useCallback((id: string) => {
    setSelectedId(id);
    setView('summary');
  }, []);

  const handleDelete = useCallback(async (id: string) => {
    await deleteHistoryEntry(id);
    if (selectedId === id) {
      setSelectedId(null);
      setView('home');
    }
    await loadHistory();
  }, [selectedId, loadHistory]);

  const handleClear = useCallback(async () => {
    await clearHistory();
    setSelectedId(null);
    setView('home');
    await loadHistory();
  }, [loadHistory]);

  const dismissError = useCallback(() => {
    setActiveAnalysis(null);
    void chrome.storage.local.set({ activeAnalysis: null });
  }, []);

  const openOptions = useCallback(() => {
    void chrome.runtime.openOptionsPage();
  }, []);

  const selectedEntry = history.find((h) => h.id === selectedId) ?? null;

  // Split links into new vs already-analyzed
  const historyUrls = new Set(history.map((h) => h.url));
  const newLinks = links.filter((l) => !historyUrls.has(l.url));
  const analyzedLinks = links
    .filter((l) => historyUrls.has(l.url))
    .map((l) => ({ link: l, entry: history.find((h) => h.url === l.url)! }));

  // --- Render ---
  return (
    <div className="flex h-screen flex-col">
      <header className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
        <div className="flex items-center gap-2">
          {view === 'summary' && (
            <button
              onClick={() => setView('home')}
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
        <Button variant="ghost" size="icon" onPress={openOptions} aria-label="Open settings">
          <Settings size={18} aria-hidden="true" />
        </Button>
      </header>

      <div className="flex-1 overflow-y-auto">
        {/* Loading / error from active analysis */}
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

        {/* Summary view */}
        {!activeAnalysis && view === 'summary' && selectedEntry && (
          <div className="p-4">
            <SummaryView entry={selectedEntry} />
          </div>
        )}

        {/* Home view: detected links + history */}
        {!activeAnalysis && view === 'home' && (
          <div className="flex flex-col gap-4 p-4">
            {/* New links to analyze */}
            {newLinks.length > 0 && (
              <section>
                <h2 className="mb-3 text-sm font-semibold text-gray-700">
                  Found on this page
                </h2>
                <ul className="flex flex-col gap-2">
                  {newLinks.map((link) => (
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

            {/* Already analyzed links on this page */}
            {analyzedLinks.length > 0 && (
              <section>
                <h2 className="mb-3 text-sm font-semibold text-gray-700">
                  Already analyzed
                </h2>
                <ul className="flex flex-col gap-2">
                  {analyzedLinks.map(({ link, entry: e }) => (
                    <li
                      key={link.url}
                      className="rounded-lg border border-gray-200 p-3 flex flex-col gap-2"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-sm font-medium" title={link.text}>
                          {link.text || 'Terms of Service'}
                        </span>
                        <span className="text-xs text-gray-400">
                          {new Date(e.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="secondary"
                          onPress={() => handleSelectEntry(e.id)}
                          className="flex-1"
                        >
                          View Summary
                        </Button>
                        <Button
                          variant="ghost"
                          onPress={() => handleAnalyze(link.url)}
                          className="flex-1"
                        >
                          Re-analyze
                        </Button>
                      </div>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {links.length === 0 && (
              <div className="flex flex-col items-center gap-2 py-8 text-center text-sm text-gray-500">
                <FileText size={24} aria-hidden="true" />
                <p>No Terms of Service links detected on this page.</p>
              </div>
            )}

            {/* History section */}
            {!loading && history.length > 0 && (
              <section className="border-t border-gray-200 pt-4">
                <button
                  onClick={() => setHistoryOpen((o) => !o)}
                  className="flex w-full items-center gap-2 text-sm font-semibold text-gray-700"
                >
                  {historyOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                  History ({history.length})
                </button>

                {historyOpen && (
                  <div className="mt-2">
                    <div className="mb-2 flex justify-end">
                      <Button variant="ghost" size="sm" onPress={handleClear}>
                        Clear all
                      </Button>
                    </div>
                    <ul className="flex flex-col gap-1">
                      {history.map((entry) => (
                        <li
                          key={entry.id}
                          className="group flex items-center justify-between gap-2 rounded-md p-2 text-sm hover:bg-gray-100"
                        >
                          <button
                            onClick={() => handleSelectEntry(entry.id)}
                            className="flex-1 truncate text-left"
                            title={entry.title}
                          >
                            {entry.title}
                          </button>
                          <span className="shrink-0 text-xs text-gray-400">
                            {new Date(entry.createdAt).toLocaleDateString()}
                          </span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="shrink-0 opacity-0 group-hover:opacity-100 focus:opacity-100"
                            onPress={() => handleDelete(entry.id)}
                            aria-label={`Delete ${entry.title}`}
                          >
                            <Trash2 size={14} aria-hidden="true" />
                          </Button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </section>
            )}

            {loading && (
              <div className="py-4">
                <Loading label="Loading..." />
              </div>
            )}

            {error && <ErrorMessage message={error} />}
          </div>
        )}
      </div>
    </div>
  );
}
