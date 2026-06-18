import type { Category, Profile, User } from "../types/postpilot";

const API_BASE_URL = import.meta.env.VITE_POSTPILOT_API_URL ?? "http://localhost:5270";

interface ApiUserDto {
  id: string;
  email: string;
  displayName: string;
  role: "User" | "Admin";
}

interface LoginResponseDto {
  accessToken: string;
  tokenType: string;
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
  accessToken: string;
  tokenType: string;
  expiresAt: string;
  user: User;
}

export interface CreateProfileInput {
  name: string;
  websiteName?: string;
  defaultTargets: string[];
}

export interface CategoryInput {
  name: string;
  description?: string;
  color?: string;
  captionTemplate?: string;
  tags: string[];
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

  if (response.status === 204) {
    return undefined as T;
  }

  const text = await response.text();
  return text ? (JSON.parse(text) as T) : (undefined as T);
}

function getErrorMessage(status: number) {
  if (status === 401) {
    return "Email or password is incorrect.";
  }

  if (status === 403) {
    return "Your account does not have access to this workspace.";
  }

  if (status === 404) {
    return "This profile or category could not be found.";
  }

  return "Could not connect to PostPilot API. Please try again.";
}

function getAuthHeader(session: AuthSession) {
  return {
    Authorization: `${session.tokenType} ${session.accessToken}`,
  };
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
  const defaultTargets = dto.defaultTargets
    ? dto.defaultTargets.split(",").map((target) => target.trim()).filter(Boolean)
    : [];

  return {
    id: dto.id,
    name: dto.name,
    shopName: dto.websiteName ?? dto.name,
    description: dto.websiteName
      ? `Workspace for ${dto.websiteName}.`
      : "Workspace for product posts.",
    connectedPlatforms: [],
    defaultTargets,
    facebookPageLabel: "Connect Facebook Page",
    instagramBusinessLabel: "Connect Instagram Business",
    updatedAt: dto.updatedAt,
  };
}

function mapCategory(dto: ApiCategoryDto): Category {
  const hashtags = dto.tags.filter((tag) => tag.startsWith("#"));
  const mentions = dto.tags.filter((tag) => tag.startsWith("@"));

  return {
    id: dto.id,
    name: dto.name,
    description: dto.description ?? "No description yet.",
    color: dto.color || "#F1F5F2",
    hashtags,
    mentions,
    captionTemplate: dto.captionTemplate ?? "",
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
    accessToken: response.accessToken,
    tokenType: response.tokenType,
    expiresAt: response.expiresAt,
    user: mapUser(response.user),
  };
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
    defaultTargets: input.defaultTargets.length > 0 ? input.defaultTargets.join(", ") : undefined,
  };

  const response = await request<ApiProfileDto>("/api/profiles", {
    method: "POST",
    headers: getAuthHeader(session),
    body: JSON.stringify(body),
  });

  return mapProfile(response);
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