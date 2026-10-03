import type { Platform, PostingTarget } from "../types/postpilot";

export const channelOrder: Platform[] = ["Facebook", "Instagram", "X", "TikTok", "TikTok Shop", "eBay", "Etsy", "Lazada", "Shopee"];
export const productPlatforms: Platform[] = ["eBay", "Etsy", "Lazada", "Shopee", "TikTok Shop"];
export const targetFor = (platform: Platform): PostingTarget => platform === "Facebook" ? "Facebook Page" : platform === "Instagram" ? "Instagram Feed" : platform;
export const platformFor = (target: PostingTarget): Platform => ({ "Facebook Page": "Facebook", "Facebook Story": "Facebook", "Instagram Feed": "Instagram", "Instagram Story": "Instagram", "TikTok Story": "TikTok" } as Partial<Record<PostingTarget, Platform>>)[target] ?? target as Platform;
export const storyFor = (platform: Platform): PostingTarget | undefined => ({ Facebook: "Facebook Story", Instagram: "Instagram Story", TikTok: "TikTok Story" } as Partial<Record<Platform, PostingTarget>>)[platform];
export function sortTargets(targets: PostingTarget[]) {
  return channelOrder.flatMap((platform) => [targetFor(platform), storyFor(platform)].filter((target): target is PostingTarget => !!target && targets.includes(target)));
}
