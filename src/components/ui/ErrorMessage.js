import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { AlertCircle } from 'lucide-react';
export function ErrorMessage({ message }) {
    return (_jsxs("div", { className: "flex items-start gap-2 rounded-md bg-red-50 p-3 text-sm text-red-800", role: "alert", "aria-live": "assertive", children: [_jsx(AlertCircle, { size: 18, "aria-hidden": "true", className: "mt-0.5 shrink-0" }), _jsx("span", { className: "whitespace-pre-wrap", children: message })] }));
}
