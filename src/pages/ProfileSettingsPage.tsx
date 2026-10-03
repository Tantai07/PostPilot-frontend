import { useCallback, useEffect, useState } from "react";
import { Link2, Pencil, Plus, Trash2, Unlink } from "lucide-react";
import {
  disconnectPlatform,
  getConnectionAuthorizationUrl,
  listConnections,
  type AuthSession,
  type ConnectionStatus,
  type UpdateProfileInput,
} from "../api/postpilotApi";
import { PlatformLogo, PlatformPicker } from "../components/profile/PlatformPicker";
import { ProfileAvatar } from "../components/profile/ProfileAvatar";
import { ProfileEditor } from "../components/profile/ProfileEditor";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { API_ORIGIN } from "../config/environment";
import type { Platform, Profile } from "../types/postpilot";

interface ProfileSettingsPageProps {
  onDeleteProfile: () => Promise<void>;
  onUpdateProfile: (input: UpdateProfileInput) => Promise<void>;
  profile: Profile;
  session: AuthSession;
  startInEditMode?: boolean;
}

const connectionDescriptions: Record<Platform, string> = {
  Facebook: "เชื่อมเพจสำหรับเผยแพร่โพสต์และติดตามผลการทำงาน",
  Instagram: "เชื่อมบัญชีสำหรับเผยแพร่โพสต์ รูปภาพ และสตอรี่",
  X: "เชื่อมบัญชีสำหรับเผยแพร่ข้อความและรูปภาพ",
  eBay: "เตรียมช่องทางสำหรับจัดการข้อมูลสินค้าที่ลงขายบน eBay",
  Etsy: "เตรียมช่องทางสำหรับจัดการสินค้าและงานทำมือบน Etsy",
  Lazada: "เชื่อมร้านเพื่อจัดการสินค้าและคำสั่งซื้อบน Lazada",
  Shopee: "เชื่อมร้านเพื่อจัดการสินค้าและคำสั่งซื้อบน Shopee",
  "TikTok Shop": "เชื่อมร้านเพื่อจัดการสินค้าและคำสั่งซื้อบน TikTok Shop",
};

export function ProfileSettingsPage({
  onDeleteProfile,
  onUpdateProfile,
  profile,
  session,
  startInEditMode = false,
}: ProfileSettingsPageProps) {
  const [isEditing, setIsEditing] = useState(startInEditMode);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isManagingPlatforms, setIsManagingPlatforms] = useState(false);
  const [managedPlatforms, setManagedPlatforms] = useState<Platform[]>(profile.platforms);
  const [connections, setConnections] = useState<ConnectionStatus[]>([]);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [activePlatform, setActivePlatform] = useState<Platform | null>(null);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadConnectionStatuses = useCallback(async () => {
    try {
      setConnections(await listConnections(session, profile.id));
      setConnectionError(null);
    } catch (error) {
      setConnectionError(error instanceof Error ? error.message : "ไม่สามารถตรวจสอบสถานะการเชื่อมต่อได้");
    }
  }, [profile.id, session]);

  useEffect(() => { void loadConnectionStatuses(); }, [loadConnectionStatuses]);

  useEffect(() => {
    const handleOAuthMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin && event.origin !== API_ORIGIN) return;
      if (event.data?.type !== "postpilot-oauth") return;
      setActivePlatform(null);
      if (event.data.status === "success") void loadConnectionStatuses();
      else setConnectionError(event.data.message || "การเชื่อมต่อไม่สำเร็จ");
    };
    window.addEventListener("message", handleOAuthMessage);
    return () => window.removeEventListener("message", handleOAuthMessage);
  }, [loadConnectionStatuses]);

  const connect = async (platform: Platform) => {
    const popup = window.open("", "postpilot-oauth", "width=720,height=760");
    setActivePlatform(platform);
    setConnectionError(null);
    try {
      const url = await getConnectionAuthorizationUrl(session, profile.id, platform);
      if (popup) popup.location.href = url;
      else window.location.href = url;
    } catch (error) {
      popup?.close();
      setConnectionError(error instanceof Error ? error.message : "ไม่สามารถเริ่มการเชื่อมต่อได้");
      setActivePlatform(null);
    }
  };

  const saveProfile = async (input: UpdateProfileInput) => {
    setIsSaving(true);
    setErrorMessage(null);
    try {
      await onUpdateProfile(input);
      setIsEditing(false);
      setIsManagingPlatforms(false);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "ไม่สามารถบันทึกการแก้ไขได้");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-[900px] space-y-7">
      <section>
        <h2 className="text-2xl font-semibold text-postpilot-text">ตั้งค่าโปรไฟล์</h2>
        <p className="mt-2 text-sm leading-6 text-postpilot-secondary">
          แก้ไขข้อมูลโปรไฟล์และเลือกแพลตฟอร์มที่ต้องการใช้
        </p>
      </section>

      <Card>
        <div className="mb-4 flex flex-row flex-nowrap justify-end gap-2">
          {!isEditing ? (
            <Button className="shrink-0 gap-2" onClick={() => setIsEditing(true)} variant="secondary">
              <Pencil aria-hidden="true" size={16} /> แก้ไขโปรไฟล์
            </Button>
          ) : null}
          <Button aria-label="ลบโปรไฟล์" className="min-h-10 gap-2 px-3" onClick={() => setIsConfirmingDelete(true)} variant="danger">
            <Trash2 aria-hidden="true" size={17} />
            ลบโปรไฟล์
          </Button>
        </div>
        {isConfirmingDelete ? (
          <div className="mb-5 rounded-xl bg-red-50 p-4 text-sm text-red-900">
            <p className="font-medium">ยืนยันลบโปรไฟล์ “{profile.name}”</p>
            <p className="mt-1 leading-6">ข้อมูลจะถูก soft delete และระบบจะเก็บวันที่ลบไว้</p>
            {errorMessage ? <p className="mt-2 text-red-800">{errorMessage}</p> : null}
            <div className="mt-3 flex flex-wrap justify-end gap-2">
              <Button disabled={isDeleting} onClick={() => setIsConfirmingDelete(false)} variant="secondary">ยกเลิก</Button>
              <Button disabled={isDeleting} onClick={async () => {
                setIsDeleting(true);
                try { await onDeleteProfile(); }
                catch (error) { setErrorMessage(error instanceof Error ? error.message : "ไม่สามารถลบโปรไฟล์ได้"); }
                finally { setIsDeleting(false); }
              }} variant="danger">
                {isDeleting ? "กำลังลบ..." : "ยืนยันลบ"}
              </Button>
            </div>
          </div>
        ) : null}
        {isEditing ? (
          <ProfileEditor
            errorMessage={errorMessage}
            isLoading={isSaving}
            onCancel={() => {
              setErrorMessage(null);
              setIsEditing(false);
            }}
            onSave={saveProfile}
            profile={profile}
          />
        ) : (
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
            <ProfileAvatar avatarUrl={profile.avatarUrl} name={profile.name} size="lg" />
            <div className="min-w-0 flex-1">
              <div>
                <div>
                  <h3 className="break-words text-lg font-semibold text-postpilot-text">{profile.name}</h3>
                  <p className="mt-1 text-sm text-postpilot-secondary">{profile.shopName}</p>
                </div>
              </div>
              <div className="mt-4 rounded-xl bg-postpilot-soft p-4">
                <p className="text-xs font-medium text-postpilot-secondary">เป้าหมายของโปรไฟล์</p>
                <p className="mt-1 text-sm leading-6 text-postpilot-text">{profile.goal}</p>
              </div>
            </div>
          </div>
        )}
      </Card>

      <section>
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h3 className="text-lg font-semibold text-postpilot-text">แพลตฟอร์มของโปรไฟล์</h3>
            <p className="mt-1 text-sm leading-6 text-postpilot-secondary">
              เพิ่มแพลตฟอร์มไว้ก่อน แล้วตั้งค่าการเชื่อมต่อเมื่อระบบพร้อมใช้งาน
            </p>
          </div>
          {!isManagingPlatforms && !isEditing ? (
            <Button
              className="shrink-0 gap-2"
              onClick={() => {
                setManagedPlatforms(profile.platforms);
                setErrorMessage(null);
                setIsManagingPlatforms(true);
              }}
              variant="secondary"
            >
              <Plus aria-hidden="true" size={17} />
              เพิ่มแพลตฟอร์ม
            </Button>
          ) : null}
        </div>

        {isManagingPlatforms ? (
          <div className="mb-5 rounded-xl border border-postpilot-border bg-postpilot-soft p-4 sm:p-5">
            <PlatformPicker disabled={isSaving} onChange={setManagedPlatforms} value={managedPlatforms} />
            {errorMessage ? <p className="mt-3 text-sm text-red-800">{errorMessage}</p> : null}
            <div className="mt-4 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <Button
                disabled={isSaving}
                onClick={() => {
                  setErrorMessage(null);
                  setIsManagingPlatforms(false);
                }}
                variant="secondary"
              >
                ยกเลิก
              </Button>
              <Button
                disabled={isSaving}
                onClick={() => saveProfile({
                  name: profile.name,
                  websiteName: profile.shopName,
                  goal: profile.goal,
                  avatarUrl: profile.avatarUrl,
                  platforms: managedPlatforms,
                })}
              >
                {isSaving ? "กำลังบันทึก..." : "บันทึกแพลตฟอร์ม"}
              </Button>
            </div>
          </div>
        ) : null}

        {profile.platforms.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {profile.platforms.map((platform) => (
              <Card className="flex min-h-52 flex-col" key={platform}>
                <div className="flex items-start justify-between gap-3">
                  <PlatformLogo platform={platform} />
                  <Badge tone={connections.find((item) => item.platform === platform)?.isConnected ? "success" : "warning"}>
                    {connections.find((item) => item.platform === platform)?.isConnected ? "เชื่อมต่อแล้ว" : "ยังไม่ได้เชื่อมต่อ"}
                  </Badge>
                </div>
                <h4 className="mt-5 font-semibold text-postpilot-text">{platform}</h4>
                <p className="mt-2 text-sm leading-6 text-postpilot-secondary">{connectionDescriptions[platform]}</p>
                <div className="mt-auto border-t border-postpilot-borderSoft pt-4">
                  {connections.find((item) => item.platform === platform)?.displayName ? (
                    <p className="mb-3 text-xs text-postpilot-secondary">บัญชี: {connections.find((item) => item.platform === platform)?.displayName}</p>
                  ) : null}
                  {connections.find((item) => item.platform === platform)?.isConnected ? (
                    <Button className="w-full gap-2" disabled={activePlatform === platform} onClick={async () => {
                      setActivePlatform(platform);
                      try { await disconnectPlatform(session, profile.id, platform); await loadConnectionStatuses(); }
                      catch (error) { setConnectionError(error instanceof Error ? error.message : "ไม่สามารถยกเลิกการเชื่อมต่อได้"); }
                      finally { setActivePlatform(null); }
                    }} variant="secondary">
                      <Unlink aria-hidden="true" size={16} /> ยกเลิกการเชื่อมต่อ
                    </Button>
                  ) : (
                    <Button className="w-full gap-2" disabled={activePlatform === platform || connections.find((item) => item.platform === platform)?.isConfigured === false} onClick={() => connect(platform)}>
                      <Link2 aria-hidden="true" size={16} />
                      {connections.find((item) => item.platform === platform)?.isConfigured === false ? "ยังไม่ได้ตั้งค่า API" : activePlatform === platform ? "กำลังเชื่อมต่อ..." : "เชื่อมต่อ"}
                    </Button>
                  )}
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-postpilot-border bg-postpilot-soft px-5 py-6">
            <p className="text-sm font-medium text-postpilot-text">ยังไม่ได้เลือกแพลตฟอร์ม</p>
            <p className="mt-1 text-sm leading-6 text-postpilot-secondary">กด “เพิ่มแพลตฟอร์ม” เพื่อเลือกช่องทางที่ต้องการใช้กับโปรไฟล์นี้</p>
          </div>
        )}
        {connectionError ? <p className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-800">{connectionError}</p> : null}
      </section>
    </div>
  );
}
