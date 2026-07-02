import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState, useCallback, useRef } from 'react';
import { SummaryView } from '../components/SummaryView';
import { Button } from '../components/ui/Button';
import { Loading } from '../components/ui/Loading';
import { ErrorMessage } from '../components/ui/ErrorMessage';
import { Badge } from '../components/ui/Badge';
import { getHistory, deleteHistoryEntry, clearHistory } from '../shared/storage';
import { Settings, FileText, ChevronDown, ChevronRight, Trash2, ArrowLeft } from 'lucide-react';
export function SidePanelApp() {
    const [view, setView] = useState('home');
    const [links, setLinks] = useState([]);
    const [currentTab, setCurrentTab] = useState(null);
    const [history, setHistory] = useState([]);
    const [selectedId, setSelectedId] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeAnalysis, setActiveAnalysis] = useState(null);
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
            }
            else {
                setLinks([]);
            }
        }
        catch {
            setLinks([]);
        }
    }, []);
    useEffect(() => {
        void loadLinks();
        const onActivated = () => { void loadLinks(); };
        const onUpdated = (_tabId, changeInfo) => {
            if (changeInfo.status === 'complete')
                void loadLinks();
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
        }
        catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load history');
        }
        finally {
            setLoading(false);
        }
    }, []);
    useEffect(() => {
        void loadHistory();
        chrome.storage.local.get('activeAnalysis').then((result) => {
            const value = result.activeAnalysis ?? null;
            setActiveAnalysis(value);
            wasAnalyzingRef.current = value?.status === 'loading';
        });
        const handleStorageChange = (changes) => {
            if (changes.history) {
                void loadHistory();
            }
            if (changes.activeAnalysis) {
                const newValue = changes.activeAnalysis.newValue ?? null;
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
    const handleAnalyze = useCallback((url) => {
        if (!currentTab?.id)
            return;
        void chrome.runtime.sendMessage({
            type: 'ANALYZE',
            url,
            pageUrl: currentTab.url || '',
            pageTitle: currentTab.title || '',
            windowId: currentTab.windowId,
        });
    }, [currentTab]);
    const handleSelectEntry = useCallback((id) => {
        setSelectedId(id);
        setView('summary');
    }, []);
    const handleDelete = useCallback(async (id) => {
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
    // --- Render ---
    return (_jsxs("div", { className: "flex h-screen flex-col", children: [_jsxs("header", { className: "flex items-center justify-between border-b border-gray-200 px-4 py-3", children: [_jsxs("div", { className: "flex items-center gap-2", children: [view === 'summary' && (_jsx("button", { onClick: () => setView('home'), className: "rounded p-1 text-gray-600 hover:bg-gray-100 hover:text-gray-900", "aria-label": "Back to home", children: _jsx(ArrowLeft, { size: 18 }) })), _jsxs("h1", { className: "flex items-center gap-2 text-base font-semibold", children: [_jsx(FileText, { size: 18, "aria-hidden": "true" }), "Read Terms For Me"] })] }), _jsx(Button, { variant: "ghost", size: "icon", onPress: openOptions, "aria-label": "Open settings", children: _jsx(Settings, { size: 18, "aria-hidden": "true" }) })] }), _jsxs("div", { className: "flex-1 overflow-y-auto", children: [activeAnalysis?.status === 'loading' && (_jsx("div", { className: "flex items-center justify-center py-16", children: _jsx(Loading, { label: "Analyzing Terms of Service..." }) })), activeAnalysis?.status === 'error' && (_jsxs("div", { className: "flex flex-col items-center justify-center gap-4 px-4 py-16 text-center", children: [_jsx(ErrorMessage, { message: activeAnalysis.message ?? 'Analysis failed' }), _jsx(Button, { variant: "secondary", size: "sm", onPress: dismissError, children: "Dismiss" })] })), !activeAnalysis && view === 'summary' && selectedEntry && (_jsx("div", { className: "p-4", children: _jsx(SummaryView, { entry: selectedEntry }) })), !activeAnalysis && view === 'home' && (_jsxs("div", { className: "flex flex-col gap-4 p-4", children: [links.length > 0 ? (_jsxs("section", { children: [_jsx("h2", { className: "mb-3 text-sm font-semibold text-gray-700", children: "Found on this page" }), _jsx("ul", { className: "flex flex-col gap-2", children: links.map((link) => (_jsxs("li", { className: "rounded-lg border border-gray-200 p-3 flex flex-col gap-2", children: [_jsxs("div", { className: "flex items-start justify-between gap-2", children: [_jsx("span", { className: "text-sm font-medium", title: link.text, children: link.text || 'Terms of Service' }), _jsxs(Badge, { variant: "secondary", children: ["Score: ", link.score] })] }), _jsx("p", { className: "text-xs text-gray-500 break-all", title: link.url, children: link.url }), _jsx(Button, { onPress: () => handleAnalyze(link.url), className: "w-full", children: "Summarize" })] }, link.url))) })] })) : (_jsxs("div", { className: "flex flex-col items-center gap-2 py-8 text-center text-sm text-gray-500", children: [_jsx(FileText, { size: 24, "aria-hidden": "true" }), _jsx("p", { children: "No Terms of Service links detected on this page." })] })), !loading && history.length > 0 && (_jsxs("section", { className: "border-t border-gray-200 pt-4", children: [_jsxs("button", { onClick: () => setHistoryOpen((o) => !o), className: "flex w-full items-center gap-2 text-sm font-semibold text-gray-700", children: [historyOpen ? _jsx(ChevronDown, { size: 16 }) : _jsx(ChevronRight, { size: 16 }), "History (", history.length, ")"] }), historyOpen && (_jsxs("div", { className: "mt-2", children: [_jsx("div", { className: "mb-2 flex justify-end", children: _jsx(Button, { variant: "ghost", size: "sm", onPress: handleClear, children: "Clear all" }) }), _jsx("ul", { className: "flex flex-col gap-1", children: history.map((entry) => (_jsxs("li", { className: "group flex items-center justify-between gap-2 rounded-md p-2 text-sm hover:bg-gray-100", children: [_jsx("button", { onClick: () => handleSelectEntry(entry.id), className: "flex-1 truncate text-left", title: entry.title, children: entry.title }), _jsx("span", { className: "shrink-0 text-xs text-gray-400", children: new Date(entry.createdAt).toLocaleDateString() }), _jsx(Button, { variant: "ghost", size: "icon", className: "shrink-0 opacity-0 group-hover:opacity-100 focus:opacity-100", onPress: () => handleDelete(entry.id), "aria-label": `Delete ${entry.title}`, children: _jsx(Trash2, { size: 14, "aria-hidden": "true" }) })] }, entry.id))) })] }))] })), loading && (_jsx("div", { className: "py-4", children: _jsx(Loading, { label: "Loading..." }) })), error && _jsx(ErrorMessage, { message: error })] }))] })] }));
}
