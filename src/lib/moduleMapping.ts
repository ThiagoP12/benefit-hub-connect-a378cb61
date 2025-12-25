// Mapeamento de módulos para benefit_types
export const MODULE_MAPPING: Record<string, string[]> = {
  'convenios': ['autoescola', 'farmacia', 'oficina', 'vale_gas', 'papelaria', 'otica', 'plano_odontologico', 'plano_saude', 'vale_transporte'],
  'alteracao_ferias': ['alteracao_ferias'],
  'alteracao_horario': ['alteracao_horario'],
  'atestado': ['atestado'],
  'aviso_folga_falta': ['aviso_folga_falta'],
  'contracheque': ['contracheque'],
  'relatorio_ponto': ['relatorio_ponto'],
  'relato_anomalia': ['relato_anomalia'],
  'outros': ['outros', 'abono_horas', 'operacao_domingo']
};

// Opções de módulos para o formulário
export const MODULE_OPTIONS = [
  { value: 'convenios', label: 'Convênios', icon: '🏪' },
  { value: 'alteracao_ferias', label: 'Alteração de Férias', icon: '🏖️' },
  { value: 'alteracao_horario', label: 'Alteração de Horário', icon: '⏰' },
  { value: 'atestado', label: 'Atestado', icon: '📋' },
  { value: 'aviso_folga_falta', label: 'Aviso de Folga/Falta', icon: '📅' },
  { value: 'contracheque', label: 'Contracheque', icon: '💰' },
  { value: 'relatorio_ponto', label: 'Relatório de Ponto', icon: '📊' },
  { value: 'relato_anomalia', label: 'Relato de Anomalia', icon: '⚠️' },
  { value: 'outros', label: 'Outros', icon: '📌' },
];

// Função helper para obter todos os benefit_types permitidos a partir dos módulos
export function getBenefitTypesFromModules(modules: string[]): string[] {
  const benefitTypes: string[] = [];
  modules.forEach(module => {
    const types = MODULE_MAPPING[module];
    if (types) {
      benefitTypes.push(...types);
    }
  });
  return [...new Set(benefitTypes)]; // Remove duplicates
}
