import type { ReactNode } from "react";

type BadgeTone = "neutral" | "success" | "warning" | "error" | "info";

interface BadgeProps {
  children: ReactNode;
  tone?: BadgeTone;
}

const tones: Record<BadgeTone, string> = {
  neutral: "bg-postpilot-soft text-postpilot-secondary",
  success: "bg-green-50 text-green-800",
  warning: "bg-amber-50 text-amber-800",
  error: "bg-red-50 text-red-800",
  info: "bg-slate-100 text-slate-700",
};

export function Badge({ children, tone = "neutral" }: BadgeProps) {
  return (
    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${tones[tone]}`}>
      {children}
    </span>
  );
}
