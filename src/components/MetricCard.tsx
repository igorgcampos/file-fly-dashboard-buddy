import { ReactNode } from "react";

interface MetricCardProps {
  icon: ReactNode;
  value: ReactNode;
  label: string;
  color?: string;
  children?: ReactNode;
}

export function MetricCard({ icon, value, label, color = "blue", children }: MetricCardProps) {
  return (
    <div className={`rounded-xl shadow bg-${color}-50 p-4 flex flex-col items-center relative overflow-hidden`}> 
      <div className={`absolute right-2 top-2 opacity-10 text-${color}-400 text-7xl select-none pointer-events-none`}>{icon}</div>
      <div className={`z-10 flex flex-col items-center`}>
        <div className={`text-2xl font-bold text-${color}-700`}>{value}</div>
        <div className="text-xs text-muted-foreground mb-1">{label}</div>
        {children}
      </div>
    </div>
  );
} 