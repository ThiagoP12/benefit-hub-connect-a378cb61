-- Tabela de permissões de módulos por usuário
CREATE TABLE public.user_module_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  module TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, module)
);

-- Habilitar RLS
ALTER TABLE public.user_module_permissions ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY "Admin can do all on user_module_permissions"
  ON public.user_module_permissions FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "User can view own module permissions"
  ON public.user_module_permissions FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Gestor can view all module permissions"
  ON public.user_module_permissions FOR SELECT
  USING (has_role(auth.uid(), 'gestor'::app_role));

CREATE POLICY "Agente DP can view all module permissions"
  ON public.user_module_permissions FOR SELECT
  USING (has_role(auth.uid(), 'agente_dp'::app_role));