import { cn } from '@/lib/utils';
import { Car, Pill, Wrench, Flame, BookOpen, Glasses, Package } from 'lucide-react';
import { ConvenioBenefitType } from '@/types/benefits';

export type BenefitType = ConvenioBenefitType;

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

const iconConfig: Record<BenefitType, { icon: typeof Car; bgColor: string; iconColor: string }> = {
  autoescola: {
    icon: Car,
    bgColor: 'bg-blue-500/15 dark:bg-blue-400/20',
    iconColor: 'text-blue-600 dark:text-blue-400',
  },
  farmacia: {
    icon: Pill,
    bgColor: 'bg-emerald-500/15 dark:bg-emerald-400/20',
    iconColor: 'text-emerald-600 dark:text-emerald-400',
  },
  oficina: {
    icon: Wrench,
    bgColor: 'bg-amber-500/15 dark:bg-amber-400/20',
    iconColor: 'text-amber-600 dark:text-amber-400',
  },
  vale_gas: {
    icon: Flame,
    bgColor: 'bg-red-500/15 dark:bg-red-400/20',
    iconColor: 'text-red-600 dark:text-red-400',
  },
  papelaria: {
    icon: BookOpen,
    bgColor: 'bg-violet-500/15 dark:bg-violet-400/20',
    iconColor: 'text-violet-600 dark:text-violet-400',
  },
  otica: {
    icon: Glasses,
    bgColor: 'bg-cyan-500/15 dark:bg-cyan-400/20',
    iconColor: 'text-cyan-600 dark:text-cyan-400',
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
  autoescola: '#3B82F6',
  farmacia: '#10B981',
  oficina: '#F59E0B',
  vale_gas: '#EF4444',
  papelaria: '#8B5CF6',
  otica: '#06B6D4',
  outros: '#6B7280',
};
