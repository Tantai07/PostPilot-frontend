import type { ButtonHTMLAttributes, ReactNode } from "react";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: ButtonVariant;
}

const variants: Record<ButtonVariant, string> = {
  primary: "bg-postpilot-accent text-white hover:bg-postpilot-accentHover",
  secondary:
    "border border-postpilot-border bg-white text-postpilot-text hover:bg-postpilot-soft",
  ghost: "text-postpilot-secondary hover:bg-postpilot-soft hover:text-postpilot-text",
  danger: "bg-red-50 text-red-800 hover:bg-red-100",
};

export function Button({
  children,
  className = "",
  variant = "primary",
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      className={`inline-flex min-h-11 items-center justify-center rounded-xl px-4 py-2 text-sm font-medium transition ${variants[variant]} disabled:cursor-not-allowed disabled:opacity-60 ${className}`}
      type={type}
      {...props}
    >
      {children}
    </button>
  );
}
