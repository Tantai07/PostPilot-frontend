import type { ReactNode } from "react";
import { LogOut } from "lucide-react";
import type { Profile, User, WorkspaceTabKey } from "../../types/postpilot";
import { ProfileAvatar } from "../profile/ProfileAvatar";
import { Button } from "../ui/Button";
import { WorkspaceTabs } from "../navigation/WorkspaceTabs";

interface AppLayoutProps {
  activeTab: WorkspaceTabKey;
  children: ReactNode;
  onProfileChange: () => void;
  onLogout: () => void;
  onTabChange: (tab: WorkspaceTabKey) => void;
  profile: Profile;
  user: User;
}

export function AppLayout({
  activeTab,
  children,
  onProfileChange,
  onLogout,
  onTabChange,
  profile,
  user,
}: AppLayoutProps) {
  return (
    <div className="min-h-screen bg-postpilot-background">
      <header className="border-b border-postpilot-borderSoft bg-postpilot-background">
        <div className="mx-auto max-w-[1100px] px-5 py-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex items-start gap-4">
              <ProfileAvatar avatarUrl={profile.avatarUrl} name={profile.name} />
              <div>
                <p className="text-sm text-postpilot-secondary">PostPilot</p>
                <h1 className="mt-1 text-3xl font-semibold tracking-normal text-postpilot-text">{profile.name}</h1>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-postpilot-secondary">{profile.goal}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="hidden text-right text-sm sm:block">
                <p className="font-medium text-postpilot-text">{user.name}</p>
                <p className="text-postpilot-secondary">{user.email}</p>
              </div>
              <Button onClick={onProfileChange} variant="secondary">
                เปลี่ยนโปรไฟล์
              </Button>
              <Button className="gap-2" onClick={onLogout} variant="ghost">
                <LogOut aria-hidden="true" size={17} />
                ออกจากระบบ
              </Button>
            </div>
          </div>
          <div className="mt-6">
            <WorkspaceTabs activeTab={activeTab} onTabChange={onTabChange} />
          </div>
        </div>
      </header>
      <main className={`mx-auto w-full px-5 py-8 ${activeTab === "create-post" ? "max-w-[1440px]" : "max-w-[1100px]"}`}>{children}</main>
    </div>
  );
}
