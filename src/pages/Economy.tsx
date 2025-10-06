import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Coins } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface Transaction {
  id: string;
  user_id: string;
  amount: number;
  transaction_type: string;
  description: string | null;
  balance_after: number;
  created_at: string;
}

export default function Economy() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    const { data } = await supabase
      .from("economy_transactions")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50);

    if (data) setTransactions(data);
  };

  const getTransactionColor = (type: string) => {
    switch (type) {
      case "earn":
        return "text-green-500";
      case "spend":
        return "text-destructive";
      case "transfer":
        return "text-blue-500";
      case "daily":
        return "text-accent";
      default:
        return "text-muted-foreground";
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-bold text-foreground mb-2">Economy System</h1>
        <p className="text-muted-foreground">Monitor transactions and user balances</p>
      </div>

      <div className="grid gap-4">
        {transactions.length === 0 ? (
          <Card className="border-border bg-card">
            <CardContent className="text-center py-12 text-muted-foreground">
              No transactions yet
            </CardContent>
          </Card>
        ) : (
          transactions.map((tx) => (
            <Card key={tx.id} className="border-border bg-card hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Coins className="w-5 h-5 text-accent" />
                    <div>
                      <CardTitle className="text-lg">
                        User {tx.user_id.slice(0, 8)}...
                      </CardTitle>
                      <p className="text-sm text-muted-foreground">
                        {tx.description || tx.transaction_type}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-2xl font-bold ${getTransactionColor(tx.transaction_type)}`}>
                      {tx.amount > 0 ? "+" : ""}
                      {tx.amount}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Balance: {tx.balance_after}
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {formatDistanceToNow(new Date(tx.created_at), { addSuffix: true })}
                </p>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
