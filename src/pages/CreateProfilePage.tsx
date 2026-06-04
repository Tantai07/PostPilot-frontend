import { useState } from "react";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { Input } from "../components/ui/Input";
import type { CreateProfileInput } from "../api/postpilotApi";
import type { PostingTarget, Profile } from "../types/postpilot";

interface CreateProfilePageProps {
  errorMessage?: string | null;
  isLoading?: boolean;
  onCancel: () => void;
  onCreateProfile: (profile: CreateProfileInput) => Promise<Profile | void> | void;
}

export function CreateProfilePage({
  errorMessage,
  isLoading = false,
  onCancel,
  onCreateProfile,
}: CreateProfilePageProps) {
  const targets: PostingTarget[] = ["Facebook Page", "Instagram Feed", "Instagram Story"];
  const [selectedTargets, setSelectedTargets] = useState<string[]>(["Facebook Page"]);

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
            onSubmit={async (event) => {
              event.preventDefault();
              const formData = new FormData(event.currentTarget);
              await onCreateProfile({
                name: String(formData.get("name") ?? ""),
                websiteName: String(formData.get("websiteName") ?? ""),
                defaultTargets: selectedTargets,
              });
            }}
          >
            <Input
              disabled={isLoading}
              label="Profile name"
              name="name"
              placeholder="Mali Vintage"
              required
            />
            <Input
              disabled={isLoading}
              label="Shop name"
              name="websiteName"
              placeholder="Mali Vintage Closet"
            />
            <Input
              disabled
              label="Facebook Page name or Page ID"
              placeholder="Facebook connection will be added later"
            />
            <Input
              disabled
              label="Instagram Business account name or ID"
              placeholder="Instagram connection will be added later"
            />
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
                      checked={selectedTargets.includes(target)}
                      disabled={isLoading}
                      onChange={(event) => {
                        setSelectedTargets((current) =>
                          event.target.checked
                            ? [...current, target]
                            : current.filter((value) => value !== target),
                        );
                      }}
                      type="checkbox"
                    />
                    {target}
                  </label>
                ))}
              </div>
            </fieldset>
            <div className="rounded-2xl bg-postpilot-accentSoft p-4 text-sm leading-6 text-postpilot-secondary">
              Meta connection setup will be added later. Profile details are saved through the
              PostPilot API.
            </div>
            {errorMessage ? (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-800">
                {errorMessage}
              </div>
            ) : null}
            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <Button disabled={isLoading} onClick={onCancel} variant="secondary">
                Cancel
              </Button>
              <Button disabled={isLoading} type="submit">
                {isLoading ? "Creating profile" : "Create profile"}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </main>
  );
}
