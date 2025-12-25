import { BenefitType } from "@/types/benefits";

const BENEFIT_TYPES: BenefitType[] = [
  "autoescola",
  "farmacia",
  "oficina",
  "vale_gas",
  "papelaria",
  "otica",
  "outros",
];

export function isBenefitType(value: string): value is BenefitType {
  return (BENEFIT_TYPES as string[]).includes(value);
}

/**
 * Normaliza o benefit_type vindo do banco.
 * Qualquer tipo fora do conjunto de convênios vira "outros".
 */
export function normalizeBenefitType(value: string | null | undefined): BenefitType {
  if (!value) return "outros";
  return isBenefitType(value) ? value : "outros";
}
