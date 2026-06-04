import type { Profile, User } from "../types/postpilot";

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

interface CreateProfileRequestDto {
  name: string;
  websiteName?: string;
  defaultTargets?: string;
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

  return response.json() as Promise<T>;
}

function getErrorMessage(status: number) {
  if (status === 401) {
    return "Email or password is incorrect.";
  }

  if (status === 403) {
    return "Your account does not have access to this workspace.";
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
