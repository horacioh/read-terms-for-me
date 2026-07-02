import { useEffect, useState, useCallback } from 'react';
import { SummaryView } from '../components/SummaryView';
import { HistoryList } from '../components/HistoryList';
import { Button } from '../components/ui/Button';
import { Loading } from '../components/ui/Loading';
import { ErrorMessage } from '../components/ui/ErrorMessage';
import { getHistory, deleteHistoryEntry, clearHistory } from '../shared/storage';
import type { HistoryEntry } from '../shared/types';

export function SidePanelApp() {
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadHistory = useCallback(async () => {
    try {
      const entries = await getHistory();
      setHistory(entries);
      if (entries.length > 0 && !selectedId) {
        setSelectedId(entries[0].id);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load history');
    } finally {
      setLoading(false);
    }
  }, [selectedId]);

  useEffect(() => {
    void loadHistory();

    const handleStorageChange = (changes: { [key: string]: chrome.storage.StorageChange }) => {
      if (changes.history) {
        void loadHistory();
      }
    };

    chrome.storage.local.onChanged.addListener(handleStorageChange);
    return () => chrome.storage.local.onChanged.removeListener(handleStorageChange);
  }, [loadHistory]);

  const handleDelete = useCallback(
    async (id: string) => {
      await deleteHistoryEntry(id);
      if (selectedId === id) {
        setSelectedId(null);
      }
      await loadHistory();
    },
    [selectedId, loadHistory]
  );

  const handleClear = useCallback(async () => {
    await clearHistory();
    setSelectedId(null);
    await loadHistory();
  }, [loadHistory]);

  const selectedEntry = history.find((h) => h.id === selectedId) ?? history[0];

  return (
    <div className="flex h-screen flex-col">
      <header className="border-b border-gray-200 p-4">
        <h1 className="text-lg font-semibold">Read Terms For Me</h1>
        <p className="text-sm text-gray-600">Your Terms of Service summaries and analysis</p>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <aside className="w-64 border-r border-gray-200 bg-gray-50 flex flex-col">
          <div className="flex items-center justify-between p-3 border-b border-gray-200">
            <h2 className="text-sm font-semibold">History</h2>
            {history.length > 0 && (
              <Button variant="ghost" size="sm" onPress={handleClear}>
                Clear
              </Button>
            )}
          </div>

          <div className="flex-1 overflow-y-auto p-2 scrollbar-thin">
            {loading ? (
              <Loading label="Loading history..." />
            ) : error ? (
              <ErrorMessage message={error} />
            ) : (
              <HistoryList
                entries={history}
                selectedId={selectedId}
                onSelect={setSelectedId}
                onDelete={handleDelete}
              />
            )}
          </div>
        </aside>

        <main className="flex-1 overflow-y-auto p-4 scrollbar-thin">
          {selectedEntry ? (
            <SummaryView entry={selectedEntry} />
          ) : (
            <div className="flex h-full items-center justify-center text-gray-500">
              <p>No summaries yet. Visit a page with a Terms of Service link and click Summarize.</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
