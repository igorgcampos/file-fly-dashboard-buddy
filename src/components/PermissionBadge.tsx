import { Badge } from "@/components/ui/badge";

interface PermissionBadgeProps {
  permission: string;
}

const colorMap: Record<string, string> = {
  "Completo": "bg-purple-100 text-purple-700 border-purple-200",
  "Escrita": "bg-yellow-100 text-yellow-700 border-yellow-200",
  "Leitura": "bg-blue-100 text-blue-700 border-blue-200",
};

export function PermissionBadge({ permission }: PermissionBadgeProps) {
  return (
    <Badge className={colorMap[permission] || "bg-muted"}>{permission}</Badge>
  );
} 