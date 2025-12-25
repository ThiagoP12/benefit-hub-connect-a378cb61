import { cn } from '@/lib/utils';
import { 
  CalendarDays, 
  ClipboardList, 
  Stethoscope, 
  Receipt, 
  Clock, 
  RefreshCw, 
  Calendar, 
  FileBarChart, 
  Package 
} from 'lucide-react';

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

const iconConfig: Record<BenefitType, { icon: typeof CalendarDays; bgColor: string; iconColor: string }> = {
  alteracao_ferias: {
    icon: CalendarDays,
    bgColor: 'bg-blue-500/15 dark:bg-blue-400/20',
    iconColor: 'text-blue-600 dark:text-blue-400',
  },
  aviso_folga_falta: {
    icon: ClipboardList,
    bgColor: 'bg-amber-500/15 dark:bg-amber-400/20',
    iconColor: 'text-amber-600 dark:text-amber-400',
  },
  atestado: {
    icon: Stethoscope,
    bgColor: 'bg-emerald-500/15 dark:bg-emerald-400/20',
    iconColor: 'text-emerald-600 dark:text-emerald-400',
  },
  contracheque: {
    icon: Receipt,
    bgColor: 'bg-violet-500/15 dark:bg-violet-400/20',
    iconColor: 'text-violet-600 dark:text-violet-400',
  },
  abono_horas: {
    icon: Clock,
    bgColor: 'bg-cyan-500/15 dark:bg-cyan-400/20',
    iconColor: 'text-cyan-600 dark:text-cyan-400',
  },
  alteracao_horario: {
    icon: RefreshCw,
    bgColor: 'bg-orange-500/15 dark:bg-orange-400/20',
    iconColor: 'text-orange-600 dark:text-orange-400',
  },
  operacao_domingo: {
    icon: Calendar,
    bgColor: 'bg-red-500/15 dark:bg-red-400/20',
    iconColor: 'text-red-600 dark:text-red-400',
  },
  relatorio_ponto: {
    icon: FileBarChart,
    bgColor: 'bg-indigo-500/15 dark:bg-indigo-400/20',
    iconColor: 'text-indigo-600 dark:text-indigo-400',
  },
  outros: {
    icon: Package,
    bgColor: 'bg-gray-500/15 dark:bg-gray-400/20',
    iconColor: 'text-gray-600 dark:text-gray-400',
  },
};

export function BenefitIcon({ type, size = 'md', className }: BenefitIconProps) {
  const config = iconConfig[type] || iconConfig.outros;
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
  alteracao_ferias: '#3B82F6',
  aviso_folga_falta: '#F59E0B',
  atestado: '#10B981',
  contracheque: '#8B5CF6',
  abono_horas: '#06B6D4',
  alteracao_horario: '#F97316',
  operacao_domingo: '#EF4444',
  relatorio_ponto: '#6366F1',
  outros: '#6B7280',
};
