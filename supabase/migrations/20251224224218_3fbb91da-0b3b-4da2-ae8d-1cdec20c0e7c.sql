-- Create system_config table for storing system-wide settings
CREATE TABLE public.system_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  value JSONB NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.system_config ENABLE ROW LEVEL SECURITY;

-- Only admins can manage system config
CREATE POLICY "Admin can do all on system_config"
ON public.system_config FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- All authenticated users can read system config
CREATE POLICY "Authenticated users can view system_config"
ON public.system_config FOR SELECT
USING (auth.uid() IS NOT NULL);

-- Create trigger for updated_at
CREATE TRIGGER update_system_config_updated_at
BEFORE UPDATE ON public.system_config
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default approval cutoff day configuration
INSERT INTO public.system_config (key, value, description)
VALUES (
  'approval_cutoff_day',
  '{"day": 25}',
  'Dia do mês a partir do qual o SLA é pausado e aprovações requerem confirmação extra'
);