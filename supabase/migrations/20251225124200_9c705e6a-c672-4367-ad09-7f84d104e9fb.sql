-- Renomear valores do enum benefit_type para tipos de RH/DP
ALTER TYPE benefit_type RENAME VALUE 'autoescola' TO 'alteracao_ferias';
ALTER TYPE benefit_type RENAME VALUE 'farmacia' TO 'aviso_folga_falta';
ALTER TYPE benefit_type RENAME VALUE 'oficina' TO 'atestado';
ALTER TYPE benefit_type RENAME VALUE 'vale_gas' TO 'contracheque';
ALTER TYPE benefit_type RENAME VALUE 'papelaria' TO 'abono_horas';
ALTER TYPE benefit_type RENAME VALUE 'otica' TO 'alteracao_horario';

-- Adicionar novos valores
ALTER TYPE benefit_type ADD VALUE IF NOT EXISTS 'operacao_domingo';
ALTER TYPE benefit_type ADD VALUE IF NOT EXISTS 'relatorio_ponto';

-- Remover 'outros' não é possível diretamente em PostgreSQL,
-- mas podemos tratá-lo no código como depreciado

-- Adicionar colunas para anexos nas solicitações
ALTER TABLE benefit_requests 
ADD COLUMN IF NOT EXISTS attachment_url TEXT,
ADD COLUMN IF NOT EXISTS attachment_file_name TEXT;