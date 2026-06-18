import { useEffect, useState } from "react";
import { addPostToQueue } from "../api/queueApi";
import { listPosts, publishPostNow } from "../api/postsApi";
import type { AuthSession } from "../api/postpilotApi";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { EmptyState } from "../components/ui/EmptyState";
import type { Post, Profile } from "../types/postpilot";

interface DraftsPageProps {
  profile: Profile;
  session: AuthSession;
}

export function DraftsPage({ profile, session }: DraftsPageProps) {
  const [drafts, setDrafts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [busyPostId, setBusyPostId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadDrafts() {
      setIsLoading(true);
      setErrorMessage(null);

      try {
        const nextDrafts = await listPosts(session, profile.id, "Draft");
        if (isMounted) {
          setDrafts(nextDrafts);
        }
      } catch (error) {
        if (isMounted) {
          setErrorMessage(error instanceof Error ? error.message : "Could not load drafts.");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadDrafts();

    return () => {
      isMounted = false;
    };
  }, [profile.id, session]);

  const queueDraft = async (postId: string) => {
    setBusyPostId(postId);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      await addPostToQueue(session, profile.id, postId);
      setDrafts((currentDrafts) => currentDrafts.filter((draft) => draft.id !== postId));
      setSuccessMessage("Draft added to queue.");
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Could not add draft to queue.");
    } finally {
      setBusyPostId(null);
    }
  };

  const publishDraft = async (postId: string) => {
    setBusyPostId(postId);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      await publishPostNow(session, profile.id, postId);
      setDrafts((currentDrafts) => currentDrafts.filter((draft) => draft.id !== postId));
      setSuccessMessage("Draft published with mock provider. Check Post History.");
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Could not publish draft.");
    } finally {
      setBusyPostId(null);
    }
  };

  return (
    <div className="space-y-6">
      <section>
        <h2 className="text-2xl font-semibold text-postpilot-text">Drafts</h2>
        <p className="mt-2 text-sm leading-6 text-postpilot-secondary">
          Review saved drafts before adding them to queue or publishing with the mock provider.
        </p>
      </section>

      {errorMessage ? <Card className="text-sm text-red-700">{errorMessage}</Card> : null}
      {successMessage ? <Card className="text-sm text-green-700">{successMessage}</Card> : null}
      {isLoading ? <Card className="text-sm text-postpilot-secondary">Loading drafts...</Card> : null}

      {!isLoading && drafts.length === 0 ? (
        <EmptyState
          description="Save a post from the Create Post page and it will appear here."
          title="No drafts yet"
        />
      ) : (
        <div className="space-y-4">
          {drafts.map((draft) => (
            <Card className="flex flex-col gap-4 lg:flex-row lg:items-start" key={draft.id}>
              <div className="flex-1">
                <p className="text-sm leading-6 text-postpilot-text">{draft.caption}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Badge tone="neutral">{draft.status}</Badge>
                  {draft.targets.map((target) => (
                    <Badge key={target} tone="info">
                      {target}
                    </Badge>
                  ))}
                </div>
              </div>
              <div className="flex flex-wrap gap-2 lg:justify-end">
                <Button
                  disabled={busyPostId === draft.id}
                  onClick={() => queueDraft(draft.id)}
                  variant="secondary"
                >
                  {busyPostId === draft.id ? "Working..." : "Add to Queue"}
                </Button>
                <Button disabled={busyPostId === draft.id} onClick={() => publishDraft(draft.id)}>
                  Publish Now
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
