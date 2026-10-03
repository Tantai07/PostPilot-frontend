import { useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { ProfileAvatar } from "../components/profile/ProfileAvatar";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { EmptyState } from "../components/ui/EmptyState";
import type { Profile } from "../types/postpilot";

interface ProfileSelectPageProps {
  errorMessage?: string | null;
  isLoading?: boolean;
  onCreateProfile: () => void;
  onDeleteProfile: (profile: Profile) => Promise<void>;
  onEditProfile: (profile: Profile) => void;
  onRetry?: () => void;
  onSelectProfile: (profile: Profile) => void;
  profiles: Profile[];
}

export function ProfileSelectPage({
  errorMessage,
  isLoading = false,
  onCreateProfile,
  onDeleteProfile,
  onEditProfile,
  onRetry,
  onSelectProfile,
  profiles,
}: ProfileSelectPageProps) {
  const [deleteProfileId, setDeleteProfileId] = useState<string | null>(null);
  const [deletingProfileId, setDeletingProfileId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  return (
    <main className="min-h-screen bg-postpilot-background px-5 py-10">
      <div className="mx-auto max-w-[1000px]">
        <div>
          <p className="text-sm font-medium text-postpilot-secondary">PostPilot</p>
          <h1 className="mt-2 text-3xl font-semibold text-postpilot-text">เลือกโปรไฟล์</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-postpilot-secondary">
            เลือกพื้นที่ทำงานที่ต้องการจัดการ หรือสร้างโปรไฟล์ใหม่สำหรับร้านและกลุ่มสินค้าอื่น
          </p>
        </div>

        {errorMessage ? (
          <Card className="mt-8 border-red-200 bg-red-50">
            <h2 className="text-lg font-semibold text-red-950">โหลดรายการโปรไฟล์ไม่สำเร็จ</h2>
            <p className="mt-2 text-sm leading-6 text-red-800">{errorMessage}</p>
            {onRetry ? <Button className="mt-5" onClick={onRetry} variant="secondary">ลองอีกครั้ง</Button> : null}
          </Card>
        ) : null}

        {isLoading ? (
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {[0, 1].map((item) => (
              <Card className="animate-pulse" key={item}>
                <div className="h-14 w-14 rounded-full bg-postpilot-borderSoft" />
                <div className="mt-4 h-6 w-2/3 rounded-lg bg-postpilot-borderSoft" />
                <div className="mt-4 h-4 w-full rounded-lg bg-postpilot-borderSoft" />
                <div className="mt-6 h-11 rounded-xl bg-postpilot-borderSoft" />
              </Card>
            ))}
          </div>
        ) : null}

        {!isLoading && !errorMessage && profiles.length === 0 ? (
          <div className="mt-8">
            <EmptyState
              action={<Button onClick={onCreateProfile}>สร้างโปรไฟล์แรก</Button>}
              description="สร้างพื้นที่ทำงานสำหรับร้านหรือกลุ่มสินค้า ก่อนเริ่มเตรียมโพสต์"
              title="ยังไม่มีโปรไฟล์"
            />
          </div>
        ) : null}

        {!isLoading && !errorMessage && profiles.length > 0 ? (
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {profiles.map((profile) => (
              <Card className="flex flex-col gap-5" key={profile.id}>
                <div className="flex items-start gap-3">
                  <ProfileAvatar avatarUrl={profile.avatarUrl} name={profile.name} />
                  <div className="min-w-0 flex-1">
                    <h2 className="break-words text-xl font-semibold text-postpilot-text">{profile.name}</h2>
                    <p className="mt-1 text-sm text-postpilot-secondary">{profile.shopName}</p>
                  </div>
                  <div className="flex shrink-0 flex-row flex-nowrap items-center gap-2">
                    <Button
                      aria-label={`แก้ไขโปรไฟล์ ${profile.name}`}
                      className="min-h-10 gap-2 px-3"
                      onClick={() => onEditProfile(profile)}
                      variant="secondary"
                    >
                      <Pencil aria-hidden="true" size={16} />
                      <span className="hidden sm:inline">แก้ไข</span>
                    </Button>
                    <Button
                      aria-label={`ลบโปรไฟล์ ${profile.name}`}
                      className="min-h-10 px-3"
                      onClick={() => {
                        setDeleteError(null);
                        setDeleteProfileId(profile.id);
                      }}
                      variant="danger"
                    >
                      <Trash2 aria-hidden="true" size={17} />
                    </Button>
                  </div>
                </div>
                {deleteProfileId === profile.id ? (
                  <div className="rounded-xl bg-red-50 p-4 text-sm text-red-900">
                    <p className="font-medium">ยืนยันลบโปรไฟล์ “{profile.name}”</p>
                    <p className="mt-1 leading-6">โปรไฟล์จะถูกซ่อนพร้อมเก็บวันที่ลบไว้ในระบบ</p>
                    {deleteError ? <p className="mt-2 text-red-800">{deleteError}</p> : null}
                    <div className="mt-3 flex flex-wrap justify-end gap-2">
                      <Button disabled={deletingProfileId === profile.id} onClick={() => setDeleteProfileId(null)} variant="secondary">ยกเลิก</Button>
                      <Button
                        disabled={deletingProfileId === profile.id}
                        onClick={async () => {
                          setDeletingProfileId(profile.id);
                          setDeleteError(null);
                          try {
                            await onDeleteProfile(profile);
                          } catch (error) {
                            setDeleteError(error instanceof Error ? error.message : "ไม่สามารถลบโปรไฟล์ได้");
                          } finally {
                            setDeletingProfileId(null);
                          }
                        }}
                        variant="danger"
                      >
                        {deletingProfileId === profile.id ? "กำลังลบ..." : "ยืนยันลบ"}
                      </Button>
                    </div>
                  </div>
                ) : null}
                <div>
                  <p className="text-xs font-medium text-postpilot-secondary">เป้าหมายของโปรไฟล์</p>
                  <p className="mt-2 text-sm leading-6 text-postpilot-text">{profile.goal}</p>
                </div>
                <Button className="mt-auto w-full" onClick={() => onSelectProfile(profile)}>
                  เข้าโปรไฟล์
                </Button>
              </Card>
            ))}
            <Card className="border-dashed bg-postpilot-soft">
              <h2 className="text-xl font-semibold text-postpilot-text">สร้างโปรไฟล์ใหม่</h2>
              <p className="mt-2 text-sm leading-6 text-postpilot-secondary">
                แยกพื้นที่ทำงานตามร้าน แบรนด์ หรือกลุ่มสินค้า เพื่อจัดการโพสต์ได้เป็นระเบียบ
              </p>
              <Button className="mt-6 gap-2" onClick={onCreateProfile} variant="secondary">
                <Plus aria-hidden="true" size={18} />
                เริ่มสร้างโปรไฟล์
              </Button>
            </Card>
          </div>
        ) : null}
      </div>
    </main>
  );
}
