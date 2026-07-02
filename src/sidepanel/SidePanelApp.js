import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState, useCallback } from 'react';
import { SummaryView } from '../components/SummaryView';
import { HistoryList } from '../components/HistoryList';
import { Button } from '../components/ui/Button';
import { Loading } from '../components/ui/Loading';
import { ErrorMessage } from '../components/ui/ErrorMessage';
import { getHistory, deleteHistoryEntry, clearHistory } from '../shared/storage';
export function SidePanelApp() {
    const [history, setHistory] = useState([]);
    const [selectedId, setSelectedId] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const loadHistory = useCallback(async () => {
        try {
            const entries = await getHistory();
            setHistory(entries);
            if (entries.length > 0 && !selectedId) {
                setSelectedId(entries[0].id);
            }
        }
        catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load history');
        }
        finally {
            setLoading(false);
        }
    }, [selectedId]);
    useEffect(() => {
        void loadHistory();
        const handleStorageChange = (changes) => {
            if (changes.history) {
                void loadHistory();
            }
        };
        chrome.storage.local.onChanged.addListener(handleStorageChange);
        return () => chrome.storage.local.onChanged.removeListener(handleStorageChange);
    }, [loadHistory]);
    const handleDelete = useCallback(async (id) => {
        await deleteHistoryEntry(id);
        if (selectedId === id) {
            setSelectedId(null);
        }
        await loadHistory();
    }, [selectedId, loadHistory]);
    const handleClear = useCallback(async () => {
        await clearHistory();
        setSelectedId(null);
        await loadHistory();
    }, [loadHistory]);
    const selectedEntry = history.find((h) => h.id === selectedId) ?? history[0];
    return (_jsxs("div", { className: "flex h-screen flex-col", children: [_jsxs("header", { className: "border-b border-gray-200 p-4", children: [_jsx("h1", { className: "text-lg font-semibold", children: "Read Terms For Me" }), _jsx("p", { className: "text-sm text-gray-600", children: "Your Terms of Service summaries and analysis" })] }), _jsxs("div", { className: "flex flex-1 overflow-hidden", children: [_jsxs("aside", { className: "w-64 border-r border-gray-200 bg-gray-50 flex flex-col", children: [_jsxs("div", { className: "flex items-center justify-between p-3 border-b border-gray-200", children: [_jsx("h2", { className: "text-sm font-semibold", children: "History" }), history.length > 0 && (_jsx(Button, { variant: "ghost", size: "sm", onPress: handleClear, children: "Clear" }))] }), _jsx("div", { className: "flex-1 overflow-y-auto p-2 scrollbar-thin", children: loading ? (_jsx(Loading, { label: "Loading history..." })) : error ? (_jsx(ErrorMessage, { message: error })) : (_jsx(HistoryList, { entries: history, selectedId: selectedId, onSelect: setSelectedId, onDelete: handleDelete })) })] }), _jsx("main", { className: "flex-1 overflow-y-auto p-4 scrollbar-thin", children: selectedEntry ? (_jsx(SummaryView, { entry: selectedEntry })) : (_jsx("div", { className: "flex h-full items-center justify-center text-gray-500", children: _jsx("p", { children: "No summaries yet. Visit a page with a Terms of Service link and click Summarize." }) })) })] })] }));
}
