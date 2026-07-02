import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Button } from './ui/Button';
import { Trash2 } from 'lucide-react';
export function HistoryList({ entries, selectedId, onSelect, onDelete }) {
    if (entries.length === 0) {
        return _jsx("p", { className: "p-2 text-sm text-gray-600", children: "No summaries yet." });
    }
    return (_jsx("ul", { className: "flex flex-col gap-1", role: "listbox", "aria-label": "Summary history", children: entries.map((entry) => (_jsxs("li", { role: "option", "aria-selected": selectedId === entry.id, className: `group flex items-center justify-between gap-2 rounded-md p-2 text-sm transition-colors ${selectedId === entry.id ? 'bg-primary text-primary-foreground' : 'hover:bg-gray-200'}`, children: [_jsx("button", { onClick: () => onSelect(entry.id), className: "flex-1 truncate text-left", title: entry.title, children: entry.title }), _jsx(Button, { variant: "ghost", size: "icon", className: "shrink-0 opacity-0 group-hover:opacity-100 focus:opacity-100", onPress: () => onDelete(entry.id), "aria-label": `Delete ${entry.title}`, children: _jsx(Trash2, { size: 14, "aria-hidden": "true" }) })] }, entry.id))) }));
}
