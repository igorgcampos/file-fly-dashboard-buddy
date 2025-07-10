import { useEffect, useState } from "react";
import { MetricCard } from "@/components/MetricCard";
import { UserAvatar } from "@/components/UserAvatar";
import { PermissionBadge } from "@/components/PermissionBadge";
import { StatusItem } from "@/components/StatusItem";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { apiService } from "@/services/api";
import { User } from "@/services/api";
import { RefreshCw, User as UserIcon, HardDrive, Activity, Shield, Server, CheckCircle, AlertTriangle } from "lucide-react";

export default function Dashboard() {
  const [stats, setStats] = useState<any>(null);
  const [recentUsers, setRecentUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      const stats = await apiService.getDashboardStats();
      const users = await apiService.getRecentUsers();
      setStats(stats);
      setRecentUsers(users as any);
      setLoading(false);
    }
    fetchData();
  }, []);

  return (
    <div className="p-6 space-y-6">
      {/* Cards de Métricas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <MetricCard icon={<UserIcon className="w-7 h-7" />} value={stats?.total_users ?? "-"} label="Total de Usuários" color="blue" />
        <MetricCard icon={<UserIcon className="w-7 h-7" />} value={stats?.active_users ?? "-"} label="Usuários Ativos" color="green" />
        <MetricCard icon={<HardDrive className="w-7 h-7" />} value={stats ? `${stats.disk_used_gb} GB` : "-"} label="Quota Total" color="purple" />
        <MetricCard icon={<Activity className="w-7 h-7" />} value={stats?.active_connections ?? "-"} label="Conexões Ativas" color="orange" />
      </div>

      {/* Usuários Recentes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Usuários Recentes</CardTitle>
            <Button size="sm" variant="outline" className="flex items-center gap-2">
              <RefreshCw className="w-4 h-4" /> Atualizar
            </Button>
          </CardHeader>
          <CardContent>
            <table className="w-full text-sm">
              <thead>
                <tr className="text-muted-foreground">
                  <th className="text-left">Usuário</th>
                  <th className="text-left">Diretório</th>
                  <th>Permissões</th>
                  <th>Quota</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {recentUsers.map((user, i) => (
                  <tr key={i} className="border-b last:border-0">
                    <td className="py-2 font-medium flex items-center gap-2">
                      <UserAvatar name={user.username} size={28} />
                      {user.username}
                    </td>
                    <td className="py-2">{user.home_dir}</td>
                    <td className="py-2">
                      <PermissionBadge permission={user.permissions || "Completo"} />
                    </td>
                    <td className="py-2">{user.quota_mb} MB</td>
                    <td className="py-2">
                      <span className={user.status === "Ativo" ? "bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs" : "bg-muted px-2 py-1 rounded-full text-xs"}>{user.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>

        {/* Status do Sistema */}
        <Card>
          <CardHeader>
            <CardTitle>Status do Sistema</CardTitle>
          </CardHeader>
          <CardContent>
            <StatusItem icon={<Server className="w-4 h-4" />} label="Servidor vsftpd" value={<span className="text-green-600">Operacional</span>} color="green" />
            <StatusItem icon={<HardDrive className="w-4 h-4" />} label="Porta FTP" value={stats?.ftp_port ?? 21} color="blue" />
            <StatusItem icon={<Shield className="w-4 h-4" />} label="SSL/TLS" value={stats?.ssl_enabled ? "Habilitado" : "Desabilitado"} color={stats?.ssl_enabled ? "green" : "gray"} />
            <StatusItem icon={<Activity className="w-4 h-4" />} label="Conexões Ativas" value={stats?.active_connections ?? "-"} color="orange" />
          </CardContent>
        </Card>
      </div>

      {/* Ações Rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Ações Rápidas</CardTitle>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="flex items-center gap-2">
              <RefreshCw className="w-4 h-4" /> Reiniciar vsftpd
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}