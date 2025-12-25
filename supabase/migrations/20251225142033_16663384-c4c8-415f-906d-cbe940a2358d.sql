-- Adicionar novos tipos de benefícios ao enum
ALTER TYPE benefit_type ADD VALUE IF NOT EXISTS 'plano_odontologico';
ALTER TYPE benefit_type ADD VALUE IF NOT EXISTS 'plano_saude';
ALTER TYPE benefit_type ADD VALUE IF NOT EXISTS 'vale_transporte';