import { cn } from '@/lib/utils';
import { 
  Palmtree, 
  ClipboardList, 
  Stethoscope, 
  Receipt, 
  Timer, 
  Clock, 
  CalendarCheck, 
  FileSpreadsheet 
} from 'lucide-react';

export type BenefitType = 
  | 'alteracao_ferias' 
  | 'aviso_folga_falta' 
  | 'atestado' 
  | 'contracheque'
  | 'abono_horas'
  | 'alteracao_horario'
  | 'operacao_domingo'
  | 'relatorio_ponto';

interface BenefitIconProps {
  type: BenefitType;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const sizeClasses = {
  sm: 'w-6 h-6',
  md: 'w-8 h-8',
  lg: 'w-10 h-10',
  xl: 'w-12 h-12',
};

const iconSizes = {
  sm: 12,
  md: 16,
  lg: 20,
  xl: 24,
};

const iconConfig: Record<BenefitType, { icon: typeof Palmtree; bgColor: string; iconColor: string }> = {
  alteracao_ferias: {
    icon: Palmtree,
    bgColor: 'bg-emerald-500/15 dark:bg-emerald-400/20',
    iconColor: 'text-emerald-600 dark:text-emerald-400',
  },
  aviso_folga_falta: {
    icon: ClipboardList,
    bgColor: 'bg-amber-500/15 dark:bg-amber-400/20',
    iconColor: 'text-amber-600 dark:text-amber-400',
  },
  atestado: {
    icon: Stethoscope,
    bgColor: 'bg-red-500/15 dark:bg-red-400/20',
    iconColor: 'text-red-600 dark:text-red-400',
  },
  contracheque: {
    icon: Receipt,
    bgColor: 'bg-blue-500/15 dark:bg-blue-400/20',
    iconColor: 'text-blue-600 dark:text-blue-400',
  },
  abono_horas: {
    icon: Timer,
    bgColor: 'bg-violet-500/15 dark:bg-violet-400/20',
    iconColor: 'text-violet-600 dark:text-violet-400',
  },
  alteracao_horario: {
    icon: Clock,
    bgColor: 'bg-cyan-500/15 dark:bg-cyan-400/20',
    iconColor: 'text-cyan-600 dark:text-cyan-400',
  },
  operacao_domingo: {
    icon: CalendarCheck,
    bgColor: 'bg-orange-500/15 dark:bg-orange-400/20',
    iconColor: 'text-orange-600 dark:text-orange-400',
  },
  relatorio_ponto: {
    icon: FileSpreadsheet,
    bgColor: 'bg-pink-500/15 dark:bg-pink-400/20',
    iconColor: 'text-pink-600 dark:text-pink-400',
  },
};

export function BenefitIcon({ type, size = 'md', className }: BenefitIconProps) {
  const config = iconConfig[type] || iconConfig.alteracao_ferias;
  const Icon = config.icon;
  const iconSize = iconSizes[size];

  return (
    <div
      className={cn(
        sizeClasses[size],
        config.bgColor,
        'rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110',
        className
      )}
    >
      <Icon size={iconSize} className={cn(config.iconColor, 'stroke-[2]')} />
    </div>
  );
}

export const benefitIconColors: Record<BenefitType, string> = {
  alteracao_ferias: '#10B981',   // Emerald
  aviso_folga_falta: '#F59E0B', // Amber
  atestado: '#EF4444',           // Red
  contracheque: '#3B82F6',       // Blue
  abono_horas: '#8B5CF6',        // Violet
  alteracao_horario: '#06B6D4',  // Cyan
  operacao_domingo: '#F97316',   // Orange
  relatorio_ponto: '#EC4899',    // Pink
};
