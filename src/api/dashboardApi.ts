import type { AuthSession } from "./postpilotApi";
import type { DashboardMetrics, Post, PostingTarget } from "../types/postpilot";

const API_BASE_URL = import.meta.env.VITE_POSTPILOT_API_URL ?? "http://localhost:5270";

interface ApiPostDto {
  id: string;
  categoryId: string | null;
  caption: string;
  status: "Draft" | "Queued" | "Publishing" | "Posted" | "Failed" | "Skipped";
  targetPlatforms: string[];
  updatedAt: string;
}

interface ApiDashboardDto {
  totalPosts: number;
  draftPosts: number;
  queuedPosts: number;
  postedPosts: number;
  failedPosts: number;
  queueStatus: string;
  recentPosts: ApiPostDto[];
  engagement: {
    reach: number;
    impressions: number;
    engagement: number;
  };
}

export interface DashboardSummary {
  metrics: DashboardMetrics;
  draftPosts: number;
  recentPosts: Post[];
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
    return "This profile dashboard could not be found.";
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

function mapPost(dto: ApiPostDto): Post {
  const status = dto.status === "Posted"
    ? "Posted"
    : dto.status === "Failed" || dto.status === "Skipped"
      ? "Failed"
      : dto.status === "Queued" || dto.status === "Publishing"
        ? "Queued"
        : "Draft";

  return {
    id: dto.id,
    caption: dto.caption,
    categoryId: dto.categoryId ?? "",
    targets: dto.targetPlatforms.map(mapTargetPlatform).filter(Boolean) as PostingTarget[],
    status,
    scheduledFor: dto.updatedAt,
  };
}

function mapDashboard(dto: ApiDashboardDto): DashboardSummary {
  return {
    metrics: {
      totalPosts: dto.totalPosts,
      queuedPosts: dto.queuedPosts,
      postedPosts: dto.postedPosts,
      failedPosts: dto.failedPosts,
      queueStatus: dto.queueStatus,
      reach: dto.engagement.reach,
      impressions: dto.engagement.impressions,
      engagement: dto.engagement.engagement,
    },
    draftPosts: dto.draftPosts,
    recentPosts: dto.recentPosts.map(mapPost),
  };
}

export async function getDashboard(
  session: AuthSession,
  profileId: string,
): Promise<DashboardSummary> {
  const response = await request<ApiDashboardDto>(`/api/profiles/${profileId}/dashboard`, {
    headers: getAuthHeader(session),
  });

  return mapDashboard(response);
}
