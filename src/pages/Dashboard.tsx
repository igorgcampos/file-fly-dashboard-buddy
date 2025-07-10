import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { apiService } from "@/services/api";
import { User } from "@/services/api";
import { RefreshCw, CheckCircle, AlertTriangle, User as UserIcon, HardDrive, Activity, Shield } from "lucide-react";

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
        <Card className="bg-blue-50">
          <CardContent className="p-4 flex flex-col items-center">
            <UserIcon className="w-6 h-6 text-blue-500 mb-2" />
            <div className="text-2xl font-bold">{stats?.total_users ?? "-"}</div>
            <div className="text-xs text-muted-foreground">Total de Usuários</div>
          </CardContent>
        </Card>
        <Card className="bg-green-50">
          <CardContent className="p-4 flex flex-col items-center">
            <UserIcon className="w-6 h-6 text-green-500 mb-2" />
            <div className="text-2xl font-bold">{stats?.active_users ?? "-"}</div>
            <div className="text-xs text-muted-foreground">Usuários Ativos</div>
          </CardContent>
        </Card>
        <Card className="bg-purple-50">
          <CardContent className="p-4 flex flex-col items-center">
            <HardDrive className="w-6 h-6 text-purple-500 mb-2" />
            <div className="text-2xl font-bold">{stats ? `${stats.disk_used_gb} GB` : "-"}</div>
            <div className="text-xs text-muted-foreground">Quota Total</div>
          </CardContent>
        </Card>
        <Card className="bg-orange-50">
          <CardContent className="p-4 flex flex-col items-center">
            <Activity className="w-6 h-6 text-orange-500 mb-2" />
            <div className="text-2xl font-bold">{stats?.active_connections ?? "-"}</div>
            <div className="text-xs text-muted-foreground">Conexões Ativas</div>
          </CardContent>
        </Card>
      </div>

      {/* Usuários Recentes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Usuários Recentes</CardTitle>
            <Button size="sm" variant="outline" className="absolute right-6 top-6 flex items-center gap-2">
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
                      <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-muted text-primary font-bold">
                        {user.username[0]?.toUpperCase()}
                      </span>
                      {user.username}
                    </td>
                    <td className="py-2">{user.home_dir}</td>
                    <td className="py-2">
                      <Badge variant="outline">Completo</Badge>
                    </td>
                    <td className="py-2">{user.quota_mb} MB</td>
                    <td className="py-2">
                      <Badge className={user.status === "Ativo" ? "bg-green-100 text-green-700" : "bg-muted"}>{user.status}</Badge>
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
            <ul className="space-y-2">
              <li className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-green-500" />
                <span>Servidor vsftpd</span>
                <CheckCircle className="w-4 h-4 text-green-500 ml-auto" />
              </li>
              <li className="flex items-center gap-2">
                <HardDrive className="w-4 h-4 text-blue-500" />
                <span>Porta FTP</span>
                <span className="ml-auto">{stats?.ftp_port ?? 21}</span>
              </li>
              <li className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-purple-500" />
                <span>SSL/TLS</span>
                <span className="ml-auto">{stats?.ssl_enabled ? "Habilitado" : "Desabilitado"}</span>
              </li>
              <li className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-orange-500" />
                <span>Conexões Ativas</span>
                <span className="ml-auto">{stats?.active_connections ?? "-"}</span>
              </li>
            </ul>
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