import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { Input } from "../components/ui/Input";
import type { Profile } from "../types/postpilot";

interface ProfileSettingsPageProps {
  profile: Profile;
}

export function ProfileSettingsPage({ profile }: ProfileSettingsPageProps) {
  return (
    <div className="mx-auto max-w-[900px] space-y-6">
      <section>
        <h2 className="text-2xl font-semibold text-postpilot-text">Profile Settings</h2>
        <p className="mt-2 text-sm leading-6 text-postpilot-secondary">
          Manage shop details and connection placeholders for this profile.
        </p>
      </section>
      <Card>
        <form className="grid gap-8">
          <section className="grid gap-5">
            <h3 className="text-lg font-semibold text-postpilot-text">Profile information</h3>
            <Input defaultValue={profile.name} label="Profile name" />
            <Input defaultValue={profile.shopName} label="Website/shop name" />
          </section>
          <section>
            <h3 className="text-lg font-semibold text-postpilot-text">Default posting targets</h3>
            <div className="mt-3 flex flex-wrap gap-2">
              {profile.defaultTargets.map((target) => (
                <Badge key={target} tone="info">
                  {target}
                </Badge>
              ))}
            </div>
          </section>
          <section className="grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-postpilot-border bg-postpilot-soft p-4">
              <p className="text-sm font-medium text-postpilot-text">Facebook Page connection</p>
              <p className="mt-2 text-sm text-postpilot-secondary">{profile.facebookPageLabel}</p>
              <Badge tone={profile.connectedPlatforms.includes("Facebook") ? "success" : "warning"}>
                {profile.connectedPlatforms.includes("Facebook") ? "Mock connected" : "Not connected"}
              </Badge>
            </div>
            <div className="rounded-2xl border border-postpilot-border bg-postpilot-soft p-4">
              <p className="text-sm font-medium text-postpilot-text">Instagram Business connection</p>
              <p className="mt-2 text-sm text-postpilot-secondary">
                {profile.instagramBusinessLabel}
              </p>
              <Badge tone={profile.connectedPlatforms.includes("Instagram") ? "success" : "warning"}>
                {profile.connectedPlatforms.includes("Instagram") ? "Mock connected" : "Not connected"}
              </Badge>
            </div>
          </section>
          <section className="rounded-2xl border border-postpilot-border bg-white p-4">
            <p className="text-sm font-medium text-postpilot-text">Storage setting placeholder</p>
            <p className="mt-2 text-sm leading-6 text-postpilot-secondary">
              Product images will use the configured storage provider later. This MVP keeps upload
              previews local to the browser.
            </p>
          </section>
          <div className="rounded-2xl bg-amber-50 p-4 text-sm leading-6 text-amber-900">
            Meta connection details are not implemented in Phase 1. Sensitive tokens should never be
            exposed in the frontend.
          </div>
          <div className="flex justify-end">
            <Button>Save mock settings</Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
