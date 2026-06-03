import { useMemo, useState } from "react";
import { AppLayout } from "./components/layout/AppLayout";
import { mockProfiles, mockUser } from "./data/mockData";
import { CategoriesPage } from "./pages/CategoriesPage";
import { CreatePostPage } from "./pages/CreatePostPage";
import { CreateProfilePage } from "./pages/CreateProfilePage";
import { DashboardPage } from "./pages/DashboardPage";
import { LoginPage } from "./pages/LoginPage";
import { PostHistoryPage } from "./pages/PostHistoryPage";
import { ProfileSelectPage } from "./pages/ProfileSelectPage";
import { ProfileSettingsPage } from "./pages/ProfileSettingsPage";
import { QueuePage } from "./pages/QueuePage";
import type { Profile, WorkspaceTabKey } from "./types/postpilot";

type AppRoute = "login" | "profile-select" | "create-profile" | "workspace";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [route, setRoute] = useState<AppRoute>("login");
  const [activeTab, setActiveTab] = useState<WorkspaceTabKey>("dashboard");
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);

  const profiles = useMemo(() => mockProfiles, []);

  const openWorkspace = (profile: Profile) => {
    setSelectedProfile(profile);
    setActiveTab("dashboard");
    setRoute("workspace");
  };

  const createProfile = (profile: Profile) => {
    openWorkspace(profile);
  };

  if (!isAuthenticated || route === "login") {
    return (
      <LoginPage
        onLogin={() => {
          setIsAuthenticated(true);
          setRoute("profile-select");
        }}
      />
    );
  }

  if (route === "profile-select") {
    return (
      <ProfileSelectPage
        onCreateProfile={() => setRoute("create-profile")}
        onSelectProfile={openWorkspace}
        profiles={profiles}
      />
    );
  }

  if (route === "create-profile") {
    return (
      <CreateProfilePage
        onCancel={() => setRoute("profile-select")}
        onCreateProfile={createProfile}
      />
    );
  }

  if (!selectedProfile) {
    return (
      <ProfileSelectPage
        onCreateProfile={() => setRoute("create-profile")}
        onSelectProfile={openWorkspace}
        profiles={profiles}
      />
    );
  }

  return (
    <AppLayout
      activeTab={activeTab}
      onProfileChange={() => {
        setSelectedProfile(null);
        setRoute("profile-select");
      }}
      onTabChange={setActiveTab}
      profile={selectedProfile}
      user={mockUser}
    >
      {activeTab === "dashboard" ? <DashboardPage /> : null}
      {activeTab === "create-post" ? <CreatePostPage /> : null}
      {activeTab === "queue" ? <QueuePage /> : null}
      {activeTab === "post-history" ? <PostHistoryPage /> : null}
      {activeTab === "categories" ? <CategoriesPage /> : null}
      {activeTab === "profile-settings" ? (
        <ProfileSettingsPage profile={selectedProfile} />
      ) : null}
    </AppLayout>
  );
}

export default App;
