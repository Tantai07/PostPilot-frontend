import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { EmptyState } from "../components/ui/EmptyState";
import type { Profile } from "../types/postpilot";

interface ProfileSelectPageProps {
  errorMessage?: string | null;
  isLoading?: boolean;
  onCreateProfile: () => void;
  onRetry?: () => void;
  onSelectProfile: (profile: Profile) => void;
  profiles: Profile[];
}

export function ProfileSelectPage({
  errorMessage,
  isLoading = false,
  onCreateProfile,
  onRetry,
  onSelectProfile,
  profiles,
}: ProfileSelectPageProps) {
  return (
    <main className="min-h-screen bg-postpilot-background px-5 py-10">
      <div className="mx-auto max-w-[1000px]">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-medium text-postpilot-secondary">PostPilot</p>
            <h1 className="mt-2 text-3xl font-semibold text-postpilot-text">Select a profile</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-postpilot-secondary">
              Choose the shop or page workspace you want to manage.
            </p>
          </div>
          <Button onClick={onCreateProfile} variant="secondary">
            Create new profile
          </Button>
        </div>
        {errorMessage ? (
          <Card className="mt-8 border-red-200 bg-red-50">
            <h2 className="text-lg font-semibold text-red-950">Could not load profiles</h2>
            <p className="mt-2 text-sm leading-6 text-red-800">{errorMessage}</p>
            {onRetry ? (
              <Button className="mt-5" onClick={onRetry} variant="secondary">
                Try again
              </Button>
            ) : null}
          </Card>
        ) : null}
        {isLoading ? (
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {[0, 1].map((item) => (
              <Card className="animate-pulse" key={item}>
                <div className="h-6 w-2/3 rounded-lg bg-postpilot-borderSoft" />
                <div className="mt-4 h-4 w-full rounded-lg bg-postpilot-borderSoft" />
                <div className="mt-2 h-4 w-5/6 rounded-lg bg-postpilot-borderSoft" />
                <div className="mt-6 h-11 rounded-xl bg-postpilot-borderSoft" />
              </Card>
            ))}
          </div>
        ) : null}
        {!isLoading && !errorMessage && profiles.length === 0 ? (
          <div className="mt-8">
            <EmptyState
              action={<Button onClick={onCreateProfile}>Create profile</Button>}
              description="Create your first shop workspace before preparing product posts."
              title="No profiles yet"
            />
          </div>
        ) : null}
        {!isLoading && !errorMessage && profiles.length > 0 ? (
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {profiles.map((profile) => (
              <Card className="flex flex-col gap-5" key={profile.id}>
                <div>
                  <h2 className="text-xl font-semibold text-postpilot-text">{profile.name}</h2>
                  <p className="mt-2 text-sm leading-6 text-postpilot-secondary">
                    {profile.description}
                  </p>
                </div>
                {profile.connectedPlatforms.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {profile.connectedPlatforms.map((platform) => (
                      <Badge key={platform} tone="info">
                        {platform}
                      </Badge>
                    ))}
                  </div>
                ) : null}
                <p className="text-sm text-postpilot-secondary">
                  Default:{" "}
                  {profile.defaultTargets.length > 0 ? profile.defaultTargets.join(", ") : "Not set"}
                </p>
                <Button className="mt-auto w-full" onClick={() => onSelectProfile(profile)}>
                  Open workspace
                </Button>
              </Card>
            ))}
            <Card className="border-dashed bg-postpilot-soft">
              <h2 className="text-xl font-semibold text-postpilot-text">Create a new profile</h2>
              <p className="mt-2 text-sm leading-6 text-postpilot-secondary">
                Add another shop, page, or product line when you are ready.
              </p>
              <Button className="mt-6" onClick={onCreateProfile} variant="secondary">
                Start profile
              </Button>
            </Card>
          </div>
        ) : null}
      </div>
    </main>
  );
}
