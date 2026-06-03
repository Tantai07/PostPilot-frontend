import type { WorkspaceTabKey } from "../../types/postpilot";

interface WorkspaceTab {
  key: WorkspaceTabKey;
  label: string;
}

interface WorkspaceTabsProps {
  activeTab: WorkspaceTabKey;
  onTabChange: (tab: WorkspaceTabKey) => void;
}

export const workspaceTabs: WorkspaceTab[] = [
  { key: "dashboard", label: "Dashboard" },
  { key: "create-post", label: "Create Post" },
  { key: "queue", label: "Queue" },
  { key: "post-history", label: "Post History" },
  { key: "categories", label: "Categories" },
  { key: "profile-settings", label: "Profile Settings" },
];

export function WorkspaceTabs({ activeTab, onTabChange }: WorkspaceTabsProps) {
  return (
    <nav aria-label="Workspace tabs" className="overflow-x-auto border-b border-postpilot-border">
      <div className="flex min-w-max gap-2">
        {workspaceTabs.map((tab) => {
          const isActive = tab.key === activeTab;

          return (
            <button
              aria-current={isActive ? "page" : undefined}
              className={`relative px-3 py-4 text-sm font-medium transition ${
                isActive
                  ? "text-postpilot-text"
                  : "text-postpilot-secondary hover:text-postpilot-text"
              }`}
              key={tab.key}
              onClick={() => onTabChange(tab.key)}
              type="button"
            >
              {tab.label}
              {isActive ? (
                <span className="absolute inset-x-3 bottom-0 h-0.5 rounded-full bg-postpilot-accent" />
              ) : null}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
