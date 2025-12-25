// Tipos de convênio usados na UI
export type ConvenioBenefitType = 'autoescola' | 'farmacia' | 'oficina' | 'vale_gas' | 'papelaria' | 'otica' | 'outros';

// Tipos de benefícios DP/RH
export type DpBenefitType = 'alteracao_ferias' | 'aviso_folga_falta' | 'atestado' | 'contracheque' | 'abono_horas' | 'alteracao_horario' | 'operacao_domingo' | 'relatorio_ponto';

// Tipo completo alinhado com o enum do banco de dados Supabase
export type BenefitType = ConvenioBenefitType | DpBenefitType;

export type BenefitStatus = 'aberta' | 'em_analise' | 'aprovada' | 'recusada' | 'concluida';

export type UserRole = 'colaborador' | 'gestor' | 'admin';

export interface Unit {
  id: string;
  name: string;
  code: string;
  created_at: string;
  updated_at: string;
}

export interface User {
  id: string;
  name: string;
  cpf: string;
  phone: string;
  unitId: string;
  unit?: Unit;
  role: UserRole;
  createdAt: Date;
}

export interface BenefitRequest {
  id: string;
  protocol: string;
  user_id: string;
  user?: User;
  benefit_type: BenefitType;
  status: BenefitStatus;
  details: string;
  requested_value?: number;
  approved_value?: number;
  reviewed_by?: string;
  reviewed_at?: string;
  rejection_reason?: string;
  pdf_url?: string;
  pdf_file_name?: string;
  closing_message?: string;
  closed_by?: string;
  closed_at?: string;
  created_at: string;
  updated_at: string;
}

export interface Log {
  id: string;
  entity_type: string;
  entity_id: string;
  action: string;
  user_id: string;
  user?: User;
  details?: any;
  created_at: string;
}

export const benefitTypeLabels: Record<ConvenioBenefitType, string> = {
  autoescola: 'Autoescola',
  farmacia: 'Farmácia',
  oficina: 'Oficina',
  vale_gas: 'Vale Gás',
  papelaria: 'Papelaria',
  otica: 'Ótica',
  outros: 'Outros',
};

export const benefitTypeEmojis: Record<ConvenioBenefitType, string> = {
  autoescola: '🚗',
  farmacia: '💊',
  oficina: '🔧',
  vale_gas: '⛽',
  papelaria: '📚',
  otica: '👓',
  outros: '📦',
};

// Labels para benefícios DP
export const dpBenefitTypeLabels: Record<DpBenefitType, string> = {
  alteracao_ferias: 'Alteração de Férias',
  aviso_folga_falta: 'Aviso Folga/Falta',
  atestado: 'Atestado',
  contracheque: 'Contracheque',
  abono_horas: 'Abono de Horas',
  alteracao_horario: 'Alteração de Horário',
  operacao_domingo: 'Operação Domingo',
  relatorio_ponto: 'Relatório de Ponto',
};

export const dpBenefitTypeEmojis: Record<DpBenefitType, string> = {
  alteracao_ferias: '🏖️',
  aviso_folga_falta: '📋',
  atestado: '🏥',
  contracheque: '💰',
  abono_horas: '⏰',
  alteracao_horario: '🕐',
  operacao_domingo: '📅',
  relatorio_ponto: '📊',
};

export const statusLabels: Record<BenefitStatus, string> = {
  aberta: 'Aberto',
  em_analise: 'Em Análise',
  aprovada: 'Aprovado',
  recusada: 'Recusado',
  concluida: 'Aprovado',
};

export const statusFilterLabels: Record<Exclude<BenefitStatus, 'concluida'>, string> = {
  aberta: 'Aberto',
  em_analise: 'Em Análise',
  aprovada: 'Aprovado',
  recusada: 'Reprovado',
};

export const benefitTypeFilterLabels: Record<Exclude<ConvenioBenefitType, 'outros'>, string> = {
  autoescola: 'Autoescola',
  farmacia: 'Farmácia',
  oficina: 'Oficina',
  vale_gas: 'Vale Gás',
  papelaria: 'Papelaria',
  otica: 'Ótica',
};

export const roleLabels: Record<UserRole, string> = {
  colaborador: 'Colaborador',
  gestor: 'Gestor',
  admin: 'Administrador',
};
