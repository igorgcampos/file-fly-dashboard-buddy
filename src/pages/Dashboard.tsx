import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, Server, Activity, HardDrive, Plus, Eye, AlertCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { useDashboardStats, useRecentUsers } from "@/hooks/useDashboard";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function Dashboard() {
  const { data: dashboardStats, isLoading: statsLoading, error: statsError } = useDashboardStats();
  const { data: recentUsers, isLoading: usersLoading, error: usersError } = useRecentUsers();

  const getStatsData = () => {
    if (!dashboardStats) return [];
    
    return [
      {
        title: "Usuários Ativos",
        value: dashboardStats.active_users.toString(),
        description: "Conectados agora",
        icon: Users,
        trend: dashboardStats.active_users > 0 ? "Online" : "Offline",
        color: "text-accent"
      },
      {
        title: "Servidor FTP",
        value: dashboardStats.server_status === "online" ? "Online" : "Offline",
        description: dashboardStats.server_version,
        icon: Server,
        trend: dashboardStats.uptime,
        color: dashboardStats.server_status === "online" ? "text-accent" : "text-destructive"
      },
      {
        title: "Transferências",
        value: dashboardStats.transfers_24h.toString(),
        description: "Últimas 24h",
        icon: Activity,
        trend: `${dashboardStats.transfers_24h} transfers`,
        color: "text-primary"
      },
      {
        title: "Espaço Usado",
        value: `${dashboardStats.disk_used_gb} GB`,
        description: `de ${dashboardStats.disk_total_gb} GB`,
        icon: HardDrive,
        trend: `${dashboardStats.disk_usage_percent}%`,
        color: "text-primary"
      }
    ];
  };
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground mt-1">Visão geral do servidor FTP</p>
        </div>
        <div className="flex gap-3">
          <Button asChild variant="outline">
            <Link to="/logs">
              <Eye className="w-4 h-4 mr-2" />
              Ver Logs
            </Link>
          </Button>
          <Button asChild className="bg-gradient-to-r from-primary to-primary-glow">
            <Link to="/users/new">
              <Plus className="w-4 h-4 mr-2" />
              Novo Usuário
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsLoading ? (
          Array(4).fill(0).map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16 mb-2" />
                <div className="flex items-center justify-between">
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-5 w-12" />
                </div>
              </CardContent>
            </Card>
          ))
        ) : statsError ? (
          <div className="col-span-full">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Erro ao carregar estatísticas: {statsError.message}
              </AlertDescription>
            </Alert>
          </div>
        ) : (
          getStatsData().map((stat) => (
            <Card key={stat.title} className="hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <div className="flex items-center justify-between">
                  <p className="text-xs text-muted-foreground">
                    {stat.description}
                  </p>
                  <Badge variant="secondary" className="text-xs">
                    {stat.trend}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Users */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Usuários Recentes
            </CardTitle>
            <CardDescription>
              Últimas atividades dos usuários
            </CardDescription>
          </CardHeader>
          <CardContent>
            {usersLoading ? (
              <div className="space-y-4">
                {Array(4).fill(0).map((_, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Skeleton className="w-8 h-8 rounded-full" />
                      <div>
                        <Skeleton className="h-4 w-20 mb-1" />
                        <Skeleton className="h-3 w-16" />
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Skeleton className="h-3 w-16" />
                      <Skeleton className="h-5 w-12" />
                    </div>
                  </div>
                ))}
              </div>
            ) : usersError ? (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Erro ao carregar usuários recentes: {usersError.message}
                </AlertDescription>
              </Alert>
            ) : recentUsers && recentUsers.length > 0 ? (
              <div className="space-y-4">
                {recentUsers.map((user) => (
                  <div key={user.name} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center justify-center w-8 h-8 bg-muted rounded-full">
                        <Users className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">{user.name}</p>
                        <p className="text-xs text-muted-foreground">{user.last_access}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-muted-foreground">
                        {user.transfers} transfers
                      </span>
                      <Badge 
                        variant={user.status === "online" ? "default" : "secondary"}
                        className={user.status === "online" ? "bg-accent" : ""}
                      >
                        {user.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-muted-foreground py-4">
                Nenhuma atividade recente encontrada
              </div>
            )}
            <div className="mt-4 pt-4 border-t">
              <Button asChild variant="outline" className="w-full">
                <Link to="/users">
                  Ver Todos os Usuários
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Server Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Server className="w-5 h-5" />
              Status do Servidor
            </CardTitle>
            <CardDescription>
              Informações do sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <div className="space-y-4">
                {Array(5).fill(0).map((_, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-5 w-16" />
                  </div>
                ))}
              </div>
            ) : statsError ? (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Erro ao carregar status do servidor
                </AlertDescription>
              </Alert>
            ) : dashboardStats ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">vsftpd Status</span>
                  <Badge className={dashboardStats.server_status === "online" ? "bg-accent" : "bg-destructive"}>
                    {dashboardStats.server_status === "online" ? "Running" : "Stopped"}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Porta</span>
                  <span className="text-sm font-mono">21</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">SSL/TLS</span>
                  <Badge variant="secondary">Habilitado</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Conexões Ativas</span>
                  <span className="text-sm font-mono">{dashboardStats.active_users}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Uptime</span>
                  <span className="text-sm">{dashboardStats.uptime}</span>
                </div>
              </div>
            ) : null}
            <div className="mt-4 pt-4 border-t">
              <Button asChild variant="outline" className="w-full">
                <Link to="/settings">
                  Configurações
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}