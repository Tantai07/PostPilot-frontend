import { useCallback, useState } from "react";
import {
  createProfile as createProfileRequest,
  listProfiles,
  login,
  type AuthSession,
  type CreateProfileInput,
} from "./api/postpilotApi";
import { AppLayout } from "./components/layout/AppLayout";
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
  const [session, setSession] = useState<AuthSession | null>(null);
  const [route, setRoute] = useState<AppRoute>("login");
  const [activeTab, setActiveTab] = useState<WorkspaceTabKey>("dashboard");
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [profilesError, setProfilesError] = useState<string | null>(null);
  const [createProfileError, setCreateProfileError] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isLoadingProfiles, setIsLoadingProfiles] = useState(false);
  const [isCreatingProfile, setIsCreatingProfile] = useState(false);

  const loadProfiles = useCallback(async (activeSession: AuthSession) => {
    setIsLoadingProfiles(true);
    setProfilesError(null);

    try {
      setProfiles(await listProfiles(activeSession));
    } catch (error) {
      setProfilesError(error instanceof Error ? error.message : "Could not load profiles.");
    } finally {
      setIsLoadingProfiles(false);
    }
  }, []);

  const handleLogin = async (credentials: { email: string; password: string }) => {
    setIsLoggingIn(true);
    setLoginError(null);

    try {
      const nextSession = await login(credentials.email, credentials.password);
      setSession(nextSession);
      setRoute("profile-select");
      await loadProfiles(nextSession);
    } catch (error) {
      setLoginError(error instanceof Error ? error.message : "Could not sign in.");
    } finally {
      setIsLoggingIn(false);
    }
  };

  const openWorkspace = (profile: Profile) => {
    setSelectedProfile(profile);
    setActiveTab("dashboard");
    setRoute("workspace");
  };

  const createProfile = async (input: CreateProfileInput) => {
    if (!session) {
      setRoute("login");
      return;
    }

    setIsCreatingProfile(true);
    setCreateProfileError(null);

    try {
      const profile = await createProfileRequest(session, input);
      setProfiles((currentProfiles) => [...currentProfiles, profile]);
      openWorkspace(profile);
    } catch (error) {
      setCreateProfileError(error instanceof Error ? error.message : "Could not create profile.");
    } finally {
      setIsCreatingProfile(false);
    }
  };

  if (!session || route === "login") {
    return (
      <LoginPage
        errorMessage={loginError}
        isLoading={isLoggingIn}
        onLogin={handleLogin}
      />
    );
  }

  if (route === "profile-select") {
    return (
      <ProfileSelectPage
        errorMessage={profilesError}
        isLoading={isLoadingProfiles}
        onCreateProfile={() => setRoute("create-profile")}
        onRetry={() => loadProfiles(session)}
        onSelectProfile={openWorkspace}
        profiles={profiles}
      />
    );
  }

  if (route === "create-profile") {
    return (
      <CreateProfilePage
        errorMessage={createProfileError}
        isLoading={isCreatingProfile}
        onCancel={() => setRoute("profile-select")}
        onCreateProfile={createProfile}
      />
    );
  }

  if (!selectedProfile) {
    return (
      <ProfileSelectPage
        errorMessage={profilesError}
        isLoading={isLoadingProfiles}
        onCreateProfile={() => setRoute("create-profile")}
        onRetry={() => loadProfiles(session)}
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
      user={session.user}
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
