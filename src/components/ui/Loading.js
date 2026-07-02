import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Loader2 } from 'lucide-react';
export function Loading({ label }) {
    return (_jsxs("div", { className: "flex items-center gap-2 text-sm text-gray-600", role: "status", "aria-live": "polite", children: [_jsx(Loader2, { size: 18, className: "animate-spin", "aria-hidden": "true" }), label && _jsx("span", { children: label }), _jsx("span", { className: "sr-only", children: "Loading" })] }));
}
