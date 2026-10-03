import type { PostStatus, PostingTarget, UserRole } from "../types/postpilot";

const statusLabels: Record<PostStatus, string> = {
  Draft: "แบบร่าง",
  Queued: "อยู่ในคิว",
  Posted: "เผยแพร่แล้ว",
  Failed: "ไม่สำเร็จ",
};

const targetLabels: Record<PostingTarget, string> = {
  "Facebook Page": "Facebook Page",
  "Instagram Feed": "ฟีด Instagram",
  "Instagram Story": "สตอรี่ Instagram",
};

const roleLabels: Record<UserRole, string> = {
  User: "ผู้ใช้ทั่วไป",
  Admin: "ผู้ดูแลระบบ",
};

export function getStatusLabel(status: PostStatus) {
  return statusLabels[status];
}

export function getTargetLabel(target: PostingTarget) {
  return targetLabels[target];
}

export function getRoleLabel(role: UserRole) {
  return roleLabels[role];
}
