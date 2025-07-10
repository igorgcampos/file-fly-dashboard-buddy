import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

interface StatsCardProps {
  title: string;
  value: ReactNode;
  icon: ReactNode;
  gradient: string;
  trend?: string;
  isLoading?: boolean;
}

export default function StatsCard({ title, value, icon, gradient, trend, isLoading }: StatsCardProps) {
  return (
    <div className={cn(
      "rounded-2xl shadow-lg p-6 flex flex-col gap-2 relative overflow-hidden min-h-[120px] bg-white",
      `bg-gradient-to-br ${gradient}`
    )}>
      <div className="flex items-center gap-3 mb-2">
        <div className="bg-white/80 rounded-full p-2 shadow text-primary">{icon}</div>
        <span className="font-semibold text-lg text-white drop-shadow">{title}</span>
      </div>
      {isLoading ? (
        <Skeleton className="h-8 w-20 mb-2" />
      ) : (
        <div className="text-3xl font-bold text-white drop-shadow mb-1">{value}</div>
      )}
      {trend && (
        <div className="text-xs text-white/80 flex items-center gap-1">
          <span>{trend}</span>
        </div>
      )}
    </div>
  );
} 