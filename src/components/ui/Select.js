import { jsx as _jsx } from "react/jsx-runtime";
export function Select({ id, value, onChange, options }) {
    return (_jsx("select", { id: id, value: value, onChange: (e) => onChange(e.target.value), className: "w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary", children: options.map((option) => (_jsx("option", { value: option.value, children: option.label }, option.value))) }));
}
