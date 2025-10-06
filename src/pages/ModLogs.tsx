import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShieldAlert } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface ModLog {
  id: string;
  user_id: string;
  moderator_id: string;
  action_type: string;
  reason: string;
  severity: string;
  duration_minutes: number | null;
  created_at: string;
}

export default function ModLogs() {
  const [logs, setLogs] = useState<ModLog[]>([]);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    const { data } = await supabase
      .from("moderation_logs")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50);

    if (data) setLogs(data);
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "low":
        return "bg-blue-500/20 text-blue-500";
      case "moderate":
        return "bg-yellow-500/20 text-yellow-500";
      case "high":
        return "bg-orange-500/20 text-orange-500";
      case "severe":
        return "bg-destructive/20 text-destructive";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case "warning":
        return "bg-yellow-500/20 text-yellow-500";
      case "timeout":
        return "bg-orange-500/20 text-orange-500";
      case "kick":
        return "bg-destructive/20 text-destructive";
      case "ban":
        return "bg-destructive text-destructive-foreground";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-bold text-foreground mb-2">Moderation Logs</h1>
        <p className="text-muted-foreground">View all moderation actions and events</p>
      </div>

      <div className="grid gap-4">
        {logs.length === 0 ? (
          <Card className="border-border bg-card">
            <CardContent className="text-center py-12 text-muted-foreground">
              No moderation logs yet
            </CardContent>
          </Card>
        ) : (
          logs.map((log) => (
            <Card key={log.id} className="border-border bg-card hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-start justify-between">
                <div className="flex items-start gap-3">
                  <ShieldAlert className="w-5 h-5 text-primary mt-1" />
                  <div>
                    <CardTitle className="text-lg">
                      User {log.user_id.slice(0, 8)}...
                    </CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      Moderator: {log.moderator_id.slice(0, 8)}...
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Badge className={getActionColor(log.action_type)}>
                    {log.action_type}
                  </Badge>
                  <Badge className={getSeverityColor(log.severity)}>
                    {log.severity}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-foreground">{log.reason}</p>
                {log.duration_minutes && (
                  <p className="text-sm text-muted-foreground">
                    Duration: {log.duration_minutes} minutes
                  </p>
                )}
                <p className="text-sm text-muted-foreground">
                  {formatDistanceToNow(new Date(log.created_at), { addSuffix: true })}
                </p>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
