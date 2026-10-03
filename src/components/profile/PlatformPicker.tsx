import { Check } from "lucide-react";
import { SiEbay, SiEtsy, SiFacebook, SiInstagram, SiShopee, SiTiktok, SiX } from "react-icons/si";
import type { IconType } from "react-icons";
import type { Platform } from "../../types/postpilot";

interface PlatformOption {
  name: Platform;
  color: string;
  Icon?: IconType;
  imageUrl?: string;
}

export const platformOptions: PlatformOption[] = [
  { name: "Facebook", color: "#1877F2", Icon: SiFacebook },
  { name: "Instagram", color: "#C13584", Icon: SiInstagram },
  { name: "X", color: "#111111", Icon: SiX },
  { name: "eBay", color: "#3665F3", Icon: SiEbay },
  { name: "Etsy", color: "#F1641E", Icon: SiEtsy },
  { name: "Lazada", color: "#0F146D", imageUrl: "/platforms/lazada.svg" },
  { name: "Shopee", color: "#EE4D2D", Icon: SiShopee },
  { name: "TikTok", color: "#111111", Icon: SiTiktok },
  { name: "TikTok Shop", color: "#111111", Icon: SiTiktok },
];

export function PlatformLogo({ platform, size = "md" }: { platform: Platform; size?: "sm" | "md" }) {
  const option = platformOptions.find((item) => item.name === platform)!;
  const Icon = option.Icon;
  const sizeClasses = size === "sm" ? "h-9 w-9" : "h-11 w-11";

  return (
    <span
      aria-hidden="true"
      className={`flex ${sizeClasses} shrink-0 items-center justify-center rounded-full bg-white ring-1 ring-postpilot-borderSoft`}
      style={{ color: option.color }}
    >
      {Icon ? <Icon size={size === "sm" ? 18 : 22} /> : option.imageUrl ? (
        <img alt="" className="h-6 w-6 object-contain" src={option.imageUrl} />
      ) : null}
    </span>
  );
}

interface PlatformPickerProps {
  disabled?: boolean;
  onChange: (platforms: Platform[]) => void;
  value: Platform[];
}

export function PlatformPicker({ disabled = false, onChange, value }: PlatformPickerProps) {
  const togglePlatform = (platform: Platform) => {
    onChange(
      value.includes(platform)
        ? value.filter((item) => item !== platform)
        : [...value, platform],
    );
  };

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {platformOptions.map((option) => {
        const isSelected = value.includes(option.name);
        return (
          <button
            aria-pressed={isSelected}
            className={`relative flex min-h-20 items-center gap-3 rounded-xl border px-3 py-3 text-left transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#1A3D2F]/20 disabled:cursor-not-allowed disabled:opacity-60 ${
              isSelected
                ? "border-postpilot-accent bg-postpilot-accentSoft text-postpilot-accent"
                : "border-postpilot-border bg-white text-postpilot-text hover:bg-postpilot-soft"
            }`}
            disabled={disabled}
            key={option.name}
            onClick={() => togglePlatform(option.name)}
            type="button"
          >
            <PlatformLogo platform={option.name} size="sm" />
            <span className="min-w-0 break-words text-sm font-semibold">{option.name}</span>
            {isSelected ? (
              <span className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-postpilot-accent text-white">
                <Check size={13} strokeWidth={3} />
              </span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}
