import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { ShieldAlert, Plus, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface BlacklistWord {
  id: string;
  word: string;
  added_by: string;
  created_at: string;
}

export default function Blacklist() {
  const { toast } = useToast();
  const [words, setWords] = useState<BlacklistWord[]>([]);
  const [newWord, setNewWord] = useState("");
  const [guildId] = useState("default-guild");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchBlacklist();
  }, []);

  const fetchBlacklist = async () => {
    const { data, error } = await supabase
      .from("blacklist_words")
      .select("*")
      .eq("guild_id", guildId)
      .order("created_at", { ascending: false });

    if (data) setWords(data);
  };

  const addWord = async () => {
    if (!newWord.trim()) return;

    setLoading(true);
    try {
      const { error } = await supabase.from("blacklist_words").insert({
        guild_id: guildId,
        word: newWord.toLowerCase().trim(),
        added_by: "Dashboard Admin",
      });

      if (error) throw error;

      toast({
        title: "✅ Word Added",
        description: `"${newWord}" has been added to the blacklist`,
      });

      setNewWord("");
      fetchBlacklist();
    } catch (error: any) {
      toast({
        title: "❌ Error",
        description: error.message || "Failed to add word",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const removeWord = async (id: string, word: string) => {
    try {
      const { error } = await supabase.from("blacklist_words").delete().eq("id", id);

      if (error) throw error;

      toast({
        title: "✅ Word Removed",
        description: `"${word}" has been removed from the blacklist`,
      });

      fetchBlacklist();
    } catch (error) {
      toast({
        title: "❌ Error",
        description: "Failed to remove word",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-bold text-foreground mb-2">Blacklist Management</h1>
        <p className="text-muted-foreground">Manage words that trigger automatic moderation</p>
      </div>

      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="w-5 h-5 text-primary" />
            Add New Word
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1 space-y-2">
              <Label htmlFor="word">Word or Phrase</Label>
              <Input
                id="word"
                value={newWord}
                onChange={(e) => setNewWord(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addWord()}
                placeholder="Enter word to blacklist"
                className="bg-muted border-border"
              />
            </div>
            <div className="flex items-end">
              <Button
                onClick={addWord}
                disabled={loading || !newWord.trim()}
                className="bg-primary hover:bg-primary/90"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Word
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-destructive" />
            Blacklisted Words ({words.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {words.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              No blacklisted words yet. Add some above to get started.
            </div>
          ) : (
            <div className="space-y-2">
              {words.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-4 bg-muted/50 rounded-lg hover:bg-muted transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <Badge variant="destructive" className="font-mono">
                      {item.word}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      Added by {item.added_by}
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeWord(item.id, item.word)}
                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
