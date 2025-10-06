import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, ShieldAlert, Ticket, Users, TrendingUp, Coins } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Dashboard() {
  const { toast } = useToast();
  const [stats, setStats] = useState({
    totalModActions: 0,
    activeTickets: 0,
    blacklistedWords: 0,
    totalUsers: 0,
    activeQuarantines: 0,
    recentTransactions: 0,
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [modLogs, tickets, blacklist, users, quarantine, transactions] = await Promise.all([
        supabase.from("moderation_logs").select("id", { count: "exact" }),
        supabase.from("tickets").select("id", { count: "exact" }).eq("status", "open"),
        supabase.from("blacklist_words").select("id", { count: "exact" }),
        supabase.from("user_levels").select("id", { count: "exact" }),
        supabase.from("quarantine_logs").select("id", { count: "exact" }).eq("status", "active"),
        supabase.from("economy_transactions").select("id", { count: "exact" }),
      ]);

      setStats({
        totalModActions: modLogs.count || 0,
        activeTickets: tickets.count || 0,
        blacklistedWords: blacklist.count || 0,
        totalUsers: users.count || 0,
        activeQuarantines: quarantine.count || 0,
        recentTransactions: transactions.count || 0,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch dashboard stats",
        variant: "destructive",
      });
    }
  };

  const statCards = [
    {
      title: "Moderation Actions",
      value: stats.totalModActions,
      icon: ShieldAlert,
      color: "text-primary",
    },
    {
      title: "Active Tickets",
      value: stats.activeTickets,
      icon: Ticket,
      color: "text-accent",
    },
    {
      title: "Blacklisted Words",
      value: stats.blacklistedWords,
      icon: Activity,
      color: "text-destructive",
    },
    {
      title: "Total Users",
      value: stats.totalUsers,
      icon: Users,
      color: "text-primary",
    },
    {
      title: "Active Quarantines",
      value: stats.activeQuarantines,
      icon: ShieldAlert,
      color: "text-destructive",
    },
    {
      title: "Transactions",
      value: stats.recentTransactions,
      icon: Coins,
      color: "text-accent",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-bold text-foreground mb-2">Dashboard</h1>
        <p className="text-muted-foreground">Monitor your Discord bot's activity and statistics</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((stat) => (
          <Card key={stat.title} className="border-border bg-card hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <stat.icon className={`w-5 h-5 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            Quick Stats
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between items-center p-4 bg-muted/50 rounded-lg">
            <span className="text-muted-foreground">Bot Status</span>
            <span className="text-primary font-semibold">● Online</span>
          </div>
          <div className="flex justify-between items-center p-4 bg-muted/50 rounded-lg">
            <span className="text-muted-foreground">Server Health</span>
            <span className="text-green-500 font-semibold">Excellent</span>
          </div>
          <div className="flex justify-between items-center p-4 bg-muted/50 rounded-lg">
            <span className="text-muted-foreground">AI Moderation</span>
            <span className="text-primary font-semibold">Active</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
