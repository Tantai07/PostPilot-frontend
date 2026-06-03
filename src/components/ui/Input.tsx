import type { InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  hint?: string;
}

export function Input({ id, label, hint, className = "", ...props }: InputProps) {
  const inputId = id ?? label.toLowerCase().replace(/\s+/g, "-");

  return (
    <label className="block text-sm font-medium text-postpilot-text" htmlFor={inputId}>
      {label}
      <input
        id={inputId}
        className={`mt-2 min-h-12 w-full rounded-xl border border-postpilot-border bg-white px-4 text-postpilot-text outline-none transition placeholder:text-postpilot-muted focus:border-postpilot-accent focus:ring-4 focus:ring-[#1A3D2F]/10 ${className}`}
        {...props}
      />
      {hint ? <span className="mt-2 block text-xs text-postpilot-secondary">{hint}</span> : null}
    </label>
  );
}
