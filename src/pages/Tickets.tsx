import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Ticket } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface TicketData {
  id: string;
  user_id: string;
  channel_id: string;
  status: string;
  subject: string | null;
  created_at: string;
  closed_at: string | null;
  closed_by: string | null;
}

export default function Tickets() {
  const [tickets, setTickets] = useState<TicketData[]>([]);
  const [filter, setFilter] = useState<"all" | "open" | "closed">("all");

  useEffect(() => {
    fetchTickets();
  }, [filter]);

  const fetchTickets = async () => {
    let query = supabase.from("tickets").select("*").order("created_at", { ascending: false });

    if (filter !== "all") {
      query = query.eq("status", filter);
    }

    const { data } = await query;
    if (data) setTickets(data);
  };

  const filteredTickets = tickets;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-bold text-foreground mb-2">Support Tickets</h1>
        <p className="text-muted-foreground">View and manage user support tickets</p>
      </div>

      <div className="flex gap-2">
        {(["all", "open", "closed"] as const).map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === status
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </button>
        ))}
      </div>

      <div className="grid gap-4">
        {filteredTickets.length === 0 ? (
          <Card className="border-border bg-card">
            <CardContent className="text-center py-12 text-muted-foreground">
              No tickets found
            </CardContent>
          </Card>
        ) : (
          filteredTickets.map((ticket) => (
            <Card key={ticket.id} className="border-border bg-card hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-start justify-between">
                <div className="flex items-start gap-3">
                  <Ticket className="w-5 h-5 text-primary mt-1" />
                  <div>
                    <CardTitle className="text-lg">
                      {ticket.subject || "Support Ticket"}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      User: {ticket.user_id.slice(0, 8)}... • Channel: {ticket.channel_id.slice(0, 8)}...
                    </p>
                  </div>
                </div>
                <Badge variant={ticket.status === "open" ? "default" : "secondary"}>
                  {ticket.status}
                </Badge>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>
                    Created {formatDistanceToNow(new Date(ticket.created_at), { addSuffix: true })}
                  </span>
                  {ticket.closed_at && (
                    <span>
                      Closed {formatDistanceToNow(new Date(ticket.closed_at), { addSuffix: true })}
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
