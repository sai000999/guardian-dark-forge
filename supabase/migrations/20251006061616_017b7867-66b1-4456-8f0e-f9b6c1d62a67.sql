-- Bot configuration table
CREATE TABLE public.bot_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  guild_id TEXT NOT NULL UNIQUE,
  status_type TEXT NOT NULL DEFAULT 'Playing',
  status_text TEXT NOT NULL DEFAULT '/help',
  mod_log_channel_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Blacklist words table
CREATE TABLE public.blacklist_words (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  guild_id TEXT NOT NULL,
  word TEXT NOT NULL,
  added_by TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(guild_id, word)
);

-- Moderation logs table
CREATE TABLE public.moderation_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  guild_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  moderator_id TEXT NOT NULL,
  action_type TEXT NOT NULL, -- warning, timeout, kick, ban
  reason TEXT NOT NULL,
  severity TEXT NOT NULL, -- low, moderate, high, severe
  duration_minutes INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tickets table
CREATE TABLE public.tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  guild_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  channel_id TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'open', -- open, closed
  subject TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  closed_at TIMESTAMP WITH TIME ZONE,
  closed_by TEXT
);

-- User levels table
CREATE TABLE public.user_levels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  guild_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  level INTEGER NOT NULL DEFAULT 1,
  xp INTEGER NOT NULL DEFAULT 0,
  total_messages INTEGER NOT NULL DEFAULT 0,
  last_xp_gain TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(guild_id, user_id)
);

-- Economy transactions table
CREATE TABLE public.economy_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  guild_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  amount INTEGER NOT NULL,
  transaction_type TEXT NOT NULL, -- earn, spend, transfer, daily
  description TEXT,
  balance_after INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- User balances table
CREATE TABLE public.user_balances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  guild_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  balance INTEGER NOT NULL DEFAULT 0,
  last_daily TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(guild_id, user_id)
);

-- Quarantine logs table
CREATE TABLE public.quarantine_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  guild_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  moderator_id TEXT NOT NULL,
  duration_minutes INTEGER,
  reason TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active', -- active, removed
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  removed_at TIMESTAMP WITH TIME ZONE
);

-- Enable Row Level Security
ALTER TABLE public.bot_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blacklist_words ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.moderation_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_levels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.economy_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_balances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quarantine_logs ENABLE ROW LEVEL SECURITY;

-- Create policies (allowing all authenticated users to read/write for dashboard access)
CREATE POLICY "Allow all operations on bot_config" ON public.bot_config FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on blacklist_words" ON public.blacklist_words FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on moderation_logs" ON public.moderation_logs FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on tickets" ON public.tickets FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on user_levels" ON public.user_levels FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on economy_transactions" ON public.economy_transactions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on user_balances" ON public.user_balances FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on quarantine_logs" ON public.quarantine_logs FOR ALL USING (true) WITH CHECK (true);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for bot_config
CREATE TRIGGER update_bot_config_updated_at
  BEFORE UPDATE ON public.bot_config
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_blacklist_guild ON public.blacklist_words(guild_id);
CREATE INDEX idx_mod_logs_guild ON public.moderation_logs(guild_id);
CREATE INDEX idx_mod_logs_user ON public.moderation_logs(user_id);
CREATE INDEX idx_tickets_guild ON public.tickets(guild_id);
CREATE INDEX idx_tickets_status ON public.tickets(status);
CREATE INDEX idx_user_levels_guild ON public.user_levels(guild_id);
CREATE INDEX idx_economy_guild ON public.economy_transactions(guild_id);
CREATE INDEX idx_quarantine_guild ON public.quarantine_logs(guild_id);
CREATE INDEX idx_quarantine_status ON public.quarantine_logs(status);