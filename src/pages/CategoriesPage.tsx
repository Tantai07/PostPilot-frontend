import { useEffect, useState } from "react";
import {
  createCategory,
  deleteCategory,
  listCategories,
  updateCategory,
  type AuthSession,
} from "../api/postpilotApi";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { Input } from "../components/ui/Input";
import type { Category, Profile } from "../types/postpilot";

type CategoryDraft = Pick<Category, "name" | "description" | "captionTemplate" | "color"> & {
  tagsText: string;
};

interface CategoriesPageProps {
  profile: Profile;
  session: AuthSession;
}

const emptyDraft: CategoryDraft = {
  name: "",
  description: "",
  captionTemplate: "",
  color: "#F1F5F2",
  tagsText: "",
};

function parseTags(tagsText: string) {
  return Array.from(new Set(tagsText.split(/[\s,]+/).map((tag) => tag.trim()).filter(Boolean).map((tag) => tag.startsWith("#") || tag.startsWith("@") ? tag : `#${tag}`)));
}

function formatTags(category: Category) {
  return [...category.hashtags, ...category.mentions].join(", ");
}

export function CategoriesPage({ profile, session }: CategoriesPageProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<CategoryDraft>(emptyDraft);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const isEditing = editingId !== null;

  useEffect(() => {
    let isMounted = true;

    async function load() {
      setIsLoading(true);
      setErrorMessage(null);
      try {
        const nextCategories = await listCategories(session, profile.id);
        if (isMounted) setCategories(nextCategories);
      } catch (error) {
        if (isMounted) setErrorMessage(error instanceof Error ? error.message : "ไม่สามารถโหลดหมวดหมู่ได้");
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    load();
    return () => { isMounted = false; };
  }, [profile.id, session]);

  const startCreate = () => {
    setEditingId("new");
    setDraft(emptyDraft);
    setErrorMessage(null);
    setSuccessMessage(null);
  };

  const startEdit = (category: Category) => {
    setEditingId(category.id);
    setDraft({
      name: category.name,
      description: category.description,
      captionTemplate: category.captionTemplate,
      color: category.color,
      tagsText: formatTags(category),
    });
  };

  const saveCategory = async () => {
    const input = {
      name: draft.name.trim(),
      description: draft.description.trim(),
      captionTemplate: draft.captionTemplate.trim(),
      color: draft.color.trim() || "#F1F5F2",
      tags: parseTags(draft.tagsText),
    };
    if (!input.name) {
      setErrorMessage("กรุณากรอกชื่อหมวดหมู่");
      return;
    }

    setIsSaving(true);
    setErrorMessage(null);
    setSuccessMessage(null);
    try {
      if (editingId === "new") {
        const category = await createCategory(session, profile.id, input);
        setCategories((current) => [...current, category]);
        setSuccessMessage("สร้างหมวดหมู่แล้ว");
      } else if (editingId) {
        const category = await updateCategory(session, profile.id, editingId, input);
        setCategories((current) => current.map((item) => (item.id === editingId ? category : item)));
        setSuccessMessage("บันทึกการแก้ไขหมวดหมู่แล้ว");
      }
      setEditingId(null);
      setDraft(emptyDraft);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "ไม่สามารถบันทึกหมวดหมู่ได้");
    } finally {
      setIsSaving(false);
    }
  };

  const removeCategory = async (categoryId: string) => {
    setErrorMessage(null);
    setSuccessMessage(null);
    try {
      await deleteCategory(session, profile.id, categoryId);
      setCategories((current) => current.filter((category) => category.id !== categoryId));
      setSuccessMessage("ลบหมวดหมู่แล้ว");
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "ไม่สามารถลบหมวดหมู่ได้");
    }
  };

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-postpilot-text">หมวดหมู่</h2>
          <p className="mt-2 text-sm leading-6 text-postpilot-secondary">
            จัดกลุ่มแฮชแท็กและ Mention เพื่อเลือกใส่ในโพสต์ Facebook, Instagram, X และ TikTok สำหรับ {profile.name}
          </p>
        </div>
        <Button onClick={startCreate} variant="secondary">เพิ่มหมวดหมู่</Button>
      </section>

      {errorMessage ? <Card className="text-sm text-red-700">{errorMessage}</Card> : null}
      {successMessage ? <Card className="text-sm text-green-700">{successMessage}</Card> : null}

      {isEditing ? (
        <Card className="mx-auto max-w-[900px]">
          <div className="grid gap-5">
            <Input label="ชื่อหมวดหมู่" onChange={(event) => setDraft({ ...draft, name: event.target.value })} placeholder="ตั้งชื่อให้ค้นหาและเลือกใช้ได้ง่าย" value={draft.name} />
            <Input label="คำอธิบาย" onChange={(event) => setDraft({ ...draft, description: event.target.value })} placeholder="อธิบายว่าโพสต์ประเภทใดควรอยู่ในหมวดหมู่นี้" value={draft.description} />
            <Input label="สีประจำหมวดหมู่" onChange={(event) => setDraft({ ...draft, color: event.target.value })} type="color" value={draft.color} />
            <label className="block text-sm font-medium text-postpilot-text" htmlFor="tags">
              Hashtag และ Mention
              <textarea className="mt-2 min-h-24 w-full rounded-xl border border-postpilot-border bg-white p-4 text-sm leading-6 outline-none placeholder:text-postpilot-secondary focus:border-postpilot-accent focus:ring-4 focus:ring-[#1A3D2F]/10" id="tags" onChange={(event) => setDraft({ ...draft, tagsText: event.target.value })} placeholder="ใส่ Hashtag หรือ Mention โดยคั่นแต่ละรายการด้วยเครื่องหมายจุลภาค" value={draft.tagsText} />
            </label>
            <div className="flex flex-wrap justify-end gap-3">
              <Button onClick={() => setEditingId(null)} variant="secondary">ยกเลิก</Button>
              <Button disabled={isSaving} onClick={saveCategory}>{isSaving ? "กำลังบันทึก..." : "บันทึกหมวดหมู่"}</Button>
            </div>
          </div>
        </Card>
      ) : null}

      {isLoading ? <Card className="text-sm text-postpilot-secondary">กำลังโหลดหมวดหมู่...</Card> : null}
      {!isLoading && categories.length === 0 ? (
        <Card className="mx-auto max-w-[720px] text-center">
          <h3 className="text-lg font-semibold text-postpilot-text">ยังไม่มีหมวดหมู่</h3>
          <p className="mt-2 text-sm leading-6 text-postpilot-secondary">สร้างหมวดหมู่เพื่อจัดกลุ่มและเตรียมข้อความสำหรับโพสต์</p>
          <Button className="mt-5" onClick={startCreate} variant="secondary">สร้างหมวดหมู่แรก</Button>
        </Card>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {categories.map((category) => (
          <Card key={category.id}>
            <div aria-hidden="true" className="mb-5 h-3 rounded-full border border-postpilot-borderSoft" style={{ backgroundColor: category.color }} />
            <h3 className="text-lg font-semibold text-postpilot-text">{category.name}</h3>
            <p className="mt-2 text-sm leading-6 text-postpilot-secondary">{category.description}</p>
            <div className="mt-5 flex flex-wrap gap-2">
              {category.hashtags.map((tag) => <Badge key={tag}>{tag}</Badge>)}
              {category.mentions.map((mention) => <Badge key={mention} tone="info">{mention}</Badge>)}
            </div>
            <div className="mt-6 flex flex-wrap gap-2">
              <Button onClick={() => startEdit(category)} variant="secondary">แก้ไข</Button>
              <Button onClick={() => removeCategory(category.id)} variant="ghost">ลบ</Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
