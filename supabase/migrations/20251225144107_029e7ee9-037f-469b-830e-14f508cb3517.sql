-- Adicionar 'relato_anomalia' ao enum benefit_type
ALTER TYPE benefit_type ADD VALUE IF NOT EXISTS 'relato_anomalia';