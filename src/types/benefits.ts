// Alinhado com os enums do banco de dados Supabase
export type BenefitType = 
  | 'alteracao_ferias'
  | 'aviso_folga_falta'
  | 'atestado'
  | 'contracheque'
  | 'abono_horas'
  | 'alteracao_horario'
  | 'operacao_domingo'
  | 'relatorio_ponto'
  | 'outros';

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

export const benefitTypeLabels: Record<BenefitType, string> = {
  alteracao_ferias: 'Alteração de Férias',
  aviso_folga_falta: 'Aviso Folga/Falta',
  atestado: 'Atestado Médico',
  contracheque: 'Contracheque',
  abono_horas: 'Abono de Horas',
  alteracao_horario: 'Alteração de Horário',
  operacao_domingo: 'Operação Domingo',
  relatorio_ponto: 'Relatório de Ponto',
  outros: 'Outros',
};

export const benefitTypeEmojis: Record<BenefitType, string> = {
  alteracao_ferias: '🏖️',
  aviso_folga_falta: '📋',
  atestado: '🏥',
  contracheque: '💰',
  abono_horas: '⏰',
  alteracao_horario: '🔄',
  operacao_domingo: '📅',
  relatorio_ponto: '📊',
  outros: '📦',
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

export const benefitTypeFilterLabels: Record<Exclude<BenefitType, 'outros'>, string> = {
  alteracao_ferias: 'Alteração de Férias',
  aviso_folga_falta: 'Aviso Folga/Falta',
  atestado: 'Atestado Médico',
  contracheque: 'Contracheque',
  abono_horas: 'Abono de Horas',
  alteracao_horario: 'Alteração de Horário',
  operacao_domingo: 'Operação Domingo',
  relatorio_ponto: 'Relatório de Ponto',
};

export const roleLabels: Record<UserRole, string> = {
  colaborador: 'Colaborador',
  gestor: 'Gestor',
  admin: 'Administrador',
};
