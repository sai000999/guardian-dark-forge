-- Create monitored_channels table
CREATE TABLE public.monitored_channels (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  guild_id TEXT NOT NULL,
  channel_id TEXT NOT NULL,
  last_active TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  active BOOLEAN NOT NULL DEFAULT true,
  UNIQUE(guild_id, channel_id)
);

-- Enable RLS
ALTER TABLE public.monitored_channels ENABLE ROW LEVEL SECURITY;

-- Create policy for all operations
CREATE POLICY "Allow all operations on monitored_channels"
ON public.monitored_channels
FOR ALL
USING (true)
WITH CHECK (true);

-- Create inactivity_settings table
CREATE TABLE public.inactivity_settings (
  guild_id TEXT NOT NULL PRIMARY KEY,
  timeout_minutes INTEGER NOT NULL DEFAULT 15
);

-- Enable RLS
ALTER TABLE public.inactivity_settings ENABLE ROW LEVEL SECURITY;

-- Create policy for all operations
CREATE POLICY "Allow all operations on inactivity_settings"
ON public.inactivity_settings
FOR ALL
USING (true)
WITH CHECK (true);