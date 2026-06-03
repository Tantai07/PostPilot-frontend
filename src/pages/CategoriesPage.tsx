import { useState } from "react";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { Input } from "../components/ui/Input";
import { mockCategories } from "../data/mockData";
import type { Category } from "../types/postpilot";

type CategoryDraft = Pick<Category, "name" | "description" | "captionTemplate">;

const emptyDraft: CategoryDraft = {
  name: "",
  description: "",
  captionTemplate: "",
};

export function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>(mockCategories);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<CategoryDraft>(emptyDraft);
  const isEditing = editingId !== null;

  const startCreate = () => {
    setEditingId("new");
    setDraft(emptyDraft);
  };

  const startEdit = (category: Category) => {
    setEditingId(category.id);
    setDraft({
      name: category.name,
      description: category.description,
      captionTemplate: category.captionTemplate,
    });
  };

  const saveCategory = () => {
    const nextDraft = {
      name: draft.name.trim() || "หมวดใหม่",
      description: draft.description.trim() || "คำอธิบายหมวดหมู่สำหรับโพสต์สินค้า.",
      captionTemplate: draft.captionTemplate.trim() || "[ชื่อสินค้า] ราคา [ราคา] บาท",
    };

    if (editingId === "new") {
      setCategories((currentCategories) => [
        ...currentCategories,
        {
          id: `cat-${Date.now()}`,
          ...nextDraft,
          color: "#F1F5F2",
          hashtags: ["#newcategory"],
          mentions: [],
        },
      ]);
    } else if (editingId) {
      setCategories((currentCategories) =>
        currentCategories.map((category) =>
          category.id === editingId ? { ...category, ...nextDraft } : category,
        ),
      );
    }

    setEditingId(null);
    setDraft(emptyDraft);
  };

  const deleteCategory = (categoryId: string) => {
    setCategories((currentCategories) =>
      currentCategories.filter((category) => category.id !== categoryId),
    );
  };

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-postpilot-text">Categories</h2>
          <p className="mt-2 text-sm leading-6 text-postpilot-secondary">
            Manage reusable tags, mentions, and simple post grouping.
          </p>
        </div>
        <Button onClick={startCreate} variant="secondary">
          New category
        </Button>
      </section>
      {isEditing ? (
        <Card className="mx-auto max-w-[900px]">
          <div className="grid gap-5">
            <Input
              label="Category name"
              onChange={(event) => setDraft({ ...draft, name: event.target.value })}
              placeholder="โปรโมชั่น"
              value={draft.name}
            />
            <Input
              label="Description"
              onChange={(event) => setDraft({ ...draft, description: event.target.value })}
              placeholder="Short note about when to use this category"
              value={draft.description}
            />
            <label className="block text-sm font-medium text-postpilot-text" htmlFor="template">
              Caption template
              <textarea
                className="mt-2 min-h-28 w-full rounded-xl border border-postpilot-border bg-white p-4 text-sm leading-6 outline-none focus:border-postpilot-accent focus:ring-4 focus:ring-[#1A3D2F]/10"
                id="template"
                onChange={(event) =>
                  setDraft({ ...draft, captionTemplate: event.target.value })
                }
                placeholder="[ชื่อสินค้า] ราคา [ราคา] บาท"
                value={draft.captionTemplate}
              />
            </label>
            <div className="flex flex-wrap justify-end gap-3">
              <Button
                onClick={() => {
                  setEditingId(null);
                  setDraft(emptyDraft);
                }}
                variant="secondary"
              >
                Cancel
              </Button>
              <Button onClick={saveCategory}>Save category</Button>
            </div>
          </div>
        </Card>
      ) : null}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {categories.map((category) => (
          <Card key={category.id}>
            <div
              aria-hidden="true"
              className="mb-5 h-3 rounded-full border border-postpilot-borderSoft"
              style={{ backgroundColor: category.color }}
            />
            <h3 className="text-lg font-semibold text-postpilot-text">{category.name}</h3>
            <p className="mt-2 text-sm leading-6 text-postpilot-secondary">{category.description}</p>
            <p className="mt-5 rounded-xl bg-postpilot-soft p-3 text-sm leading-6 text-postpilot-secondary">
              {category.captionTemplate}
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              {category.hashtags.map((tag) => (
                <Badge key={tag}>{tag}</Badge>
              ))}
              {category.mentions.map((mention) => (
                <Badge key={mention} tone="info">
                  {mention}
                </Badge>
              ))}
            </div>
            <div className="mt-6 flex flex-wrap gap-2">
              <Button onClick={() => startEdit(category)} variant="secondary">
                Edit
              </Button>
              <Button onClick={() => deleteCategory(category.id)} variant="ghost">
                Delete
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
