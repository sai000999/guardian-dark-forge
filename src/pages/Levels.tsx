import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface UserLevel {
  id: string;
  user_id: string;
  level: number;
  xp: number;
  total_messages: number;
}

export default function Levels() {
  const [users, setUsers] = useState<UserLevel[]>([]);

  useEffect(() => {
    fetchLevels();
  }, []);

  const fetchLevels = async () => {
    const { data } = await supabase
      .from("user_levels")
      .select("*")
      .order("level", { ascending: false })
      .order("xp", { ascending: false })
      .limit(20);

    if (data) setUsers(data);
  };

  const getXPForNextLevel = (level: number) => level * 100;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-bold text-foreground mb-2">User Levels</h1>
        <p className="text-muted-foreground">Track user activity and progression</p>
      </div>

      <div className="grid gap-4">
        {users.length === 0 ? (
          <Card className="border-border bg-card">
            <CardContent className="text-center py-12 text-muted-foreground">
              No user data yet
            </CardContent>
          </Card>
        ) : (
          users.map((user, index) => {
            const xpNeeded = getXPForNextLevel(user.level);
            const progress = (user.xp / xpNeeded) * 100;

            return (
              <Card key={user.id} className="border-border bg-card hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent font-bold">
                        #{index + 1}
                      </div>
                      <div>
                        <CardTitle className="text-lg">
                          User {user.user_id.slice(0, 8)}...
                        </CardTitle>
                        <p className="text-sm text-muted-foreground">
                          {user.total_messages} messages
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-primary">
                        Level {user.level}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {user.xp} / {xpNeeded} XP
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Progress value={progress} className="h-2" />
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
