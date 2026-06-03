import type { ReactNode } from "react";
import { Card } from "./Card";

interface EmptyStateProps {
  title: string;
  description: string;
  action?: ReactNode;
}

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <Card className="py-10 text-center">
      <h2 className="text-xl font-semibold text-postpilot-text">{title}</h2>
      <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-postpilot-secondary">
        {description}
      </p>
      {action ? <div className="mt-6">{action}</div> : null}
    </Card>
  );
}
