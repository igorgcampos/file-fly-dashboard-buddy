import { ReactNode } from "react";

interface UserAvatarProps {
  name: string;
  size?: number;
}

function stringToColor(str: string) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const color = `hsl(${hash % 360}, 70%, 70%)`;
  return color;
}

export function UserAvatar({ name, size = 32 }: UserAvatarProps) {
  const initial = name[0]?.toUpperCase() || "?";
  const bg = stringToColor(name);
  return (
    <div
      style={{ width: size, height: size, background: bg }}
      className="flex items-center justify-center rounded-full text-white font-bold text-base shadow"
    >
      {initial}
    </div>
  );
} 