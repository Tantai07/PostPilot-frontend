import { useCallback, useEffect, useState } from "react";
import {
  createProfile as createProfileRequest,
  deleteProfile as deleteProfileRequest,
  listProfiles,
  login,
  logout,
  restoreSession,
  updateProfile as updateProfileRequest,
  type AuthSession,
  type CreateProfileInput,
  type UpdateProfileInput,
} from "./api/postpilotApi";
import { AppLayout } from "./components/layout/AppLayout";
import { CategoriesPage } from "./pages/CategoriesPage";
import { CreatePostPage } from "./pages/CreatePostPage";
import { CreateProfilePage } from "./pages/CreateProfilePage";
import { DashboardPage } from "./pages/DashboardPage";
import { DraftsPage } from "./pages/DraftsPage";
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
  const [isRestoringSession, setIsRestoringSession] = useState(true);
  const [startProfileSettingsInEditMode, setStartProfileSettingsInEditMode] = useState(false);

  const loadProfiles = useCallback(async (activeSession: AuthSession) => {
    setIsLoadingProfiles(true);
    setProfilesError(null);

    try {
      setProfiles(await listProfiles(activeSession));
    } catch (error) {
      setProfilesError(error instanceof Error ? error.message : "ไม่สามารถโหลดรายการโปรไฟล์ได้");
    } finally {
      setIsLoadingProfiles(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function restoreExistingSession() {
      try {
        const restoredSession = await restoreSession();
        if (!isMounted) return;

        setSession(restoredSession);
        setRoute("profile-select");
        await loadProfiles(restoredSession);
      } catch {
        if (isMounted) {
          setSession(null);
          setRoute("login");
        }
      } finally {
        if (isMounted) setIsRestoringSession(false);
      }
    }

    restoreExistingSession();
    return () => { isMounted = false; };
  }, [loadProfiles]);

  const handleLogin = async (credentials: { email: string; password: string }) => {
    setIsLoggingIn(true);
    setLoginError(null);

    try {
      const nextSession = await login(credentials.email, credentials.password);
      setSession(nextSession);
      setRoute("profile-select");
      await loadProfiles(nextSession);
    } catch (error) {
      setLoginError(error instanceof Error ? error.message : "ไม่สามารถเข้าสู่ระบบได้");
    } finally {
      setIsLoggingIn(false);
    }
  };

  const openWorkspace = (profile: Profile) => {
    setSelectedProfile(profile);
    setStartProfileSettingsInEditMode(false);
    setActiveTab("dashboard");
    setRoute("workspace");
  };

  const editProfile = (profile: Profile) => {
    setSelectedProfile(profile);
    setStartProfileSettingsInEditMode(true);
    setActiveTab("profile-settings");
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
      setCreateProfileError(error instanceof Error ? error.message : "ไม่สามารถสร้างโปรไฟล์ได้");
    } finally {
      setIsCreatingProfile(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
    } finally {
      setSession(null);
      setSelectedProfile(null);
      setProfiles([]);
      setRoute("login");
    }
  };

  const updateProfile = async (input: UpdateProfileInput) => {
    if (!session || !selectedProfile) {
      throw new Error("ไม่พบโปรไฟล์ที่ต้องการแก้ไข");
    }

    const updatedProfile = await updateProfileRequest(session, selectedProfile.id, input);
    setProfiles((currentProfiles) => currentProfiles.map((profile) => (
      profile.id === updatedProfile.id ? updatedProfile : profile
    )));
    setSelectedProfile(updatedProfile);
    setStartProfileSettingsInEditMode(false);
  };

  const deleteProfile = async (profile: Profile) => {
    if (!session) throw new Error("กรุณาเข้าสู่ระบบอีกครั้ง");
    await deleteProfileRequest(session, profile.id);
    setProfiles((currentProfiles) => currentProfiles.filter((item) => item.id !== profile.id));
    if (selectedProfile?.id === profile.id) {
      setSelectedProfile(null);
      setRoute("profile-select");
    }
  };

  if (isRestoringSession) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-postpilot-background px-5">
        <p className="text-sm text-postpilot-secondary">กำลังตรวจสอบการเข้าสู่ระบบ...</p>
      </main>
    );
  }

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
        onEditProfile={editProfile}
        onDeleteProfile={deleteProfile}
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
        onEditProfile={editProfile}
        onDeleteProfile={deleteProfile}
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
      onLogout={handleLogout}
      onTabChange={(tab) => {
        setStartProfileSettingsInEditMode(false);
        setActiveTab(tab);
      }}
      profile={selectedProfile}
      user={session.user}
    >
      {activeTab === "dashboard" ? <DashboardPage profile={selectedProfile} session={session} /> : null}
        {activeTab === "create-post" ? <CreatePostPage key={`${selectedProfile.id}:${selectedProfile.platforms.join(",")}`} profile={selectedProfile} session={session} /> : null}
      {activeTab === "drafts" ? <DraftsPage profile={selectedProfile} session={session} /> : null}
      {activeTab === "queue" ? <QueuePage profile={selectedProfile} session={session} /> : null}
      {activeTab === "post-history" ? <PostHistoryPage profile={selectedProfile} session={session} /> : null}
      {activeTab === "categories" ? <CategoriesPage profile={selectedProfile} session={session} /> : null}
      {activeTab === "profile-settings" ? (
        <ProfileSettingsPage
          onUpdateProfile={updateProfile}
          onDeleteProfile={() => deleteProfile(selectedProfile)}
          profile={selectedProfile}
          session={session}
          startInEditMode={startProfileSettingsInEditMode}
        />
      ) : null}
    </AppLayout>
  );
}

export default App;
