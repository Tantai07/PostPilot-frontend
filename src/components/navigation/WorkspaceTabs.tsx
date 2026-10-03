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
  { key: "dashboard", label: "ภาพรวม" },
  { key: "create-post", label: "สร้างโพสต์" },
  { key: "drafts", label: "แบบร่าง" },
  { key: "queue", label: "คิวโพสต์" },
  { key: "post-history", label: "ประวัติโพสต์" },
  { key: "categories", label: "หมวดหมู่" },
  { key: "profile-settings", label: "ตั้งค่าโปรไฟล์" },
];

export function WorkspaceTabs({ activeTab, onTabChange }: WorkspaceTabsProps) {
  return (
    <nav aria-label="เมนูพื้นที่ทำงาน" className="overflow-x-auto border-b border-postpilot-border">
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
