import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { apiService } from "@/services/api";

export default function Logs() {
  const [log, setLog] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    apiService.getVsftpdLog()
      .then(setLog)
      .catch((err) => setError(err.message || "Erro ao buscar logs"))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Logs do vsftpd</CardTitle>
        </CardHeader>
        <CardContent>
          {loading && <div>Carregando logs...</div>}
          {error && <div className="text-red-500">{error}</div>}
          {!loading && !error && (
            <pre className="whitespace-pre-wrap text-xs bg-black text-green-300 p-4 rounded-md max-h-[600px] overflow-auto">
              {log || "Nenhum log encontrado."}
            </pre>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 