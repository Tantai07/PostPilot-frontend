import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { Input } from "../components/ui/Input";
import type { PostingTarget, Profile } from "../types/postpilot";

interface CreateProfilePageProps {
  onCancel: () => void;
  onCreateProfile: (profile: Profile) => void;
}

export function CreateProfilePage({ onCancel, onCreateProfile }: CreateProfilePageProps) {
  const targets: PostingTarget[] = ["Facebook Page", "Instagram Feed", "Instagram Story"];

  return (
    <main className="min-h-screen bg-postpilot-background px-5 py-10">
      <div className="mx-auto max-w-[900px]">
        <button
          className="text-sm font-medium text-postpilot-secondary hover:text-postpilot-text"
          onClick={onCancel}
          type="button"
        >
          Back to profiles
        </button>
        <div className="mt-6">
          <h1 className="text-3xl font-semibold text-postpilot-text">Create profile</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-postpilot-secondary">
            Set up a shop workspace. Connection details are placeholders for now.
          </p>
        </div>
        <Card className="mt-8">
          <form
            className="grid gap-5"
            onSubmit={(event) => {
              event.preventDefault();
              onCreateProfile({
                id: "profile-new",
                name: "New Shop Profile",
                shopName: "New Shop",
                description: "A new PostPilot workspace for product posts.",
                connectedPlatforms: ["Facebook", "Instagram"],
                defaultTargets: ["Facebook Page"],
                facebookPageLabel: "Facebook Page placeholder",
                instagramBusinessLabel: "Instagram Business placeholder",
              });
            }}
          >
            <Input label="Profile name" placeholder="Mali Vintage" />
            <Input label="Shop name" placeholder="Mali Vintage Closet" />
            <Input label="Facebook Page name or Page ID" placeholder="Facebook Page name or ID" />
            <Input label="Instagram Business account name or ID" placeholder="@shopname or account ID" />
            <fieldset>
              <legend className="text-sm font-medium text-postpilot-text">
                Default posting targets
              </legend>
              <div className="mt-3 grid gap-3 sm:grid-cols-3">
                {targets.map((target, index) => (
                  <label
                    className="flex items-center gap-3 rounded-xl border border-postpilot-border bg-white px-4 py-3 text-sm text-postpilot-secondary"
                    key={target}
                  >
                    <input
                      className="h-4 w-4 accent-postpilot-accent"
                      defaultChecked={index === 0}
                      type="checkbox"
                    />
                    {target}
                  </label>
                ))}
              </div>
            </fieldset>
            <div className="rounded-2xl bg-postpilot-accentSoft p-4 text-sm leading-6 text-postpilot-secondary">
              Meta connection setup will be added later. No access tokens or secrets are stored in this
              mock frontend.
            </div>
            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <Button onClick={onCancel} variant="secondary">
                Cancel
              </Button>
              <Button type="submit">Create profile</Button>
            </div>
          </form>
        </Card>
      </div>
    </main>
  );
}
