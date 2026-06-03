import type { ReactNode } from "react";

interface AuthLayoutProps {
  children: ReactNode;
}

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <main className="min-h-screen bg-postpilot-background px-5 py-10">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-[420px] items-center">
        <div className="w-full">{children}</div>
      </div>
    </main>
  );
}
