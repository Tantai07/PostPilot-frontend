import { useEffect, useState } from "react";
import {
  listQueue,
  postNext,
  reorderQueue,
  type QueueItem,
} from "../api/queueApi";
import type { AuthSession } from "../api/postpilotApi";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { EmptyState } from "../components/ui/EmptyState";
import type { Profile } from "../types/postpilot";

interface QueuePageProps {
  profile: Profile;
  session: AuthSession;
}

export function QueuePage({ profile, session }: QueuePageProps) {
  const [queuePosts, setQueuePosts] = useState<QueueItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isPostingNext, setIsPostingNext] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadQueue() {
      setIsLoading(true);
      setErrorMessage(null);

      try {
        const nextQueue = await listQueue(session, profile.id);
        if (isMounted) {
          setQueuePosts(nextQueue);
        }
      } catch (error) {
        if (isMounted) {
          setErrorMessage(error instanceof Error ? error.message : "Could not load queue.");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadQueue();

    return () => {
      isMounted = false;
    };
  }, [profile.id, session]);

  const movePost = async (index: number, direction: "up" | "down") => {
    const nextIndex = direction === "up" ? index - 1 : index + 1;
    if (nextIndex < 0 || nextIndex >= queuePosts.length) {
      return;
    }

    const reordered = [...queuePosts];
    [reordered[index], reordered[nextIndex]] = [reordered[nextIndex], reordered[index]];
    setQueuePosts(reordered);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const savedQueue = await reorderQueue(
        session,
        profile.id,
        reordered.map((post) => post.queueItemId),
      );
      setQueuePosts(savedQueue);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Could not reorder queue.");
      setQueuePosts(queuePosts);
    }
  };

  const handlePostNext = async () => {
    setIsPostingNext(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const posted = await postNext(session, profile.id);
      setQueuePosts((currentPosts) =>
        currentPosts.filter((post) => post.queueItemId !== posted.queueItemId),
      );
      setSuccessMessage("Posted next queued item with the mock manual provider.");
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Could not post next item.");
    } finally {
      setIsPostingNext(false);
    }
  };

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-postpilot-text">Queue</h2>
          <p className="mt-2 text-sm leading-6 text-postpilot-secondary">
            Review the ordered list of posts waiting to be published for {profile.name}.
          </p>
        </div>
        <Button disabled={isPostingNext || queuePosts.length === 0} onClick={handlePostNext}>
          {isPostingNext ? "Posting..." : "Post Next"}
        </Button>
      </section>

      {errorMessage ? <Card className="text-sm text-red-700">{errorMessage}</Card> : null}
      {successMessage ? <Card className="text-sm text-green-700">{successMessage}</Card> : null}
      {isLoading ? <Card className="text-sm text-postpilot-secondary">Loading queue...</Card> : null}

      {!isLoading && queuePosts.length === 0 ? (
        <EmptyState
          description="Save a draft and add it to the queue from the Create Post page."
          title="No queued posts yet"
        />
      ) : (
        <div className="space-y-4">
          {queuePosts.map((post, index) => (
            <Card className="flex flex-col gap-4 lg:flex-row lg:items-start" key={post.queueItemId}>
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-postpilot-soft text-sm font-semibold text-postpilot-secondary">
                {index + 1}
              </div>
              <div className="flex-1">
                <p className="text-sm leading-6 text-postpilot-text">{post.caption}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Badge tone="warning">{post.status}</Badge>
                  {post.targets.map((target) => (
                    <Badge key={target}>{target}</Badge>
                  ))}
                </div>
                <p className="mt-3 text-sm text-postpilot-secondary">
                  Manual queue position {post.sortOrder}
                </p>
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
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}