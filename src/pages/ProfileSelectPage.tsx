import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import type { Profile } from "../types/postpilot";

interface ProfileSelectPageProps {
  onCreateProfile: () => void;
  onSelectProfile: (profile: Profile) => void;
  profiles: Profile[];
}

export function ProfileSelectPage({
  onCreateProfile,
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
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {profiles.map((profile) => (
            <Card className="flex flex-col gap-5" key={profile.id}>
              <div>
                <h2 className="text-xl font-semibold text-postpilot-text">{profile.name}</h2>
                <p className="mt-2 text-sm leading-6 text-postpilot-secondary">
                  {profile.description}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {profile.connectedPlatforms.map((platform) => (
                  <Badge key={platform} tone="info">
                    {platform}
                  </Badge>
                ))}
              </div>
              <p className="text-sm text-postpilot-secondary">
                Default: {profile.defaultTargets.join(", ")}
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
      </div>
    </main>
  );
}
