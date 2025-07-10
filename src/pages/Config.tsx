import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { apiService } from "@/services/api";

export default function Config() {
  const [config, setConfig] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    fetch("/api/config")
      .then((res) => res.json())
      .then(setConfig)
      .catch((err) => setError("Erro ao carregar configurações."))
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (field: string, value: any) => {
    setConfig((prev: any) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await fetch("/api/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      });
      if (!res.ok) throw new Error("Erro ao salvar configurações.");
      setSuccess("Configurações salvas com sucesso!");
    } catch (err) {
      setError("Erro ao salvar configurações.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-6">Carregando configurações...</div>;
  if (error) return <div className="p-6 text-red-500">{error}</div>;
  if (!config) return null;

  return (
    <div className="p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Configurações Gerais</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4 max-w-xl">
            <div>
              <label className="block text-sm font-medium">Porta do FTP</label>
              <Input type="number" value={config.ftp_port} onChange={e => handleChange("ftp_port", Number(e.target.value))} />
            </div>
            <div>
              <label className="block text-sm font-medium">Faixa de Portas Passivas</label>
              <Input value={config.passive_ports} onChange={e => handleChange("passive_ports", e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium">Máx. Clientes</label>
              <Input type="number" value={config.max_clients} onChange={e => handleChange("max_clients", Number(e.target.value))} />
            </div>
            <div>
              <label className="block text-sm font-medium">Máx. por IP</label>
              <Input type="number" value={config.max_per_ip} onChange={e => handleChange("max_per_ip", Number(e.target.value))} />
            </div>
            <div>
              <label className="block text-sm font-medium">Quota Padrão (MB)</label>
              <Input type="number" value={config.default_quota_mb} onChange={e => handleChange("default_quota_mb", Number(e.target.value))} />
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={config.ssl_enabled} onCheckedChange={v => handleChange("ssl_enabled", v)} />
              <span>SSL/TLS Ativado</span>
            </div>
            <div>
              <label className="block text-sm font-medium">Tema do Dashboard</label>
              <Input value={config.dashboard_theme} onChange={e => handleChange("dashboard_theme", e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium">Idioma</label>
              <Input value={config.language} onChange={e => handleChange("language", e.target.value)} />
            </div>
            <div className="flex gap-4 mt-4">
              <Button type="submit" disabled={saving}>{saving ? "Salvando..." : "Salvar Configurações"}</Button>
              {success && <span className="text-green-600 text-sm">{success}</span>}
              {error && <span className="text-red-500 text-sm">{error}</span>}
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
} 