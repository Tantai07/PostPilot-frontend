import { useState } from "react";
import { Camera, Trash2 } from "lucide-react";
import type { UpdateProfileInput } from "../../api/postpilotApi";
import type { Profile } from "../../types/postpilot";
import { createProfileAvatar } from "../../utils/profilePresentation";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { PlatformPicker } from "./PlatformPicker";
import { ProfileAvatar } from "./ProfileAvatar";

interface ProfileEditorProps {
  errorMessage?: string | null;
  isLoading?: boolean;
  onCancel: () => void;
  onSave: (input: UpdateProfileInput) => Promise<void> | void;
  profile: Profile;
}

export function ProfileEditor({
  errorMessage,
  isLoading = false,
  onCancel,
  onSave,
  profile,
}: ProfileEditorProps) {
  const [name, setName] = useState(profile.name);
  const [websiteName, setWebsiteName] = useState(profile.shopName);
  const [goal, setGoal] = useState(profile.goal);
  const [avatarUrl, setAvatarUrl] = useState(profile.avatarUrl);
  const [platforms, setPlatforms] = useState(profile.platforms);
  const [avatarError, setAvatarError] = useState<string | null>(null);
  const [isPreparingAvatar, setIsPreparingAvatar] = useState(false);

  return (
    <form
      className="grid gap-6"
      onSubmit={async (event) => {
        event.preventDefault();
        await onSave({ name, websiteName, goal, avatarUrl, platforms });
      }}
    >
      <section className="flex flex-col items-center gap-4 rounded-xl bg-postpilot-soft px-5 py-6 sm:flex-row sm:text-left">
        <ProfileAvatar avatarUrl={avatarUrl} name={name || profile.name} size="lg" />
        <div className="text-center sm:text-left">
          <p className="text-sm font-semibold text-postpilot-text">รูปโปรไฟล์</p>
          <p className="mt-1 text-xs leading-5 text-postpilot-secondary">เว้นว่างได้ ระบบจะใช้รูปเริ่มต้นให้</p>
          <div className="mt-3 flex flex-wrap justify-center gap-2 sm:justify-start">
            <label
              className="inline-flex min-h-10 cursor-pointer items-center justify-center gap-2 rounded-xl border border-postpilot-border bg-white px-3 py-2 text-sm font-medium text-postpilot-text transition hover:bg-postpilot-accentSoft focus-within:ring-4 focus-within:ring-[#1A3D2F]/10"
              htmlFor={`profile-avatar-${profile.id}`}
            >
              <Camera aria-hidden="true" size={17} />
              {isPreparingAvatar ? "กำลังเตรียมรูป..." : "เปลี่ยนรูป"}
            </label>
            <input
              accept="image/*"
              className="sr-only"
              disabled={isLoading || isPreparingAvatar}
              id={`profile-avatar-${profile.id}`}
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

      <Input disabled={isLoading} label="ชื่อโปรไฟล์" onChange={(event) => setName(event.target.value)} required value={name} />
      <Input disabled={isLoading} label="ชื่อร้านหรือแบรนด์" onChange={(event) => setWebsiteName(event.target.value)} value={websiteName} />

      <label className="block text-sm font-medium text-postpilot-text" htmlFor={`profile-goal-${profile.id}`}>
        เป้าหมายของโปรไฟล์
        <textarea
          className="mt-2 min-h-28 w-full resize-y rounded-xl border border-postpilot-border bg-white p-4 text-postpilot-text outline-none transition focus:border-postpilot-accent focus:ring-4 focus:ring-[#1A3D2F]/10"
          disabled={isLoading}
          id={`profile-goal-${profile.id}`}
          onChange={(event) => setGoal(event.target.value)}
          required
          value={goal}
        />
      </label>

      <fieldset>
        <legend className="text-sm font-medium text-postpilot-text">แพลตฟอร์มที่ต้องการใช้</legend>
        <p className="mb-3 mt-1 text-xs leading-5 text-postpilot-secondary">เลือกเพิ่มหรือนำแพลตฟอร์มออกจากโปรไฟล์นี้</p>
        <PlatformPicker disabled={isLoading} onChange={setPlatforms} value={platforms} />
      </fieldset>

      {errorMessage ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-800">{errorMessage}</div>
      ) : null}

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Button disabled={isLoading} onClick={onCancel} variant="secondary">ยกเลิก</Button>
        <Button disabled={isLoading || isPreparingAvatar} type="submit">
          {isLoading ? "กำลังบันทึก..." : "บันทึกการแก้ไข"}
        </Button>
      </div>
    </form>
  );
}
