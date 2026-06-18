import type { AuthSession } from "./postpilotApi";
import type { PostingTarget } from "../types/postpilot";

const API_BASE_URL = import.meta.env.VITE_POSTPILOT_API_URL ?? "http://localhost:5270";

interface ApiHistoryDto {
  id: string;
  postId: string;
  caption: string;
  categoryId: string | null;
  platform: string;
  status: string;
  externalPostId: string | null;
  errorMessage: string | null;
  publishedAt: string;
}

export interface HistoryItem {
  id: string;
  postId: string;
  caption: string;
  categoryId: string;
  platform: PostingTarget;
  status: "Posted" | "Failed";
  externalPostId?: string;
  errorMessage?: string;
  publishedAt: string;
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
    return "This profile or history item could not be found.";
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

function mapTargetPlatform(platform: string): PostingTarget {
  if (platform === "InstagramFeed") {
    return "Instagram Feed";
  }

  if (platform === "InstagramStory") {
    return "Instagram Story";
  }

  return "Facebook Page";
}

function mapHistoryItem(dto: ApiHistoryDto): HistoryItem {
  return {
    id: dto.id,
    postId: dto.postId,
    caption: dto.caption,
    categoryId: dto.categoryId ?? "",
    platform: mapTargetPlatform(dto.platform),
    status: dto.status === "Failed" ? "Failed" : "Posted",
    externalPostId: dto.externalPostId ?? undefined,
    errorMessage: dto.errorMessage ?? undefined,
    publishedAt: dto.publishedAt,
  };
}

export async function listHistory(session: AuthSession, profileId: string): Promise<HistoryItem[]> {
  const response = await request<ApiHistoryDto[]>(`/api/profiles/${profileId}/history`, {
    headers: getAuthHeader(session),
  });

  return response.map(mapHistoryItem);
}
