import { ReactNode } from "react";

interface StatusItemProps {
  icon: ReactNode;
  label: string;
  value: ReactNode;
  color?: string;
}

export function StatusItem({ icon, label, value, color = "green" }: StatusItemProps) {
  return (
    <div className="flex items-center gap-2 py-1">
      <span className={`text-${color}-500`}>{icon}</span>
      <span>{label}</span>
      <span className="ml-auto font-semibold">{value}</span>
    </div>
  );
} 