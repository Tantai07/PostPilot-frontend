import type { AuthSession } from "./postpilotApi";

const API_BASE_URL = import.meta.env.VITE_POSTPILOT_API_URL ?? "http://localhost:5270";

export interface ConnectedSocialAccount {
  id: string;
  platform: "Facebook" | "Instagram";
  pageId: string;
  igUserId?: string;
  displayName: string;
  hasCredential: boolean;
  expiresAt?: string;
  isExpired: boolean;
}

export interface MetaConnection {
  isConnected: boolean;
  facebookPage?: ConnectedSocialAccount;
  instagramBusiness?: ConnectedSocialAccount;
}

export interface SaveMetaConnectionInput {
  facebookPageId: string;
  facebookPageName: string;
  pageAccessToken: string;
  expiresAt: string;
  instagramBusinessAccountId?: string;
  instagramDisplayName?: string;
}

function getAuthHeader(session: AuthSession) {
  return {
    Authorization: `${session.tokenType} ${session.accessToken}`,
  };
}

function getErrorMessage(status: number) {
  if (status === 401) {
    return "Email or password is incorrect.";
  }

  if (status === 403) {
    return "Your account does not have access to this workspace.";
  }

  if (status === 404) {
    return "This profile could not be found.";
  }

  if (status === 400) {
    return "Please check the Meta connection fields.";
  }

  return "Could not connect to PostPilot API. Please try again.";
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  if (!response.ok) {
    throw new Error(getErrorMessage(response.status));
  }

  return (await response.json()) as T;
}

export async function getMetaConnection(
  session: AuthSession,
  profileId: string,
): Promise<MetaConnection> {
  return request<MetaConnection>(`/api/profiles/${profileId}/meta-connection`, {
    headers: getAuthHeader(session),
  });
}

export async function saveMetaConnection(
  session: AuthSession,
  profileId: string,
  input: SaveMetaConnectionInput,
): Promise<MetaConnection> {
  return request<MetaConnection>(`/api/profiles/${profileId}/meta-connection`, {
    method: "PUT",
    headers: getAuthHeader(session),
    body: JSON.stringify(input),
  });
}
