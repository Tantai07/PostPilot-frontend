import type { AuthSession } from "./postpilotApi";
import type { Post, PostStatus, PostingTarget } from "../types/postpilot";

const API_BASE_URL = import.meta.env.VITE_POSTPILOT_API_URL ?? "http://localhost:5270";

interface ApiPostDto {
  id: string;
  categoryId: string | null;
  caption: string;
  status: "Draft" | "Queued" | "Publishing" | "Posted" | "Failed" | "Skipped";
  targetPlatforms: string[];
  updatedAt: string;
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
    return "This profile or post could not be found.";
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

function mapTargetPlatform(targetPlatform: string): PostingTarget | null {
  if (targetPlatform === "FacebookPage") {
    return "Facebook Page";
  }

  if (targetPlatform === "InstagramFeed") {
    return "Instagram Feed";
  }

  if (targetPlatform === "InstagramStory") {
    return "Instagram Story";
  }

  return null;
}

function mapStatus(status: ApiPostDto["status"]): PostStatus {
  if (status === "Posted") {
    return "Posted";
  }

  if (status === "Failed" || status === "Skipped") {
    return "Failed";
  }

  if (status === "Queued" || status === "Publishing") {
    return "Queued";
  }

  return "Draft";
}

function mapPost(dto: ApiPostDto): Post {
  return {
    id: dto.id,
    caption: dto.caption,
    categoryId: dto.categoryId ?? "",
    targets: dto.targetPlatforms.map(mapTargetPlatform).filter(Boolean) as PostingTarget[],
    status: mapStatus(dto.status),
    scheduledFor: dto.updatedAt,
  };
}

export async function listPosts(
  session: AuthSession,
  profileId: string,
  status?: PostStatus,
): Promise<Post[]> {
  const params = new URLSearchParams();
  params.set("pageSize", "50");
  if (status) {
    params.set("status", status);
  }

  const response = await request<ApiPostDto[]>(`/api/profiles/${profileId}/posts?${params.toString()}`, {
    headers: getAuthHeader(session),
  });

  return response.map(mapPost);
}

export async function publishPostNow(
  session: AuthSession,
  profileId: string,
  postId: string,
): Promise<Post> {
  const response = await request<ApiPostDto>(`/api/profiles/${profileId}/posts/${postId}/publish-now`, {
    method: "POST",
    headers: getAuthHeader(session),
  });

  return mapPost(response);
}
