import { useState } from "react";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { EmptyState } from "../components/ui/EmptyState";
import { mockCategories, mockQueuePosts } from "../data/mockData";
import type { Post } from "../types/postpilot";

function getCategoryName(categoryId: string) {
  return mockCategories.find((category) => category.id === categoryId)?.name ?? "Uncategorized";
}

export function QueuePage() {
  const [queuePosts, setQueuePosts] = useState<Post[]>(mockQueuePosts);

  const movePost = (index: number, direction: "up" | "down") => {
    setQueuePosts((currentPosts) => {
      const nextIndex = direction === "up" ? index - 1 : index + 1;
      if (nextIndex < 0 || nextIndex >= currentPosts.length) {
        return currentPosts;
      }

      const reordered = [...currentPosts];
      [reordered[index], reordered[nextIndex]] = [reordered[nextIndex], reordered[index]];
      return reordered;
    });
  };

  const removePost = (postId: string) => {
    setQueuePosts((currentPosts) => currentPosts.filter((post) => post.id !== postId));
  };

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-postpilot-text">Queue</h2>
          <p className="mt-2 text-sm leading-6 text-postpilot-secondary">
            Review the ordered list of posts waiting to be published.
          </p>
        </div>
        <Button>Post Next</Button>
      </section>
      {queuePosts.length === 0 ? (
        <EmptyState
          description="Saved queued posts will appear here as an editorial list."
          title="No queued posts yet"
        />
      ) : (
        <div className="space-y-4">
          {queuePosts.map((post, index) => (
            <Card className="flex flex-col gap-4 lg:flex-row lg:items-start" key={post.id}>
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-postpilot-soft text-sm font-semibold text-postpilot-secondary">
                {index + 1}
              </div>
              <div className="flex-1">
                <p className="text-sm leading-6 text-postpilot-text">{post.caption}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Badge tone="warning">{post.status}</Badge>
                  <Badge tone="neutral">{getCategoryName(post.categoryId)}</Badge>
                  {post.targets.map((target) => (
                    <Badge key={target}>{target}</Badge>
                  ))}
                </div>
                <p className="mt-3 text-sm text-postpilot-secondary">{post.scheduledFor}</p>
              </div>
              <div className="flex flex-wrap gap-2 lg:justify-end">
                <Button
                  disabled={index === 0}
                  onClick={() => movePost(index, "up")}
                  variant="secondary"
                >
                  Move up
                </Button>
                <Button
                  disabled={index === queuePosts.length - 1}
                  onClick={() => movePost(index, "down")}
                  variant="secondary"
                >
                  Move down
                </Button>
                <Button onClick={() => removePost(post.id)} variant="ghost">
                  Remove
                </Button>
                <Button variant="secondary">Post now</Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
