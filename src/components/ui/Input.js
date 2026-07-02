import { jsx as _jsx } from "react/jsx-runtime";
import { forwardRef } from 'react';
export const Input = forwardRef(({ onChange, ...props }, ref) => {
    return (_jsx("input", { ref: ref, className: "w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary", onChange: (e) => onChange?.(e.target.value), ...props }));
});
Input.displayName = 'Input';
