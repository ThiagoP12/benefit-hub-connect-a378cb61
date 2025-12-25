// This file contains helper functions for dashboard statistics
// Data is now primarily fetched from Supabase

import { BenefitType, BenefitStatus } from '@/types/benefits';

// Helper types for dashboard
export interface DashboardStats {
  total: number;
  abertos: number;
  emAnalise: number;
  aprovados: number;
  reprovados: number;
}

export interface MonthlyData {
  month: string;
  solicitacoes: number;
  aprovadas: number;
}

export interface BenefitTypeData {
  type: BenefitType;
  count: number;
}

export interface PaymentReceipt {
  id: string;
  userId: string;
  month: string;
  year: number;
  grossSalary: number;
  netSalary: number;
  deductions: number;
  benefits: number;
  pdfUrl: string;
  createdAt: Date;
}

// Generate monthly chart data
export const getMonthlyData = (): MonthlyData[] => {
  const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
  return months.map((month) => ({
    month,
    solicitacoes: Math.floor(Math.random() * 20) + 5,
    aprovadas: Math.floor(Math.random() * 15) + 3,
  }));
};

// Benefit types list (aligned with database enums)
export const benefitTypes: BenefitType[] = [
  'alteracao_ferias',
  'aviso_folga_falta',
  'atestado',
  'contracheque',
  'abono_horas',
  'alteracao_horario',
  'operacao_domingo',
  'relatorio_ponto',
  'outros',
];

// Status list (sem concluida na UI)
export const statuses: BenefitStatus[] = ['aberta', 'em_analise', 'aprovada', 'recusada'];
