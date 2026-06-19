import { type FormEvent, useEffect, useState } from "react";
import { getMetaConnection, saveMetaConnection, type MetaConnection } from "../api/metaApi";
import type { AuthSession } from "../api/postpilotApi";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { Input } from "../components/ui/Input";
import type { Profile } from "../types/postpilot";

interface ProfileSettingsPageProps {
  profile: Profile;
  session: AuthSession;
}

export function ProfileSettingsPage({ profile, session }: ProfileSettingsPageProps) {
  const [connection, setConnection] = useState<MetaConnection | null>(null);
  const [facebookPageId, setFacebookPageId] = useState("");
  const [facebookPageName, setFacebookPageName] = useState("");
  const [credential, setCredential] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [instagramBusinessAccountId, setInstagramBusinessAccountId] = useState("");
  const [instagramDisplayName, setInstagramDisplayName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadConnection() {
      setIsLoading(true);
      setErrorMessage(null);

      try {
        const nextConnection = await getMetaConnection(session, profile.id);
        if (isMounted) {
          setConnection(nextConnection);
          setFacebookPageId(nextConnection.facebookPage?.pageId ?? "");
          setFacebookPageName(nextConnection.facebookPage?.displayName ?? "");
          setExpiresAt(nextConnection.facebookPage?.expiresAt?.slice(0, 16) ?? "");
          setInstagramBusinessAccountId(nextConnection.instagramBusiness?.igUserId ?? "");
          setInstagramDisplayName(nextConnection.instagramBusiness?.displayName ?? "");
        }
      } catch (error) {
        if (isMounted) {
          setErrorMessage(error instanceof Error ? error.message : "Could not load Meta connection.");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadConnection();

    return () => {
      isMounted = false;
    };
  }, [profile.id, session]);

  const saveConnection = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!facebookPageId.trim() || !facebookPageName.trim() || !credential.trim() || !expiresAt) {
      setErrorMessage("Facebook Page ID, Page Name, credential, and expiry date are required.");
      return;
    }

    setIsSaving(true);

    try {
      const nextConnection = await saveMetaConnection(session, profile.id, {
        facebookPageId: facebookPageId.trim(),
        facebookPageName: facebookPageName.trim(),
        pageAccessToken: credential.trim(),
        expiresAt: new Date(expiresAt).toISOString(),
        instagramBusinessAccountId: instagramBusinessAccountId.trim() || undefined,
        instagramDisplayName: instagramDisplayName.trim() || undefined,
      });

      setConnection(nextConnection);
      setCredential("");
      setSuccessMessage("Meta connection saved.");
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Could not save Meta connection.");
    } finally {
      setIsSaving(false);
    }
  };

  const facebookStatus = connection?.facebookPage?.hasCredential
    ? connection.facebookPage.isExpired ? "Expired" : "Connected"
    : "Not connected";
  const instagramStatus = connection?.instagramBusiness?.hasCredential
    ? connection.instagramBusiness.isExpired ? "Expired" : "Connected"
    : "Not connected";

  return (
    <div className="mx-auto max-w-[900px] space-y-6">
      <section>
        <h2 className="text-2xl font-semibold text-postpilot-text">Profile Settings</h2>
        <p className="mt-2 text-sm leading-6 text-postpilot-secondary">
          Manage shop details and Meta connection preparation for this profile.
        </p>
      </section>

      {errorMessage ? <Card className="text-sm text-red-700">{errorMessage}</Card> : null}
      {successMessage ? <Card className="text-sm text-green-700">{successMessage}</Card> : null}
      {isLoading ? <Card className="text-sm text-postpilot-secondary">Loading Meta connection...</Card> : null}

      <Card>
        <div className="grid gap-8">
          <section className="grid gap-5">
            <h3 className="text-lg font-semibold text-postpilot-text">Profile information</h3>
            <Input defaultValue={profile.name} label="Profile name" />
            <Input defaultValue={profile.shopName} label="Website/shop name" />
          </section>
          <section className="grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-postpilot-border bg-postpilot-soft p-4">
              <p className="text-sm font-medium text-postpilot-text">Facebook Page connection</p>
              <p className="mt-2 text-sm text-postpilot-secondary">{connection?.facebookPage?.displayName ?? profile.facebookPageLabel}</p>
              <p className="mt-1 text-xs text-postpilot-secondary">Page ID: {connection?.facebookPage?.pageId ?? "Not set"}</p>
              <Badge tone={facebookStatus === "Connected" ? "success" : facebookStatus === "Expired" ? "error" : "warning"}>{facebookStatus}</Badge>
            </div>
            <div className="rounded-2xl border border-postpilot-border bg-postpilot-soft p-4">
              <p className="text-sm font-medium text-postpilot-text">Instagram Business connection</p>
              <p className="mt-2 text-sm text-postpilot-secondary">{connection?.instagramBusiness?.displayName ?? profile.instagramBusinessLabel}</p>
              <p className="mt-1 text-xs text-postpilot-secondary">IG User ID: {connection?.instagramBusiness?.igUserId ?? "Not set"}</p>
              <Badge tone={instagramStatus === "Connected" ? "success" : instagramStatus === "Expired" ? "error" : "warning"}>{instagramStatus}</Badge>
            </div>
          </section>
        </div>
      </Card>

      <Card>
        <form className="grid gap-5" onSubmit={saveConnection}>
          <div>
            <h3 className="text-lg font-semibold text-postpilot-text">Meta API preparation</h3>
            <p className="mt-2 text-sm leading-6 text-postpilot-secondary">
              Save Facebook Page and Instagram Business identifiers here. The credential is sent to the backend and is not displayed again.
            </p>
          </div>
          <Input label="Facebook Page ID" onChange={(event) => setFacebookPageId(event.target.value)} value={facebookPageId} />
          <Input label="Facebook Page Name" onChange={(event) => setFacebookPageName(event.target.value)} value={facebookPageName} />
          <Input label="Page credential" onChange={(event) => setCredential(event.target.value)} placeholder="Paste new credential" type="password" value={credential} />
          <Input label="Expires At" onChange={(event) => setExpiresAt(event.target.value)} type="datetime-local" value={expiresAt} />
          <Input label="Instagram Business Account ID (optional)" onChange={(event) => setInstagramBusinessAccountId(event.target.value)} value={instagramBusinessAccountId} />
          <Input label="Instagram Display Name (optional)" onChange={(event) => setInstagramDisplayName(event.target.value)} value={instagramDisplayName} />
          <div className="flex justify-end">
            <Button disabled={isSaving}>{isSaving ? "Saving..." : "Save Meta connection"}</Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
