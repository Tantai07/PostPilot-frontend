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
    return "ไม่พบโปรไฟล์หรือประวัติโพสต์ที่ต้องการ";
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
    errorMessage: dto.errorMessage
      ? "เผยแพร่โพสต์ไม่สำเร็จ กรุณาตรวจสอบการเชื่อมต่อแล้วลองอีกครั้ง"
      : undefined,
    publishedAt: dto.publishedAt,
  };
}

export async function listHistory(session: AuthSession, profileId: string): Promise<HistoryItem[]> {
  const response = await request<ApiHistoryDto[]>(`/api/profiles/${profileId}/history`, {
    headers: getAuthHeader(session),
  });

  return response.map(mapHistoryItem);
}
