import { useEffect, useState, useCallback } from 'react';
import { Button } from '../components/ui/Button';
import { Loading } from '../components/ui/Loading';
import { ErrorMessage } from '../components/ui/ErrorMessage';
import { Badge } from '../components/ui/Badge';
import { Settings, FileText, AlertCircle } from 'lucide-react';
import type { DetectedLink } from '../shared/types';

export function PopupApp() {
  const [links, setLinks] = useState<DetectedLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [analyzingUrl, setAnalyzingUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<chrome.tabs.Tab | null>(null);

  useEffect(() => {
    async function init() {
      try {
        const [currentTab] = await chrome.tabs.query({ active: true, currentWindow: true });
        if (!currentTab?.id) {
          setError('No active tab found.');
          setLoading(false);
          return;
        }
        setTab(currentTab);

        const response = await chrome.tabs.sendMessage(currentTab.id, { type: 'GET_DETECTED_LINKS' });
        if (response?.type === 'DETECTED_LINKS') {
          setLinks(response.links);
        }
      } catch (err) {
        setError('Could not communicate with this page. Try refreshing the page.');
      } finally {
        setLoading(false);
      }
    }
    void init();
  }, []);

  const handleAnalyze = useCallback(
    (url: string) => {
      if (!tab?.id) return;
      setAnalyzingUrl(url);
      setError(null);

      try {
        void chrome.runtime.sendMessage({
          type: 'ANALYZE',
          url,
          pageUrl: tab.url || '',
          pageTitle: tab.title || '',
          windowId: tab.windowId,
        });
        window.close();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Analysis failed');
        setAnalyzingUrl(null);
      }
    },
    [tab]
  );

  const openOptions = useCallback(() => {
    void chrome.runtime.openOptionsPage();
  }, []);

  if (loading) {
    return (
      <div className="w-80 p-4 flex items-center justify-center min-h-[180px]">
        <Loading label="Scanning page..." />
      </div>
    );
  }

  return (
    <div className="w-80 p-4 flex flex-col gap-3">
      <header className="flex items-center justify-between">
        <h1 className="text-base font-semibold flex items-center gap-2">
          <FileText size={18} aria-hidden="true" />
          Read Terms For Me
        </h1>
        <Button variant="ghost" size="icon" onPress={openOptions} aria-label="Open settings">
          <Settings size={18} aria-hidden="true" />
        </Button>
      </header>

      {error && <ErrorMessage message={error} />}

      {links.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-6 text-center text-sm text-gray-600">
          <AlertCircle size={24} aria-hidden="true" />
          <p>No Terms of Service link detected on this page.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          <p className="text-sm text-gray-600">
            Found {links.length} candidate{links.length === 1 ? '' : 's'}:
          </p>
          <ul className="flex flex-col gap-2" role="list">
            {links.map((link) => (
              <li
                key={link.url}
                className="rounded-lg border border-gray-200 p-2 flex flex-col gap-2"
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="text-sm font-medium truncate" title={link.text}>
                    {link.text || 'Terms of Service'}
                  </span>
                  <Badge variant="secondary">Score: {link.score}</Badge>
                </div>
                <p className="text-xs text-gray-500 truncate" title={link.url}>
                  {link.url}
                </p>
                <Button
                  onPress={() => handleAnalyze(link.url)}
                  isPending={analyzingUrl === link.url}
                  className="w-full"
                >
                  {analyzingUrl === link.url ? 'Analyzing...' : 'Summarize'}
                </Button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
