-- Create welcomer settings table
CREATE TABLE public.welcomer_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  guild_id TEXT NOT NULL UNIQUE,
  join_role_id TEXT,
  channel_id TEXT,
  message TEXT,
  embed_json JSONB,
  dm_message TEXT,
  dm_embed_json JSONB,
  auto_decancer BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create logging configuration table
CREATE TABLE public.logging_config (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  guild_id TEXT NOT NULL UNIQUE,
  category_id TEXT,
  server_logs_channel_id TEXT,
  msg_logs_channel_id TEXT,
  mod_logs_channel_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.welcomer_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.logging_config ENABLE ROW LEVEL SECURITY;

-- Create policies for welcomer_settings
CREATE POLICY "Allow all operations on welcomer_settings" 
ON public.welcomer_settings 
FOR ALL 
USING (true) 
WITH CHECK (true);

-- Create policies for logging_config
CREATE POLICY "Allow all operations on logging_config" 
ON public.logging_config 
FOR ALL 
USING (true) 
WITH CHECK (true);

-- Create trigger for welcomer_settings updated_at
CREATE TRIGGER update_welcomer_settings_updated_at
BEFORE UPDATE ON public.welcomer_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();