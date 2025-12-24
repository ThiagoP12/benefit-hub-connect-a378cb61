-- Create table for request messages/communication history
CREATE TABLE public.request_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  benefit_request_id UUID NOT NULL REFERENCES benefit_requests(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL,
  sender_name TEXT,
  message TEXT NOT NULL,
  sent_via TEXT DEFAULT 'sistema',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.request_messages ENABLE ROW LEVEL SECURITY;

-- Admin can do all
CREATE POLICY "Admin can do all on request_messages" 
ON public.request_messages FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Gestor and Agente DP can view messages
CREATE POLICY "Gestor can view request_messages" 
ON public.request_messages FOR SELECT
USING (has_role(auth.uid(), 'gestor'::app_role));

CREATE POLICY "Agente DP can view request_messages" 
ON public.request_messages FOR SELECT
USING (has_role(auth.uid(), 'agente_dp'::app_role));

-- Gestor and Agente DP can insert messages
CREATE POLICY "Gestor can insert request_messages" 
ON public.request_messages FOR INSERT
WITH CHECK (has_role(auth.uid(), 'gestor'::app_role));

CREATE POLICY "Agente DP can insert request_messages" 
ON public.request_messages FOR INSERT
WITH CHECK (has_role(auth.uid(), 'agente_dp'::app_role));

-- User can view messages on their own requests
CREATE POLICY "User can view own request messages" 
ON public.request_messages FOR SELECT
USING (EXISTS (
  SELECT 1 FROM benefit_requests br
  WHERE br.id = request_messages.benefit_request_id
  AND br.user_id = auth.uid()
));

-- Create index for performance
CREATE INDEX idx_request_messages_benefit_request_id ON public.request_messages(benefit_request_id);
CREATE INDEX idx_request_messages_created_at ON public.request_messages(created_at DESC);