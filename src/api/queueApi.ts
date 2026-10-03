import type { AuthSession } from "./postpilotApi";
import type { Post, PostingTarget } from "../types/postpilot";

const API_BASE_URL = import.meta.env.VITE_POSTPILOT_API_URL ?? "http://localhost:5270";

interface ApiQueueItemDto {
  id: string;
  profileId: string;
  postId: string;
  sortOrder: number;
  scheduledAt: string | null;
  status: "Pending" | "Processing" | "Posted" | "Failed" | "Skipped";
  caption: string;
  categoryId: string | null;
  targetPlatforms: string[];
}

export interface QueueItem extends Post {
  queueItemId: string;
  sortOrder: number;
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
    return "ไม่พบโปรไฟล์ โพสต์ หรือรายการในคิวที่ต้องการ";
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

  const text = await response.text();
  return text ? (JSON.parse(text) as T) : (undefined as T);
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

function mapQueueItem(dto: ApiQueueItemDto): QueueItem {
  return {
    queueItemId: dto.id,
    sortOrder: dto.sortOrder,
    id: dto.postId,
    caption: dto.caption,
    categoryId: dto.categoryId ?? "",
    targets: dto.targetPlatforms.map(mapTargetPlatform).filter(Boolean) as PostingTarget[],
    status: dto.status === "Posted" ? "Posted" : dto.status === "Failed" ? "Failed" : "Queued",
    scheduledFor: dto.scheduledAt ?? undefined,
  };
}

export async function listQueue(session: AuthSession, profileId: string): Promise<QueueItem[]> {
  const response = await request<ApiQueueItemDto[]>(`/api/profiles/${profileId}/queue`, {
    headers: getAuthHeader(session),
  });

  return response.map(mapQueueItem);
}

export async function addPostToQueue(
  session: AuthSession,
  profileId: string,
  postId: string,
): Promise<QueueItem> {
  const response = await request<ApiQueueItemDto>(`/api/profiles/${profileId}/posts/${postId}/queue`, {
    method: "POST",
    headers: getAuthHeader(session),
  });

  return mapQueueItem(response);
}

export async function reorderQueue(
  session: AuthSession,
  profileId: string,
  queueItemIds: string[],
): Promise<QueueItem[]> {
  const response = await request<ApiQueueItemDto[]>(`/api/profiles/${profileId}/queue`, {
    method: "PUT",
    headers: getAuthHeader(session),
    body: JSON.stringify({ queueItemIds }),
  });

  return response.map(mapQueueItem);
}

export async function postNext(session: AuthSession, profileId: string): Promise<QueueItem> {
  const response = await request<ApiQueueItemDto>(`/api/profiles/${profileId}/queue/post-next`, {
    method: "POST",
    headers: getAuthHeader(session),
  });

  return mapQueueItem(response);
}
