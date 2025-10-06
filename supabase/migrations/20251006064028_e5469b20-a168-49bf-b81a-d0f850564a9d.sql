-- Create AFK status table
CREATE TABLE public.afk_status (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  guild_id TEXT NOT NULL,
  reason TEXT,
  set_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, guild_id)
);

-- Enable RLS
ALTER TABLE public.afk_status ENABLE ROW LEVEL SECURITY;

-- Create policy for all operations
CREATE POLICY "Allow all operations on afk_status" 
ON public.afk_status 
FOR ALL 
USING (true) 
WITH CHECK (true);