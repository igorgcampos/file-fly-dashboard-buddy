import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, Server, Activity, HardDrive, Plus, Eye } from "lucide-react";
import { Link } from "react-router-dom";

const stats = [
  {
    title: "Usuários Ativos",
    value: "24",
    description: "Conectados agora",
    icon: Users,
    trend: "+2.5%",
    color: "text-accent"
  },
  {
    title: "Servidor FTP",
    value: "Online",
    description: "vsftpd v3.0.5",
    icon: Server,
    trend: "99.9%",
    color: "text-accent"
  },
  {
    title: "Transferências",
    value: "1.2k",
    description: "Últimas 24h",
    icon: Activity,
    trend: "+15.3%",
    color: "text-primary"
  },
  {
    title: "Espaço Usado",
    value: "45.2 GB",
    description: "de 100 GB",
    icon: HardDrive,
    trend: "45.2%",
    color: "text-primary"
  }
];

const recentUsers = [
  { name: "admin", status: "online", lastAccess: "Agora", transfers: 42 },
  { name: "user001", status: "offline", lastAccess: "2h atrás", transfers: 15 },
  { name: "backup", status: "online", lastAccess: "5min atrás", transfers: 8 },
  { name: "test_user", status: "offline", lastAccess: "1d atrás", transfers: 3 }
];

export default function Dashboard() {
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
        {stats.map((stat) => (
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
        ))}
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
            <div className="space-y-4">
              {recentUsers.map((user) => (
                <div key={user.name} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center justify-center w-8 h-8 bg-muted rounded-full">
                      <Users className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{user.name}</p>
                      <p className="text-xs text-muted-foreground">{user.lastAccess}</p>
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
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">vsftpd Status</span>
                <Badge className="bg-accent">Running</Badge>
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
                <span className="text-sm">Conexões Máx.</span>
                <span className="text-sm font-mono">100</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Uptime</span>
                <span className="text-sm">7d 12h 30m</span>
              </div>
            </div>
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