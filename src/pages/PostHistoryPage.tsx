import { useMemo, useState } from "react";
import { Badge } from "../components/ui/Badge";
import { Card } from "../components/ui/Card";
import { mockCategories, mockHistoryPosts } from "../data/mockData";
import type { PostStatus, PostingTarget } from "../types/postpilot";

type StatusFilter = "All" | PostStatus;
type PlatformFilter = "All" | PostingTarget;

function getCategoryName(categoryId: string) {
  return mockCategories.find((category) => category.id === categoryId)?.name ?? "Uncategorized";
}

export function PostHistoryPage() {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("All");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [platformFilter, setPlatformFilter] = useState<PlatformFilter>("All");
  const platformOptions: PostingTarget[] = ["Facebook Page", "Instagram Feed", "Instagram Story"];

  const historyPosts = useMemo(
    () =>
      mockHistoryPosts.filter((post) => {
        const matchesStatus = statusFilter === "All" || post.status === statusFilter;
        const matchesCategory = categoryFilter === "All" || post.categoryId === categoryFilter;
        const matchesPlatform =
          platformFilter === "All" || post.targets.includes(platformFilter);
        return matchesStatus && matchesCategory && matchesPlatform;
      }),
    [categoryFilter, platformFilter, statusFilter],
  );

  return (
    <div className="space-y-6">
      <section>
        <h2 className="text-2xl font-semibold text-postpilot-text">Post History</h2>
        <p className="mt-2 text-sm leading-6 text-postpilot-secondary">
          Archive-style review of past publishing results.
        </p>
      </section>
      <Card>
        <div className="grid gap-3 border-b border-postpilot-borderSoft pb-5 md:grid-cols-4">
          <label className="text-sm font-medium text-postpilot-text">
            Status
            <select
              className="mt-2 min-h-11 w-full rounded-xl border border-postpilot-border bg-white px-3 text-sm text-postpilot-text"
              onChange={(event) => setStatusFilter(event.target.value as StatusFilter)}
              value={statusFilter}
            >
              <option>All</option>
              <option>Posted</option>
              <option>Failed</option>
              <option>Queued</option>
              <option>Draft</option>
            </select>
          </label>
          <label className="text-sm font-medium text-postpilot-text">
            Category
            <select
              className="mt-2 min-h-11 w-full rounded-xl border border-postpilot-border bg-white px-3 text-sm text-postpilot-text"
              onChange={(event) => setCategoryFilter(event.target.value)}
              value={categoryFilter}
            >
              <option value="All">All</option>
              {mockCategories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </label>
          <label className="text-sm font-medium text-postpilot-text">
            Platform
            <select
              className="mt-2 min-h-11 w-full rounded-xl border border-postpilot-border bg-white px-3 text-sm text-postpilot-text"
              onChange={(event) => setPlatformFilter(event.target.value as PlatformFilter)}
              value={platformFilter}
            >
              <option>All</option>
              {platformOptions.map((platform) => (
                <option key={platform}>{platform}</option>
              ))}
            </select>
          </label>
          <label className="text-sm font-medium text-postpilot-text">
            Date
            <input
              className="mt-2 min-h-11 w-full rounded-xl border border-postpilot-border bg-white px-3 text-sm text-postpilot-secondary"
              placeholder="Date placeholder"
              type="text"
            />
          </label>
        </div>
        <div className="divide-y divide-postpilot-borderSoft">
          {historyPosts.map((post) => (
            <article className="py-5" key={post.id}>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <p className="max-w-2xl text-sm leading-6 text-postpilot-text">{post.caption}</p>
                <Badge tone={post.status === "Failed" ? "error" : "success"}>{post.status}</Badge>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <Badge>{getCategoryName(post.categoryId)}</Badge>
                {post.targets.map((target) => (
                  <Badge key={target} tone="info">
                    {target}
                  </Badge>
                ))}
                <Badge tone="neutral">External ID: {post.externalPostId ?? "Pending"}</Badge>
                <Badge tone="neutral">Real post link placeholder</Badge>
              </div>
              {post.errorMessage ? (
                <p className="mt-3 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-800">
                  {post.errorMessage}
                </p>
              ) : null}
            </article>
          ))}
          {historyPosts.length === 0 ? (
            <p className="py-8 text-center text-sm text-postpilot-secondary">
              No mock history items match these filters.
            </p>
          ) : null}
        </div>
      </Card>
    </div>
  );
}
