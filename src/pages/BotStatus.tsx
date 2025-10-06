import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Activity, Save } from "lucide-react";

export default function BotStatus() {
  const { toast } = useToast();
  const [guildId, setGuildId] = useState("default-guild");
  const [statusType, setStatusType] = useState("Playing");
  const [statusText, setStatusText] = useState("/help");
  const [modLogChannel, setModLogChannel] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchBotConfig();
  }, []);

  const fetchBotConfig = async () => {
    try {
      const { data, error } = await supabase
        .from("bot_config")
        .select("*")
        .eq("guild_id", guildId)
        .single();

      if (data) {
        setStatusType(data.status_type);
        setStatusText(data.status_text);
        setModLogChannel(data.mod_log_channel_id || "");
      }
    } catch (error) {
      console.log("No existing config found");
    }
  };

  const saveConfig = async () => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from("bot_config")
        .upsert({
          guild_id: guildId,
          status_type: statusType,
          status_text: statusText,
          mod_log_channel_id: modLogChannel || null,
        });

      if (error) throw error;

      toast({
        title: "✅ Success",
        description: "Bot configuration saved successfully",
      });
    } catch (error) {
      toast({
        title: "❌ Error",
        description: "Failed to save configuration",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-bold text-foreground mb-2">Bot Status</h1>
        <p className="text-muted-foreground">Configure your bot's status and settings</p>
      </div>

      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-primary" />
            Status Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="guild">Guild ID</Label>
            <Input
              id="guild"
              value={guildId}
              onChange={(e) => setGuildId(e.target.value)}
              placeholder="Enter Discord Guild ID"
              className="bg-muted border-border"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="status-type">Status Type</Label>
            <Select value={statusType} onValueChange={setStatusType}>
              <SelectTrigger className="bg-muted border-border">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Playing">Playing</SelectItem>
                <SelectItem value="Watching">Watching</SelectItem>
                <SelectItem value="Listening">Listening to</SelectItem>
                <SelectItem value="Competing">Competing in</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="status-text">Status Text</Label>
            <Input
              id="status-text"
              value={statusText}
              onChange={(e) => setStatusText(e.target.value)}
              placeholder="e.g., /help"
              className="bg-muted border-border"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="mod-channel">Mod Log Channel ID</Label>
            <Input
              id="mod-channel"
              value={modLogChannel}
              onChange={(e) => setModLogChannel(e.target.value)}
              placeholder="Channel ID for moderation logs"
              className="bg-muted border-border"
            />
          </div>

          <Button
            onClick={saveConfig}
            disabled={loading}
            className="w-full bg-primary hover:bg-primary/90"
          >
            <Save className="w-4 h-4 mr-2" />
            {loading ? "Saving..." : "Save Configuration"}
          </Button>
        </CardContent>
      </Card>

      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle>Current Status Preview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="p-6 bg-muted/50 rounded-lg text-center">
            <div className="text-xl font-semibold text-foreground">
              {statusType} {statusText}
            </div>
            <div className="mt-2 flex items-center justify-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
              <span className="text-sm text-muted-foreground">Bot Online</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
