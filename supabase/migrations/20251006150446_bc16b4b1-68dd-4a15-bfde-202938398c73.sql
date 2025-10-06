-- Ticket configuration table
CREATE TABLE IF NOT EXISTS public.ticket_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  guild_id TEXT NOT NULL UNIQUE,
  ticket_channel_id TEXT NOT NULL,
  staff_role_id TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.ticket_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all operations on ticket_config"
ON public.ticket_config
FOR ALL
USING (true)
WITH CHECK (true);

-- Shop configuration table
CREATE TABLE IF NOT EXISTS public.shop_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  guild_id TEXT NOT NULL UNIQUE,
  vip_role_id TEXT,
  vcaccess_role_id TEXT,
  hexrole_role_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.shop_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all operations on shop_config"
ON public.shop_config
FOR ALL
USING (true)
WITH CHECK (true);

-- Voice tracking table
CREATE TABLE IF NOT EXISTS public.voice_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  guild_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  channel_id TEXT NOT NULL,
  join_time TIMESTAMP WITH TIME ZONE DEFAULT now(),
  leave_time TIMESTAMP WITH TIME ZONE,
  duration_minutes INTEGER DEFAULT 0
);

ALTER TABLE public.voice_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all operations on voice_sessions"
ON public.voice_sessions
FOR ALL
USING (true)
WITH CHECK (true);

-- Message tracking for spam detection
CREATE TABLE IF NOT EXISTS public.message_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  guild_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  message_id TEXT NOT NULL,
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.message_tracking ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all operations on message_tracking"
ON public.message_tracking
FOR ALL
USING (true)
WITH CHECK (true);

-- Update tickets table to support threads
ALTER TABLE public.tickets ADD COLUMN IF NOT EXISTS thread_id TEXT;
ALTER TABLE public.tickets ADD COLUMN IF NOT EXISTS claimed_by TEXT;
ALTER TABLE public.tickets ADD COLUMN IF NOT EXISTS claimed_at TIMESTAMP WITH TIME ZONE;