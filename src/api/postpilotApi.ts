import { isPlatform, type Category, type Platform, type Profile, type User } from "../types/postpilot";
import { getProfilePresentation, saveProfilePresentation } from "../utils/profilePresentation";

const API_BASE_URL = import.meta.env.VITE_POSTPILOT_API_URL ?? "http://localhost:5270";

interface ApiUserDto {
  id: string;
  email: string;
  displayName: string;
  role: "User" | "Admin";
}

interface LoginResponseDto {
  expiresAt: string;
  user: ApiUserDto;
}

interface ApiProfileDto {
  id: string;
  ownerUserId: string;
  name: string;
  websiteName: string | null;
  defaultTargets: string | null;
  updatedAt: string;
}

interface ApiCategoryDto {
  id: string;
  profileId: string;
  name: string;
  color: string;
  description: string | null;
  captionTemplate: string | null;
  tags: string[];
  updatedAt: string;
}

interface ApiMediaDto {
  id: string;
  profileId: string;
  url: string;
  publicUrl: string;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  storageProvider: string;
  uploadedAt: string;
}

interface CreateProfileRequestDto {
  name: string;
  websiteName?: string;
  defaultTargets?: string;
}

interface CategoryRequestDto {
  name: string;
  color?: string;
  description?: string;
  captionTemplate?: string;
  tags: string[];
}

export interface AuthSession {
  expiresAt: string;
  user: User;
}

export interface CreateProfileInput {
  name: string;
  websiteName?: string;
  goal: string;
  avatarUrl?: string;
  platforms: Platform[];
}

export interface UpdateProfileInput extends CreateProfileInput {
}

export interface CategoryInput {
  name: string;
  description?: string;
  color?: string;
  captionTemplate?: string;
  tags: string[];
}

export interface UploadedMedia {
  id: string;
  profileId: string;
  url: string;
  publicUrl: string;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  storageProvider: string;
  uploadedAt: string;
}

export interface ConnectionStatus {
  platform: Platform;
  isSupported: boolean;
  isConfigured: boolean;
  isConnected: boolean;
  displayName?: string | null;
  expiresAt?: string | null;
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
    });
  } catch {
    throw new Error("ไม่สามารถเชื่อมต่อ PostPilot API ได้ กรุณาตรวจสอบว่า Backend กำลังทำงาน");
  }

  if (!response.ok) {
    const details = await response.text();
    throw new Error(details && !details.startsWith("{") ? details.replace(/^"|"$/g, "") : getErrorMessage(response.status));
  }

  if (response.status === 204) {
    return undefined as T;
  }

  const text = await response.text();
  return text ? (JSON.parse(text) as T) : (undefined as T);
}

async function uploadRequest<T>(path: string, formData: FormData, _session: AuthSession): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method: "POST",
      credentials: "include",
      body: formData,
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

function getErrorMessage(status: number) {
  if (status === 401) {
    return "อีเมลหรือรหัสผ่านไม่ถูกต้อง";
  }

  if (status === 403) {
    return "บัญชีนี้ไม่มีสิทธิ์เข้าถึงพื้นที่ทำงานนี้";
  }

  if (status === 404) {
    return "ไม่พบโปรไฟล์ หมวดหมู่ หรือไฟล์ที่ต้องการ";
  }

  if (status === 400) {
    return "ข้อมูลไม่ถูกต้อง กรุณาตรวจสอบรูปภาพและข้อมูลในแบบฟอร์ม";
  }

  return "ไม่สามารถเชื่อมต่อ PostPilot API ได้ กรุณาลองอีกครั้ง";
}

function getAuthHeader(_session: AuthSession) {
  return {};
}

function mapUser(dto: ApiUserDto): User {
  return {
    id: dto.id,
    name: dto.displayName,
    email: dto.email,
    role: dto.role,
  };
}

function mapProfile(dto: ApiProfileDto): Profile {
  const defaultTargets: Platform[] = dto.defaultTargets
    ? dto.defaultTargets.split(",").map((target) => target.trim()).filter(isPlatform)
    : [];

  const presentation = getProfilePresentation(dto.id);

  return {
    id: dto.id,
    name: dto.name,
    shopName: dto.websiteName ?? dto.name,
    description: presentation.goal || "พื้นที่สำหรับวางแผนและจัดการโพสต์สินค้า",
    goal: presentation.goal || "วางแผนและจัดการโพสต์สินค้า",
    avatarUrl: presentation.avatarUrl,
    connectedPlatforms: defaultTargets,
    platforms: defaultTargets,
    defaultTargets: [],
    facebookPageLabel: "เชื่อมต่อ Facebook Page",
    instagramBusinessLabel: "เชื่อมต่อ Instagram Business",
    updatedAt: dto.updatedAt,
  };
}

function mapCategory(dto: ApiCategoryDto): Category {
  const hashtags = dto.tags.filter((tag) => tag.startsWith("#"));
  const mentions = dto.tags.filter((tag) => tag.startsWith("@"));

  return {
    id: dto.id,
    name: dto.name,
    description: dto.description ?? "ยังไม่มีคำอธิบาย",
    color: dto.color || "#F1F5F2",
    hashtags,
    mentions,
    captionTemplate: dto.captionTemplate ?? "",
  };
}

function mapMedia(dto: ApiMediaDto): UploadedMedia {
  return {
    id: dto.id,
    profileId: dto.profileId,
    url: dto.url,
    publicUrl: dto.publicUrl,
    fileName: dto.fileName,
    mimeType: dto.mimeType,
    sizeBytes: dto.sizeBytes,
    storageProvider: dto.storageProvider,
    uploadedAt: dto.uploadedAt,
  };
}

function toCategoryRequest(input: CategoryInput): CategoryRequestDto {
  return {
    name: input.name,
    color: input.color || undefined,
    description: input.description || undefined,
    captionTemplate: input.captionTemplate || undefined,
    tags: input.tags,
  };
}

export async function login(email: string, password: string): Promise<AuthSession> {
  const response = await request<LoginResponseDto>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });

  return {
    expiresAt: response.expiresAt,
    user: mapUser(response.user),
  };
}

export async function restoreSession(): Promise<AuthSession> {
  const response = await request<LoginResponseDto>("/api/auth/session");
  return {
    expiresAt: response.expiresAt,
    user: mapUser(response.user),
  };
}

export async function logout(): Promise<void> {
  await request<void>("/api/auth/logout", { method: "POST" });
}

export async function listProfiles(session: AuthSession): Promise<Profile[]> {
  const response = await request<ApiProfileDto[]>("/api/profiles?noPaging=true", {
    headers: getAuthHeader(session),
  });

  return response.map(mapProfile);
}

export async function createProfile(
  session: AuthSession,
  input: CreateProfileInput,
): Promise<Profile> {
  const body: CreateProfileRequestDto = {
    name: input.name,
    websiteName: input.websiteName || undefined,
    defaultTargets: input.platforms.join(",") || undefined,
  };

  const response = await request<ApiProfileDto>("/api/profiles", {
    method: "POST",
    headers: getAuthHeader(session),
    body: JSON.stringify(body),
  });

  saveProfilePresentation(response.id, {
    avatarUrl: input.avatarUrl,
    goal: input.goal,
  });

  return mapProfile(response);
}

export async function updateProfile(
  session: AuthSession,
  profileId: string,
  input: UpdateProfileInput,
): Promise<Profile> {
  const body: CreateProfileRequestDto = {
    name: input.name,
    websiteName: input.websiteName || undefined,
    defaultTargets: input.platforms.join(",") || undefined,
  };

  const response = await request<ApiProfileDto>(`/api/profiles/${profileId}`, {
    method: "PUT",
    headers: getAuthHeader(session),
    body: JSON.stringify(body),
  });

  saveProfilePresentation(response.id, {
    avatarUrl: input.avatarUrl,
    goal: input.goal,
  });

  return mapProfile(response);
}

export async function deleteProfile(session: AuthSession, profileId: string): Promise<void> {
  await request<void>(`/api/profiles/${profileId}`, {
    method: "DELETE",
    headers: getAuthHeader(session),
  });
}

export async function listConnections(session: AuthSession, profileId: string): Promise<ConnectionStatus[]> {
  return request<ConnectionStatus[]>(`/api/profiles/${profileId}/connections`, {
    headers: getAuthHeader(session),
  });
}

export async function getConnectionAuthorizationUrl(
  session: AuthSession,
  profileId: string,
  platform: Platform,
): Promise<string> {
  const response = await request<{ authorizationUrl: string }>(
    `/api/profiles/${profileId}/connections/${encodeURIComponent(platform)}/authorize`,
    { headers: getAuthHeader(session) },
  );
  return response.authorizationUrl;
}

export async function disconnectPlatform(
  session: AuthSession,
  profileId: string,
  platform: Platform,
): Promise<void> {
  await request<void>(`/api/profiles/${profileId}/connections/${encodeURIComponent(platform)}`, {
    method: "DELETE",
    headers: getAuthHeader(session),
  });
}

export async function listCategories(session: AuthSession, profileId: string): Promise<Category[]> {
  const response = await request<ApiCategoryDto[]>(`/api/profiles/${profileId}/categories?noPaging=true`, {
    headers: getAuthHeader(session),
  });

  return response.map(mapCategory);
}

export async function createCategory(
  session: AuthSession,
  profileId: string,
  input: CategoryInput,
): Promise<Category> {
  const response = await request<ApiCategoryDto>(`/api/profiles/${profileId}/categories`, {
    method: "POST",
    headers: getAuthHeader(session),
    body: JSON.stringify(toCategoryRequest(input)),
  });

  return mapCategory(response);
}

export async function updateCategory(
  session: AuthSession,
  profileId: string,
  categoryId: string,
  input: CategoryInput,
): Promise<Category> {
  const response = await request<ApiCategoryDto>(`/api/profiles/${profileId}/categories/${categoryId}`, {
    method: "PUT",
    headers: getAuthHeader(session),
    body: JSON.stringify(toCategoryRequest(input)),
  });

  return mapCategory(response);
}

export async function deleteCategory(
  session: AuthSession,
  profileId: string,
  categoryId: string,
): Promise<void> {
  await request<void>(`/api/profiles/${profileId}/categories/${categoryId}`, {
    method: "DELETE",
    headers: getAuthHeader(session),
  });
}

export async function uploadMedia(
  session: AuthSession,
  profileId: string,
  file: File,
): Promise<UploadedMedia> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await uploadRequest<ApiMediaDto>(`/api/profiles/${profileId}/media`, formData, session);
  return mapMedia(response);
}
