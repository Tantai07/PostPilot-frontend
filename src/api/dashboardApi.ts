import type { AuthSession } from "./postpilotApi";
import type { DashboardMetrics, Post, PostingTarget } from "../types/postpilot";
import { API_BASE_URL } from "../config/environment";

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

function getAuthHeader(_session: AuthSession) {
  return {};
}

function getErrorMessage(status: number) {
  if (status === 401) {
    return "อีเมลหรือรหัสผ่านไม่ถูกต้อง";
  }

  if (status === 403) {
    return "บัญชีนี้ไม่มีสิทธิ์เข้าถึงพื้นที่ทำงานนี้";
  }

  if (status === 404) {
    return "ไม่พบข้อมูลภาพรวมของโปรไฟล์นี้";
  }

  return "ไม่สามารถเชื่อมต่อ PostPilot API ได้ กรุณาลองอีกครั้ง";
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      credentials: "include",
      headers: { "Content-Type": "application/json", ...options.headers },
    });
  } catch {
    throw new Error("ไม่สามารถเชื่อมต่อ PostPilot API ได้ กรุณาตรวจสอบว่า Backend กำลังทำงาน");
  }

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
