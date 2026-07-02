import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState, useCallback } from 'react';
import { Button } from '../components/ui/Button';
import { Loading } from '../components/ui/Loading';
import { ErrorMessage } from '../components/ui/ErrorMessage';
import { Badge } from '../components/ui/Badge';
import { Settings, FileText, AlertCircle } from 'lucide-react';
export function PopupApp() {
    const [links, setLinks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [analyzingUrl, setAnalyzingUrl] = useState(null);
    const [error, setError] = useState(null);
    const [tab, setTab] = useState(null);
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
            }
            catch (err) {
                setError('Could not communicate with this page. Try refreshing the page.');
            }
            finally {
                setLoading(false);
            }
        }
        void init();
    }, []);
    const handleAnalyze = useCallback((url) => {
        if (!tab?.id)
            return;
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
        }
        catch (err) {
            setError(err instanceof Error ? err.message : 'Analysis failed');
            setAnalyzingUrl(null);
        }
    }, [tab]);
    const openOptions = useCallback(() => {
        void chrome.runtime.openOptionsPage();
    }, []);
    if (loading) {
        return (_jsx("div", { className: "w-80 p-4 flex items-center justify-center min-h-[180px]", children: _jsx(Loading, { label: "Scanning page..." }) }));
    }
    return (_jsxs("div", { className: "w-80 p-4 flex flex-col gap-3", children: [_jsxs("header", { className: "flex items-center justify-between", children: [_jsxs("h1", { className: "text-base font-semibold flex items-center gap-2", children: [_jsx(FileText, { size: 18, "aria-hidden": "true" }), "Read Terms For Me"] }), _jsx(Button, { variant: "ghost", size: "icon", onPress: openOptions, "aria-label": "Open settings", children: _jsx(Settings, { size: 18, "aria-hidden": "true" }) })] }), error && _jsx(ErrorMessage, { message: error }), links.length === 0 ? (_jsxs("div", { className: "flex flex-col items-center gap-2 py-6 text-center text-sm text-gray-600", children: [_jsx(AlertCircle, { size: 24, "aria-hidden": "true" }), _jsx("p", { children: "No Terms of Service link detected on this page." })] })) : (_jsxs("div", { className: "flex flex-col gap-2", children: [_jsxs("p", { className: "text-sm text-gray-600", children: ["Found ", links.length, " candidate", links.length === 1 ? '' : 's', ":"] }), _jsx("ul", { className: "flex flex-col gap-2", role: "list", children: links.map((link) => (_jsxs("li", { className: "rounded-lg border border-gray-200 p-2 flex flex-col gap-2", children: [_jsxs("div", { className: "flex items-start justify-between gap-2", children: [_jsx("span", { className: "text-sm font-medium truncate", title: link.text, children: link.text || 'Terms of Service' }), _jsxs(Badge, { variant: "secondary", children: ["Score: ", link.score] })] }), _jsx("p", { className: "text-xs text-gray-500 truncate", title: link.url, children: link.url }), _jsx(Button, { onPress: () => handleAnalyze(link.url), isPending: analyzingUrl === link.url, className: "w-full", children: analyzingUrl === link.url ? 'Analyzing...' : 'Summarize' })] }, link.url))) })] }))] }));
}
