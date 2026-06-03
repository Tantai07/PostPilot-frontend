export type Platform = "Facebook" | "Instagram";

export type PostingTarget = "Facebook Page" | "Instagram Feed" | "Instagram Story";

export type PostStatus = "Draft" | "Queued" | "Posted" | "Failed";

export type WorkspaceTabKey =
  | "dashboard"
  | "create-post"
  | "queue"
  | "post-history"
  | "categories"
  | "profile-settings";

export interface User {
  id: string;
  name: string;
  email: string;
}

export interface Profile {
  id: string;
  name: string;
  shopName: string;
  description: string;
  connectedPlatforms: Platform[];
  defaultTargets: PostingTarget[];
  facebookPageLabel: string;
  instagramBusinessLabel: string;
}

export interface Category {
  id: string;
  name: string;
  description: string;
  color: string;
  hashtags: string[];
  mentions: string[];
  captionTemplate: string;
}

export interface Post {
  id: string;
  caption: string;
  categoryId: string;
  targets: PostingTarget[];
  status: PostStatus;
  scheduledFor?: string;
  publishedAt?: string;
  externalPostId?: string;
  errorMessage?: string;
}

export interface DashboardMetrics {
  totalPosts: number;
  queuedPosts: number;
  postedPosts: number;
  failedPosts: number;
  queueStatus: string;
  reach: number;
  impressions: number;
  engagement: number;
}
