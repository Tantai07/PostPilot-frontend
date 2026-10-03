import type { AuthSession, UploadedMedia } from "./postpilotApi";
import type { Post, PostingTarget } from "../types/postpilot";

const API_BASE_URL = import.meta.env.VITE_POSTPILOT_API_URL ?? "http://localhost:5270";

interface ApiPostDto {
  id: string;
  categoryId: string | null;
  caption: string;
  status: "Draft" | "Queued" | "Publishing" | "Posted" | "Failed" | "Skipped";
  targetPlatforms: string[];
}

export interface CreatePostDraftInput {
  categoryId?: string;
  caption: string;
  media: UploadedMedia[];
  targetPlatforms: PostingTarget[];
}

function getErrorMessage(status: number) {
  if (status === 401) {
    return "อีเมลหรือรหัสผ่านไม่ถูกต้อง";
  }

  if (status === 403) {
    return "บัญชีนี้ไม่มีสิทธิ์เข้าถึงพื้นที่ทำงานนี้";
  }

  if (status === 404) {
    return "ไม่พบโปรไฟล์ หมวดหมู่ รูปภาพ หรือโพสต์ที่ต้องการ";
  }

  if (status === 400) {
    return "กรุณาตรวจสอบข้อความ หมวดหมู่ รูปภาพ และช่องทางเผยแพร่";
  }

  return "ไม่สามารถเชื่อมต่อ PostPilot API ได้ กรุณาลองอีกครั้ง";
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
  const statusMap = {
    Draft: "Draft",
    Queued: "Queued",
    Publishing: "Queued",
    Posted: "Posted",
    Failed: "Failed",
    Skipped: "Failed",
  } as const;

  return {
    id: dto.id,
    caption: dto.caption,
    categoryId: dto.categoryId ?? "",
    targets: dto.targetPlatforms.map(mapTargetPlatform).filter(Boolean) as PostingTarget[],
    status: statusMap[dto.status] ?? "Draft",
  };
}

async function postJson<T>(
  _session: AuthSession,
  path: string,
  body?: unknown,
): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch {
    throw new Error("ไม่สามารถเชื่อมต่อ PostPilot API ได้ กรุณาตรวจสอบว่า Backend กำลังทำงาน");
  }

  if (!response.ok) {
    throw new Error(getErrorMessage(response.status));
  }

  return (await response.json()) as T;
}

export async function createPostDraft(
  session: AuthSession,
  profileId: string,
  input: CreatePostDraftInput,
): Promise<Post> {
  const response = await postJson<ApiPostDto>(session, `/api/profiles/${profileId}/posts`, {
    categoryId: input.categoryId || undefined,
    caption: input.caption,
    mediaIds: input.media.map((media) => media.id),
    targetPlatforms: input.targetPlatforms,
  });

  return mapPost(response);
}

export async function publishPostNow(
  session: AuthSession,
  profileId: string,
  postId: string,
): Promise<Post> {
  const response = await postJson<ApiPostDto>(
    session,
    `/api/profiles/${profileId}/posts/${postId}/publish-now`,
  );

  return mapPost(response);
}
