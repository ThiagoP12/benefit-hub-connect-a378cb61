-- Adicionar tipos de convênio ao enum benefit_type
ALTER TYPE public.benefit_type ADD VALUE IF NOT EXISTS 'autoescola';
ALTER TYPE public.benefit_type ADD VALUE IF NOT EXISTS 'farmacia';
ALTER TYPE public.benefit_type ADD VALUE IF NOT EXISTS 'oficina';
ALTER TYPE public.benefit_type ADD VALUE IF NOT EXISTS 'vale_gas';
ALTER TYPE public.benefit_type ADD VALUE IF NOT EXISTS 'papelaria';
ALTER TYPE public.benefit_type ADD VALUE IF NOT EXISTS 'otica';