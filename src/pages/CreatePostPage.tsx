import { type ChangeEvent, useEffect, useState } from "react";
import { createPostDraft, publishPostNow } from "../api/postDraftApi";
import { addPostToQueue } from "../api/queueApi";
import {
  listCategories,
  uploadMedia,
  type AuthSession,
  type UploadedMedia,
} from "../api/postpilotApi";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { ProfileAvatar } from "../components/profile/ProfileAvatar";
import type { Category, PostingTarget, Profile } from "../types/postpilot";
import { getTargetLabel } from "../utils/displayText";

interface CreatePostPageProps {
  profile: Profile;
  session: AuthSession;
}

export function CreatePostPage({ profile, session }: CreatePostPageProps) {
  const [caption, setCaption] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryId, setCategoryId] = useState("");
  const [targets, setTargets] = useState<PostingTarget[]>(["Facebook Page", "Instagram Feed"]);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploadedMedia, setUploadedMedia] = useState<UploadedMedia | null>(null);
  const [savedDraftId, setSavedDraftId] = useState<string | null>(null);
  const [isLoadingCategories, setIsLoadingCategories] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [isAddingToQueue, setIsAddingToQueue] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [categoryError, setCategoryError] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [draftError, setDraftError] = useState<string | null>(null);
  const [draftSuccess, setDraftSuccess] = useState<string | null>(null);
  const [queueMessage, setQueueMessage] = useState<string | null>(null);
  const [publishMessage, setPublishMessage] = useState<string | null>(null);

  const selectedCategory = categories.find((category) => category.id === categoryId);
  const targetOptions: PostingTarget[] = ["Facebook Page", "Instagram Feed", "Instagram Story"];
  const isBusy = isSavingDraft || isUploading || isAddingToQueue || isPublishing;

  useEffect(() => {
    let isMounted = true;

    async function load() {
      setIsLoadingCategories(true);
      setCategoryError(null);

      try {
        const nextCategories = await listCategories(session, profile.id);
        if (isMounted) {
          setCategories(nextCategories);
          setCategoryId((currentCategoryId) => currentCategoryId || nextCategories[0]?.id || "");
        }
      } catch (error) {
        if (isMounted) {
          setCategoryError(error instanceof Error ? error.message : "ไม่สามารถโหลดหมวดหมู่ได้");
        }
      } finally {
        if (isMounted) {
          setIsLoadingCategories(false);
        }
      }
    }

    load();

    return () => {
      isMounted = false;
    };
  }, [profile.id, session]);

  const resetSavedDraft = () => {
    setSavedDraftId(null);
    setDraftSuccess(null);
    setQueueMessage(null);
    setPublishMessage(null);
  };

  const toggleTarget = (target: PostingTarget) => {
    resetSavedDraft();
    setTargets((currentTargets) =>
      currentTargets.includes(target)
        ? currentTargets.filter((item) => item !== target)
        : [...currentTargets, target],
    );
  };

  const handleImageChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    setUploadError(null);
    resetSavedDraft();
    setUploadedMedia(null);

    if (!file) {
      setPreviewUrl(null);
      return;
    }

    const localPreviewUrl = URL.createObjectURL(file);
    setPreviewUrl(localPreviewUrl);
    setIsUploading(true);

    try {
      const media = await uploadMedia(session, profile.id, file);
      setUploadedMedia(media);
      setPreviewUrl(media.publicUrl);
      URL.revokeObjectURL(localPreviewUrl);
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : "ไม่สามารถอัปโหลดรูปภาพได้");
    } finally {
      setIsUploading(false);
    }
  };

  const saveDraft = async () => {
    setDraftError(null);
    setDraftSuccess(null);
    setQueueMessage(null);
    setPublishMessage(null);

    if (!caption.trim()) {
      setDraftError("กรุณาเขียนข้อความโพสต์ก่อนบันทึกแบบร่าง");
      return null;
    }

    if (targets.length === 0) {
      setDraftError("กรุณาเลือกช่องทางเผยแพร่อย่างน้อยหนึ่งช่องทาง");
      return null;
    }

    setIsSavingDraft(true);

    try {
      const draft = await createPostDraft(session, profile.id, {
        categoryId,
        caption: caption.trim(),
        media: uploadedMedia ? [uploadedMedia] : [],
        targetPlatforms: targets,
      });

      setSavedDraftId(draft.id);
      setDraftSuccess("บันทึกแบบร่างแล้ว");
      return draft.id;
    } catch (error) {
      setDraftError(error instanceof Error ? error.message : "ไม่สามารถบันทึกแบบร่างได้");
      return null;
    } finally {
      setIsSavingDraft(false);
    }
  };

  const addCurrentPostToQueue = async () => {
    setDraftError(null);
    setQueueMessage(null);
    setIsAddingToQueue(true);

    try {
      const draftId = savedDraftId ?? (await saveDraft());
      if (!draftId) {
        return;
      }

      const queueItem = await addPostToQueue(session, profile.id, draftId);
      setQueueMessage(`เพิ่มโพสต์เข้าคิวลำดับที่ ${queueItem.sortOrder} แล้ว`);
    } catch (error) {
      setDraftError(error instanceof Error ? error.message : "ไม่สามารถเพิ่มโพสต์เข้าคิวได้");
    } finally {
      setIsAddingToQueue(false);
    }
  };

  const publishNow = async () => {
    setDraftError(null);
    setPublishMessage(null);
    setIsPublishing(true);

    try {
      const draftId = savedDraftId ?? (await saveDraft());
      if (!draftId) {
        return;
      }

      await publishPostNow(session, profile.id, draftId);
      setPublishMessage("เผยแพร่โพสต์แล้ว ตรวจสอบผลได้ในประวัติโพสต์");
    } catch (error) {
      setDraftError(error instanceof Error ? error.message : "ไม่สามารถเผยแพร่โพสต์ได้");
    } finally {
      setIsPublishing(false);
    }
  };

  useEffect(() => {
    return () => {
      if (previewUrl && previewUrl.startsWith("blob:")) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  return (
    <div className="mx-auto max-w-[900px] space-y-6">
      <section>
        <h2 className="text-2xl font-semibold text-postpilot-text">สร้างโพสต์</h2>
        <p className="mt-2 text-sm leading-6 text-postpilot-secondary">
          เตรียมข้อความ เลือกหมวดหมู่ และตรวจสอบหน้าตาโพสต์ก่อนเผยแพร่
        </p>
      </section>
      {categoryError ? <Card className="text-sm text-red-700">{categoryError}</Card> : null}
      {uploadError ? <Card className="text-sm text-red-700">{uploadError}</Card> : null}
      {draftError ? <Card className="text-sm text-red-700">{draftError}</Card> : null}
      {draftSuccess ? <Card className="text-sm text-green-700">{draftSuccess}</Card> : null}
      {queueMessage ? <Card className="text-sm text-green-700">{queueMessage}</Card> : null}
      {publishMessage ? <Card className="text-sm text-green-700">{publishMessage}</Card> : null}
      {uploadedMedia ? (
        <Card className="text-sm text-green-700">
          อัปโหลดรูปภาพแล้วและพร้อมใช้กับโพสต์นี้
        </Card>
      ) : null}
      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <Card className="space-y-6">
          <label className="block text-sm font-medium text-postpilot-text" htmlFor="caption">
            ข้อความโพสต์
            <span className="mt-2 block text-xs font-normal text-postpilot-secondary">
              ระบุข้อมูลสำคัญ เช่น สินค้า สภาพ ขนาด ราคา และวิธีสั่งซื้อ
            </span>
          </label>
          <textarea
            className="min-h-72 w-full resize-y rounded-xl border border-postpilot-border bg-white p-4 text-base leading-7 outline-none transition placeholder:text-postpilot-secondary focus:border-postpilot-accent focus:ring-4 focus:ring-[#1A3D2F]/10"
            id="caption"
            onChange={(event) => {
              resetSavedDraft();
              setCaption(event.target.value);
            }}
            placeholder="เขียนรายละเอียดที่ลูกค้าต้องรู้ก่อนตัดสินใจสั่งซื้อ"
            value={caption}
          />
          <label className="block text-sm font-medium text-postpilot-text" htmlFor="category">
            หมวดหมู่
            <select
              className="mt-2 min-h-12 w-full rounded-xl border border-postpilot-border bg-white px-4 text-postpilot-text outline-none transition focus:border-postpilot-accent focus:ring-4 focus:ring-[#1A3D2F]/10"
              disabled={isLoadingCategories || categories.length === 0}
              id="category"
              onChange={(event) => {
                resetSavedDraft();
                setCategoryId(event.target.value);
              }}
              value={categoryId}
            >
              {categories.length === 0 ? <option value="">ยังไม่มีหมวดหมู่</option> : null}
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
            {isLoadingCategories ? (
              <span className="mt-2 block text-xs font-normal text-postpilot-secondary">กำลังโหลดหมวดหมู่...</span>
            ) : null}
          </label>
          <div>
            <p className="text-sm font-medium text-postpilot-text">รูปภาพ</p>
            <label
              className="mt-2 flex min-h-40 cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-postpilot-border bg-postpilot-soft px-5 py-8 text-center text-sm text-postpilot-secondary transition hover:bg-white"
              htmlFor="image-upload"
            >
              {previewUrl ? (
                <img alt="รูปภาพที่เลือก" className="max-h-56 rounded-xl object-cover" src={previewUrl} />
              ) : (
                <>
                  <span className="font-medium text-postpilot-text">อัปโหลดรูปภาพสินค้า</span>
                  <span className="mt-2">รองรับ JPG, PNG, WebP หรือ GIF ขนาดไม่เกิน 10 MB</span>
                </>
              )}
            </label>
            <input accept="image/*" className="sr-only" disabled={isUploading} id="image-upload" onChange={handleImageChange} type="file" />
            {isUploading ? (
              <p className="mt-2 text-xs text-postpilot-secondary">กำลังอัปโหลดรูปภาพ...</p>
            ) : null}
            {uploadedMedia ? (
              <p className="mt-2 break-all text-xs text-postpilot-secondary">
                อัปโหลดแล้ว: {uploadedMedia.fileName}
              </p>
            ) : null}
          </div>
          <fieldset>
            <legend className="text-sm font-medium text-postpilot-text">ช่องทางเผยแพร่</legend>
            <div className="mt-3 grid gap-3 sm:grid-cols-3">
              {targetOptions.map((target) => (
                <label className="flex items-center gap-3 rounded-xl border border-postpilot-border bg-white px-4 py-3 text-sm text-postpilot-secondary" key={target}>
                  <input checked={targets.includes(target)} className="h-4 w-4 accent-postpilot-accent" onChange={() => toggleTarget(target)} type="checkbox" />
                  {getTargetLabel(target)}
                </label>
              ))}
            </div>
          </fieldset>
          <div className="flex flex-wrap gap-3">
            <Button disabled={isBusy} onClick={saveDraft} variant="secondary">
              {isSavingDraft ? "กำลังบันทึก..." : "บันทึกแบบร่าง"}
            </Button>
            <Button disabled={isBusy} onClick={addCurrentPostToQueue} variant="secondary">
              {isAddingToQueue ? "กำลังเพิ่ม..." : "เพิ่มเข้าคิว"}
            </Button>
            <Button disabled={isBusy} onClick={publishNow}>
              {isPublishing ? "กำลังเผยแพร่..." : "เผยแพร่ตอนนี้"}
            </Button>
          </div>
        </Card>
        <Card className="self-start">
          <div className="flex items-center justify-between gap-3 border-b border-postpilot-borderSoft pb-4">
            <div>
              <h3 className="font-semibold text-postpilot-text">ตัวอย่างโพสต์</h3>
              <p className="mt-1 text-sm text-postpilot-secondary">
                {selectedCategory?.name ?? "ยังไม่ได้เลือกหมวดหมู่"}
              </p>
            </div>
            <span className="rounded-full bg-postpilot-accentSoft px-3 py-1 text-xs font-medium text-postpilot-accent">
              {publishMessage ? "เผยแพร่แล้ว" : queueMessage ? "อยู่ในคิว" : draftSuccess ? "บันทึกแล้ว" : uploadedMedia ? "อัปโหลดแล้ว" : "แบบร่าง"}
            </span>
          </div>
          <div className="mt-5">
            <div className="flex items-center gap-3">
              <ProfileAvatar avatarUrl={profile.avatarUrl} name={profile.name} size="sm" />
              <div>
                <p className="text-sm font-semibold text-postpilot-text">{profile.name}</p>
                <p className="text-xs text-postpilot-secondary">{targets.map(getTargetLabel).join(", ")}</p>
              </div>
            </div>
            {previewUrl ? (
              <img alt="รูปภาพที่เลือก" className="mt-5 aspect-square w-full rounded-2xl object-cover" src={previewUrl} />
            ) : (
              <div className="mt-5 flex aspect-square items-center justify-center rounded-2xl bg-postpilot-soft text-sm text-postpilot-secondary">
                รูปภาพโพสต์จะแสดงที่นี่
              </div>
            )}
            <p className="mt-5 whitespace-pre-wrap text-sm leading-6 text-postpilot-text">
              {caption || "ข้อความโพสต์จะแสดงที่นี่"}
            </p>
            {selectedCategory ? (
              <p className="mt-4 text-xs leading-5 text-postpilot-secondary">
                โครงข้อความ: {selectedCategory.captionTemplate || "ยังไม่มีโครงข้อความ"}
              </p>
            ) : null}
          </div>
        </Card>
      </div>
    </div>
  );
}
