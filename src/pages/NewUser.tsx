import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, User, Shield, Folder, HardDrive } from "lucide-react";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

export default function NewUser() {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    homeDirectory: "",
    permissions: "read-write",
    quotaLimit: "5",
    quotaUnit: "GB",
    enableQuota: true,
    isActive: true,
    allowUpload: true,
    allowDownload: true,
    allowDelete: false,
    description: ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validações básicas
    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Erro",
        description: "As senhas não coincidem.",
        variant: "destructive",
      });
      return;
    }

    if (formData.username.length < 3) {
      toast({
        title: "Erro",
        description: "Nome de usuário deve ter pelo menos 3 caracteres.",
        variant: "destructive",
      });
      return;
    }

    // Simular criação do usuário
    toast({
      title: "Usuário criado com sucesso!",
      description: `O usuário ${formData.username} foi criado no sistema.`,
    });

    console.log("Dados do usuário:", formData);
  };

  const updateFormData = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link to="/users">
            <ArrowLeft className="w-4 h-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Novo Usuário FTP</h1>
          <p className="text-muted-foreground mt-1">Criar uma nova conta de usuário FTP</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Informações Básicas */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Informações Básicas
              </CardTitle>
              <CardDescription>
                Dados fundamentais do usuário
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Nome de Usuário *</Label>
                <Input
                  id="username"
                  placeholder="Digite o nome de usuário"
                  value={formData.username}
                  onChange={(e) => updateFormData("username", e.target.value)}
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Apenas letras, números e underscore. Mínimo 3 caracteres.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="usuario@exemplo.com"
                  value={formData.email}
                  onChange={(e) => updateFormData("email", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Senha *</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Digite uma senha segura"
                  value={formData.password}
                  onChange={(e) => updateFormData("password", e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmar Senha *</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Confirme a senha"
                  value={formData.confirmPassword}
                  onChange={(e) => updateFormData("confirmPassword", e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  placeholder="Descrição opcional do usuário"
                  value={formData.description}
                  onChange={(e) => updateFormData("description", e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Configurações de Acesso */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Permissões e Acesso
              </CardTitle>
              <CardDescription>
                Configure as permissões do usuário
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="permissions">Nível de Permissão</Label>
                <Select value={formData.permissions} onValueChange={(value) => updateFormData("permissions", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione as permissões" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Administrador</SelectItem>
                    <SelectItem value="read-write">Leitura e Escrita</SelectItem>
                    <SelectItem value="read-only">Apenas Leitura</SelectItem>
                    <SelectItem value="write-only">Apenas Escrita</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Usuário Ativo</Label>
                    <p className="text-xs text-muted-foreground">
                      Permitir login do usuário
                    </p>
                  </div>
                  <Switch
                    checked={formData.isActive}
                    onCheckedChange={(checked) => updateFormData("isActive", checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Permitir Upload</Label>
                    <p className="text-xs text-muted-foreground">
                      Usuário pode enviar arquivos
                    </p>
                  </div>
                  <Switch
                    checked={formData.allowUpload}
                    onCheckedChange={(checked) => updateFormData("allowUpload", checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Permitir Download</Label>
                    <p className="text-xs text-muted-foreground">
                      Usuário pode baixar arquivos
                    </p>
                  </div>
                  <Switch
                    checked={formData.allowDownload}
                    onCheckedChange={(checked) => updateFormData("allowDownload", checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Permitir Exclusão</Label>
                    <p className="text-xs text-muted-foreground">
                      Usuário pode deletar arquivos
                    </p>
                  </div>
                  <Switch
                    checked={formData.allowDelete}
                    onCheckedChange={(checked) => updateFormData("allowDelete", checked)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Configurações de Diretório */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Folder className="w-5 h-5" />
                Diretório Home
              </CardTitle>
              <CardDescription>
                Configure o diretório inicial do usuário
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="homeDirectory">Caminho do Diretório</Label>
                <Input
                  id="homeDirectory"
                  placeholder="/home/usuario"
                  value={formData.homeDirectory}
                  onChange={(e) => updateFormData("homeDirectory", e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Deixe em branco para usar /home/{formData.username || "usuario"}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Configurações de Quota */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <HardDrive className="w-5 h-5" />
                Quota de Disco
              </CardTitle>
              <CardDescription>
                Defina limites de armazenamento
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Habilitar Quota</Label>
                  <p className="text-xs text-muted-foreground">
                    Limitar espaço de armazenamento
                  </p>
                </div>
                <Switch
                  checked={formData.enableQuota}
                  onCheckedChange={(checked) => updateFormData("enableQuota", checked)}
                />
              </div>

              {formData.enableQuota && (
                <div className="space-y-2">
                  <Label>Limite de Quota</Label>
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      placeholder="5"
                      value={formData.quotaLimit}
                      onChange={(e) => updateFormData("quotaLimit", e.target.value)}
                      className="flex-1"
                    />
                    <Select value={formData.quotaUnit} onValueChange={(value) => updateFormData("quotaUnit", value)}>
                      <SelectTrigger className="w-20">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="MB">MB</SelectItem>
                        <SelectItem value="GB">GB</SelectItem>
                        <SelectItem value="TB">TB</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Botões de Ação */}
        <div className="flex items-center justify-end gap-4">
          <Button variant="outline" asChild>
            <Link to="/users">Cancelar</Link>
          </Button>
          <Button type="submit" className="bg-gradient-to-r from-primary to-primary-glow">
            Criar Usuário
          </Button>
        </div>
      </form>
    </div>
  );
}