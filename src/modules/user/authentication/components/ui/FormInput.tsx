import React from "react";

export interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
label: string;
name: string;
error?: string;
hint?: string;
}

export const FormInput = React.forwardRef<HTMLInputElement, FormInputProps>(
({ label, name, error, hint, type = "text", className = "", ...rest }, ref) => {
const inputId = rest.id ?? name;
const describedBy = `${inputId}-hint`;
const errorId = `${inputId}-error`;

return (
    <div className="flex flex-col gap-2">
    <label htmlFor={inputId} className="text-sm font-medium text-gray-800 dark:text-gray-200">
        {label}
    </label>
    <input
        ref={ref}
        id={inputId}
        name={name}
        type={type}
        aria-label={label}
        aria-invalid={!!error}
        aria-describedby={`${hint ? describedBy : ""} ${error ? errorId : ""}`.trim() || undefined}
        className={`w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:placeholder-gray-500 ${className}`}
        {...rest}
    />
    {hint && (
        <p id={describedBy} className="text-xs text-gray-500 dark:text-gray-400">
        {hint}
        </p>
    )}
    {error && (
        <p id={errorId} className="text-xs text-red-600">
        {error}
        </p>
    )}
    </div>
);
}
);

FormInput.displayName = "FormInput";
