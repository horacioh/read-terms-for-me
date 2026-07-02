import { jsx as _jsx } from "react/jsx-runtime";
export function Label({ children, htmlFor }) {
    return (_jsx("label", { htmlFor: htmlFor, className: "text-sm font-medium text-gray-700", children: children }));
}
