import { UserRound } from "lucide-react";

interface ProfileAvatarProps {
  avatarUrl?: string;
  name: string;
  size?: "sm" | "md" | "lg";
}

const sizes = {
  sm: "h-10 w-10",
  md: "h-14 w-14",
  lg: "h-28 w-28",
};

const iconSizes = {
  sm: 18,
  md: 24,
  lg: 42,
};

export function ProfileAvatar({ avatarUrl, name, size = "md" }: ProfileAvatarProps) {
  const className = `${sizes[size]} shrink-0 overflow-hidden rounded-full bg-postpilot-accentSoft text-postpilot-accent ring-1 ring-postpilot-border`;

  if (avatarUrl) {
    return <img alt={`รูปโปรไฟล์ ${name}`} className={`${className} object-cover`} src={avatarUrl} />;
  }

  return (
    <div aria-label={`รูปเริ่มต้นของ ${name}`} className={`flex items-center justify-center ${className}`}>
      <UserRound aria-hidden="true" size={iconSizes[size]} strokeWidth={1.7} />
    </div>
  );
}
