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
import StatsCard from "@/components/StatsCard";
import { motion } from "framer-motion";

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

  // Exemplo de trends
  const trends = {
    users: "+12% este mês",
    active: stats && stats.total_users ? `${Math.round((stats.active_users / stats.total_users) * 100)}% do total` : "0% do total",
    quota: stats ? `${Math.round((stats.disk_used_gb / stats.disk_total_gb) * 100)}% utilizado` : "-",
    connections: "Tempo real"
  };

  return (
    <div className="p-6 md:p-8 space-y-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8"
        >
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">
              Dashboard FTP
            </h1>
            <p className="text-slate-600 text-lg">
              Gerencie usuários e monitore o servidor vsftpd
            </p>
          </div>
          <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg shadow-blue-500/25 px-6 py-3 rounded-xl transition-all duration-300 hover:scale-105">
            <RefreshCw className="w-5 h-5 mr-2" />
            Novo Usuário
          </Button>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatsCard
            title="Total de Usuários"
            value={stats?.total_users ?? "-"}
            icon={<UserIcon className="w-7 h-7" />}
            gradient="from-blue-500 to-cyan-500"
            trend={trends.users}
            isLoading={loading}
          />
          <StatsCard
            title="Usuários Ativos"
            value={stats?.active_users ?? "-"}
            icon={<UserIcon className="w-7 h-7" />}
            gradient="from-green-500 to-emerald-500"
            trend={trends.active}
            isLoading={loading}
          />
          <StatsCard
            title="Quota Total"
            value={stats ? `${stats.disk_used_gb} GB` : "-"}
            icon={<HardDrive className="w-7 h-7" />}
            gradient="from-purple-500 to-pink-500"
            trend={trends.quota}
            isLoading={loading}
          />
          <StatsCard
            title="Conexões Ativas"
            value={stats?.active_connections ?? "-"}
            icon={<Activity className="w-7 h-7" />}
            gradient="from-orange-500 to-red-500"
            trend={trends.connections}
            isLoading={loading}
          />
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
    </div>
  );
}