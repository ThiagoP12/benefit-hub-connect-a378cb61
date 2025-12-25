import { cn } from '@/lib/utils';

export type BenefitType = 'autoescola' | 'farmacia' | 'oficina' | 'vale_gas' | 'papelaria' | 'otica' | 'outros';

interface BenefitIconProps {
  type: BenefitType;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const sizeClasses = {
  sm: 'w-5 h-5',
  md: 'w-6 h-6',
  lg: 'w-8 h-8',
  xl: 'w-10 h-10',
};

export function BenefitIcon({ type, size = 'md', className }: BenefitIconProps) {
  const sizeClass = cn(sizeClasses[size], 'transition-transform duration-200 hover:scale-110 cursor-pointer');

  const icons: Record<BenefitType, JSX.Element> = {
    autoescola: (
      <svg viewBox="0 0 24 24" fill="none" className={cn(sizeClass, className)}>
        <circle cx="12" cy="12" r="11" fill="#3B82F6" fillOpacity="0.15" />
        <rect x="5" y="10" width="14" height="6" rx="2" fill="#3B82F6" />
        <path d="M7 10V9C7 7.89543 7.89543 7 9 7H15C16.1046 7 17 7.89543 17 9V10" stroke="#3B82F6" strokeWidth="1.5" />
        <circle cx="7.5" cy="13" r="1.5" fill="white" />
        <circle cx="16.5" cy="13" r="1.5" fill="white" />
        <rect x="10" y="11" width="4" height="2" rx="0.5" fill="white" fillOpacity="0.6" />
      </svg>
    ),
    farmacia: (
      <svg viewBox="0 0 24 24" fill="none" className={cn(sizeClass, className)}>
        <circle cx="12" cy="12" r="11" fill="#10B981" fillOpacity="0.15" />
        <rect x="10.5" y="6" width="3" height="12" rx="1" fill="#10B981" />
        <rect x="6" y="10.5" width="12" height="3" rx="1" fill="#10B981" />
      </svg>
    ),
    oficina: (
      <svg viewBox="0 0 24 24" fill="none" className={cn(sizeClass, className)}>
        <circle cx="12" cy="12" r="11" fill="#F59E0B" fillOpacity="0.15" />
        <circle cx="12" cy="12" r="5" stroke="#F59E0B" strokeWidth="2" fill="none" />
        <circle cx="12" cy="12" r="2" fill="#F59E0B" />
        <path d="M12 5V7M12 17V19M5 12H7M17 12H19M7.05 7.05L8.46 8.46M15.54 15.54L16.95 16.95M7.05 16.95L8.46 15.54M15.54 8.46L16.95 7.05" stroke="#F59E0B" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
    vale_gas: (
      <svg viewBox="0 0 24 24" fill="none" className={cn(sizeClass, className)}>
        <circle cx="12" cy="12" r="11" fill="#EF4444" fillOpacity="0.15" />
        <path d="M8 10C8 8.34315 9.79086 7 12 7C14.2091 7 16 8.34315 16 10V16C16 17.1046 15.1046 18 14 18H10C8.89543 18 8 17.1046 8 16V10Z" fill="#EF4444" />
        <rect x="10" y="5" width="4" height="3" rx="1" fill="#B91C1C" />
        <ellipse cx="12" cy="10" rx="3" ry="1.5" fill="#FCA5A5" fillOpacity="0.4" />
        <rect x="10" y="13" width="4" height="1" rx="0.5" fill="white" fillOpacity="0.5" />
        <rect x="10" y="15" width="4" height="1" rx="0.5" fill="white" fillOpacity="0.5" />
      </svg>
    ),
    papelaria: (
      <svg viewBox="0 0 24 24" fill="none" className={cn(sizeClass, className)}>
        <circle cx="12" cy="12" r="11" fill="#8B5CF6" fillOpacity="0.15" />
        <rect x="7" y="6" width="10" height="12" rx="1" fill="#8B5CF6" />
        <rect x="9" y="8" width="6" height="1" rx="0.5" fill="white" fillOpacity="0.7" />
        <rect x="9" y="10.5" width="6" height="1" rx="0.5" fill="white" fillOpacity="0.7" />
        <rect x="9" y="13" width="4" height="1" rx="0.5" fill="white" fillOpacity="0.7" />
      </svg>
    ),
    otica: (
      <svg viewBox="0 0 24 24" fill="none" className={cn(sizeClass, className)}>
        <circle cx="12" cy="12" r="11" fill="#06B6D4" fillOpacity="0.15" />
        <circle cx="8" cy="12" r="3" stroke="#06B6D4" strokeWidth="2" fill="#06B6D4" fillOpacity="0.3" />
        <circle cx="16" cy="12" r="3" stroke="#06B6D4" strokeWidth="2" fill="#06B6D4" fillOpacity="0.3" />
        <path d="M11 12H13" stroke="#06B6D4" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M4 11.5L5 12L4 12.5" stroke="#06B6D4" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M20 11.5L19 12L20 12.5" stroke="#06B6D4" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    outros: (
      <svg viewBox="0 0 24 24" fill="none" className={cn(sizeClass, className)}>
        <circle cx="12" cy="12" r="11" fill="#6B7280" fillOpacity="0.15" />
        <rect x="6" y="9" width="12" height="8" rx="1.5" fill="#6B7280" />
        <path d="M9 9V7.5C9 6.67157 9.67157 6 10.5 6H13.5C14.3284 6 15 6.67157 15 7.5V9" stroke="#6B7280" strokeWidth="1.5" />
        <circle cx="12" cy="13" r="2" fill="white" fillOpacity="0.7" />
      </svg>
    ),
  };

  return icons[type] || icons.outros;
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
