// Alinhado com os enums do banco de dados Supabase
// Atividades do DP
export type DPActivityType = 
  | 'alteracao_ferias'
  | 'aviso_folga_falta'
  | 'atestado'
  | 'contracheque'
  | 'abono_horas'
  | 'alteracao_horario'
  | 'operacao_domingo'
  | 'relatorio_ponto'
  | 'outros';

// Convênios
export type ConvenioType =
  | 'autoescola'
  | 'farmacia'
  | 'oficina'
  | 'vale_gas'
  | 'papelaria'
  | 'otica';

// Tipo combinado (usado no banco de dados)
export type BenefitType = DPActivityType | ConvenioType;

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

// Labels para atividades do DP
export const dpActivityLabels: Record<DPActivityType, string> = {
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

// Labels para convênios
export const convenioLabels: Record<ConvenioType, string> = {
  autoescola: 'Autoescola',
  farmacia: 'Farmácia',
  oficina: 'Oficina',
  vale_gas: 'Vale Gás',
  papelaria: 'Papelaria',
  otica: 'Ótica',
};

// Labels combinados (todos os tipos)
export const benefitTypeLabels: Record<BenefitType, string> = {
  ...dpActivityLabels,
  ...convenioLabels,
};

// Emojis para atividades do DP
export const dpActivityEmojis: Record<DPActivityType, string> = {
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

// Emojis para convênios
export const convenioEmojis: Record<ConvenioType, string> = {
  autoescola: '🚗',
  farmacia: '💊',
  oficina: '🔧',
  vale_gas: '⛽',
  papelaria: '📚',
  otica: '👓',
};

// Emojis combinados
export const benefitTypeEmojis: Record<BenefitType, string> = {
  ...dpActivityEmojis,
  ...convenioEmojis,
};

// Listas de tipos
export const dpActivityTypes: DPActivityType[] = [
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

export const convenioTypes: ConvenioType[] = [
  'autoescola',
  'farmacia',
  'oficina',
  'vale_gas',
  'papelaria',
  'otica',
];

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

export const roleLabels: Record<UserRole, string> = {
  colaborador: 'Colaborador',
  gestor: 'Gestor',
  admin: 'Administrador',
};

// Helper para identificar se é convênio
export const isConvenio = (type: BenefitType): type is ConvenioType => {
  return convenioTypes.includes(type as ConvenioType);
};

// Helper para identificar se é atividade do DP
export const isDPActivity = (type: BenefitType): type is DPActivityType => {
  return dpActivityTypes.includes(type as DPActivityType);
};
