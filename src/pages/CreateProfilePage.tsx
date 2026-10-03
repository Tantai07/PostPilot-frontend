import { useState } from "react";
import { ArrowLeft, Camera, Trash2 } from "lucide-react";
import { ProfileAvatar } from "../components/profile/ProfileAvatar";
import { PlatformPicker } from "../components/profile/PlatformPicker";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { Input } from "../components/ui/Input";
import type { CreateProfileInput } from "../api/postpilotApi";
import type { Platform, Profile } from "../types/postpilot";
import { createProfileAvatar } from "../utils/profilePresentation";

interface CreateProfilePageProps {
  errorMessage?: string | null;
  isLoading?: boolean;
  onCancel: () => void;
  onCreateProfile: (profile: CreateProfileInput) => Promise<Profile | void> | void;
}

export function CreateProfilePage({
  errorMessage,
  isLoading = false,
  onCancel,
  onCreateProfile,
}: CreateProfilePageProps) {
  const [avatarUrl, setAvatarUrl] = useState<string>();
  const [avatarError, setAvatarError] = useState<string | null>(null);
  const [isPreparingAvatar, setIsPreparingAvatar] = useState(false);
  const [selectedPlatforms, setSelectedPlatforms] = useState<Platform[]>([]);

  return (
    <main className="min-h-screen bg-postpilot-background px-5 py-8 sm:py-10">
      <div className="mx-auto max-w-[900px]">
        <Button
          className="gap-2 border-postpilot-accent px-4 text-postpilot-accent hover:bg-postpilot-accentSoft"
          onClick={onCancel}
          variant="secondary"
        >
          <ArrowLeft aria-hidden="true" size={18} />
          กลับไปหน้าโปรไฟล์
        </Button>

        <div className="mt-7">
          <h1 className="text-3xl font-semibold text-postpilot-text">สร้างโปรไฟล์</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-postpilot-secondary">
            ตั้งพื้นที่ทำงานสำหรับร้านหรือกลุ่มสินค้าของคุณ เลือกแพลตฟอร์มที่ต้องการใช้ และแก้ไขเพิ่มเติมได้ภายหลัง
          </p>
        </div>

        <Card className="mt-8">
          <form
            className="grid gap-6"
            onSubmit={async (event) => {
              event.preventDefault();
              const formData = new FormData(event.currentTarget);
              await onCreateProfile({
                name: String(formData.get("name") ?? ""),
                websiteName: String(formData.get("websiteName") ?? ""),
                goal: String(formData.get("goal") ?? ""),
                avatarUrl,
                platforms: selectedPlatforms,
              });
            }}
          >
            <section className="flex flex-col items-center gap-4 rounded-xl bg-postpilot-soft px-5 py-6 sm:flex-row sm:text-left">
              <ProfileAvatar avatarUrl={avatarUrl} name="โปรไฟล์ใหม่" size="lg" />
              <div className="text-center sm:text-left">
                <p className="text-sm font-semibold text-postpilot-text">รูปโปรไฟล์</p>
                <p className="mt-1 text-xs leading-5 text-postpilot-secondary">
                  ไม่จำเป็นต้องใส่ หากเว้นไว้ระบบจะใช้รูปเริ่มต้นให้
                </p>
                <div className="mt-3 flex flex-wrap justify-center gap-2 sm:justify-start">
                  <label
                    className="inline-flex min-h-10 cursor-pointer items-center justify-center gap-2 rounded-xl border border-postpilot-border bg-white px-3 py-2 text-sm font-medium text-postpilot-text transition hover:bg-postpilot-accentSoft focus-within:ring-4 focus-within:ring-[#1A3D2F]/10"
                    htmlFor="profile-avatar"
                  >
                    <Camera aria-hidden="true" size={17} />
                    {isPreparingAvatar ? "กำลังเตรียมรูป..." : "เลือกรูป"}
                  </label>
                  <input
                    accept="image/*"
                    className="sr-only"
                    disabled={isLoading || isPreparingAvatar}
                    id="profile-avatar"
                    onChange={async (event) => {
                      const file = event.target.files?.[0];
                      if (!file) return;
                      setAvatarError(null);
                      setIsPreparingAvatar(true);
                      try {
                        setAvatarUrl(await createProfileAvatar(file));
                      } catch (error) {
                        setAvatarError(error instanceof Error ? error.message : "ไม่สามารถเตรียมรูปโปรไฟล์ได้");
                      } finally {
                        setIsPreparingAvatar(false);
                      }
                    }}
                    type="file"
                  />
                  {avatarUrl ? (
                    <Button className="min-h-10 gap-2 px-3" onClick={() => setAvatarUrl(undefined)} variant="ghost">
                      <Trash2 aria-hidden="true" size={17} />
                      ลบรูป
                    </Button>
                  ) : null}
                </div>
                {avatarError ? <p className="mt-2 text-xs text-red-700">{avatarError}</p> : null}
              </div>
            </section>

            <Input
              disabled={isLoading}
              label="ชื่อโปรไฟล์"
              name="name"
              placeholder="ตั้งชื่อที่ช่วยให้คุณจำโปรไฟล์นี้ได้"
              required
            />
            <Input
              disabled={isLoading}
              label="ชื่อร้านหรือแบรนด์"
              name="websiteName"
              placeholder="ระบุชื่อที่ต้องการใช้กับพื้นที่ทำงานนี้"
            />
            <label className="block text-sm font-medium text-postpilot-text" htmlFor="profile-goal">
              เป้าหมายของโปรไฟล์
              <textarea
                className="mt-2 min-h-28 w-full resize-y rounded-xl border border-postpilot-border bg-white p-4 text-postpilot-text outline-none transition placeholder:text-postpilot-secondary focus:border-postpilot-accent focus:ring-4 focus:ring-[#1A3D2F]/10"
                disabled={isLoading}
                id="profile-goal"
                name="goal"
                placeholder="อธิบายว่าโปรไฟล์นี้ใช้จัดการโพสต์สินค้าหรืองานประเภทใด"
                required
              />
              <span className="mt-2 block text-xs font-normal leading-5 text-postpilot-secondary">
                ข้อความนี้จะช่วยให้แยกแต่ละโปรไฟล์ได้ง่ายเมื่อมีหลายร้านหรือหลายกลุ่มสินค้า
              </span>
            </label>

            <fieldset>
              <legend className="text-sm font-medium text-postpilot-text">แพลตฟอร์มที่ต้องการใช้</legend>
              <p className="mb-3 mt-1 text-xs leading-5 text-postpilot-secondary">
                เลือกได้มากกว่าหนึ่งแพลตฟอร์ม หรือข้ามไปเพิ่มภายหลังในหน้าตั้งค่าโปรไฟล์
              </p>
              <PlatformPicker
                disabled={isLoading}
                onChange={setSelectedPlatforms}
                value={selectedPlatforms}
              />
            </fieldset>

            {errorMessage ? (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-800">
                {errorMessage}
              </div>
            ) : null}

            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <Button disabled={isLoading} onClick={onCancel} variant="secondary">
                ยกเลิก
              </Button>
              <Button disabled={isLoading || isPreparingAvatar} type="submit">
                {isLoading ? "กำลังสร้างโปรไฟล์..." : "สร้างโปรไฟล์"}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </main>
  );
}
