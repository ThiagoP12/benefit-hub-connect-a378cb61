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
        <path
          d="M6 15.5C6 14.1193 7.11929 13 8.5 13H15.5C16.8807 13 18 14.1193 18 15.5V16C18 16.5523 17.5523 17 17 17H7C6.44772 17 6 16.5523 6 16V15.5Z"
          fill="#3B82F6"
        />
        <path
          d="M7.5 13L8.5 9.5C8.72386 8.65137 9.50485 8 10.5 8H13.5C14.4951 8 15.2761 8.65137 15.5 9.5L16.5 13"
          stroke="#3B82F6"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <circle cx="8.5" cy="15" r="1" fill="white" />
        <circle cx="15.5" cy="15" r="1" fill="white" />
        <path d="M10 11H14" stroke="#3B82F6" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
    farmacia: (
      <svg viewBox="0 0 24 24" fill="none" className={cn(sizeClass, className)}>
        <circle cx="12" cy="12" r="11" fill="#10B981" fillOpacity="0.15" />
        <rect x="10" y="7" width="4" height="10" rx="0.5" fill="#10B981" />
        <rect x="7" y="10" width="10" height="4" rx="0.5" fill="#10B981" />
      </svg>
    ),
    oficina: (
      <svg viewBox="0 0 24 24" fill="none" className={cn(sizeClass, className)}>
        <circle cx="12" cy="12" r="11" fill="#F59E0B" fillOpacity="0.15" />
        {/* Chave inglesa */}
        <path
          d="M14.5 6.5C15.88 6.5 17 7.62 17 9C17 9.79 16.64 10.5 16.08 11L11 16.08C10.5 16.64 9.79 17 9 17C7.62 17 6.5 15.88 6.5 14.5C6.5 13.71 6.86 13 7.42 12.5L12.5 7.42C13 6.86 13.71 6.5 14.5 6.5Z"
          fill="#F59E0B"
        />
        <path
          d="M16.5 7.5L18 6M18 6L17 5M18 6L19 7"
          stroke="#F59E0B"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="14.5" cy="9" r="1.5" fill="white" fillOpacity="0.8" />
        <circle cx="9" cy="14.5" r="1.5" fill="white" fillOpacity="0.8" />
      </svg>
    ),
    vale_gas: (
      <svg viewBox="0 0 24 24" fill="none" className={cn(sizeClass, className)}>
        <circle cx="12" cy="12" r="11" fill="#EF4444" fillOpacity="0.15" />
        {/* Botijão de gás */}
        <rect x="8" y="9" width="8" height="9" rx="2" fill="#EF4444" />
        <rect x="9.5" y="6" width="5" height="3" rx="1" fill="#EF4444" />
        <rect x="11" y="4" width="2" height="2.5" rx="0.5" fill="#B91C1C" />
        <ellipse cx="12" cy="9" rx="3" ry="1" fill="#FCA5A5" fillOpacity="0.5" />
        <path d="M10 13H14" stroke="white" strokeWidth="1" strokeLinecap="round" />
        <path d="M10 15H14" stroke="white" strokeWidth="1" strokeLinecap="round" />
      </svg>
    ),
    papelaria: (
      <svg viewBox="0 0 24 24" fill="none" className={cn(sizeClass, className)}>
        <circle cx="12" cy="12" r="11" fill="#8B5CF6" fillOpacity="0.15" />
        <path
          d="M9 7H15C15.5523 7 16 7.44772 16 8V16C16 16.5523 15.5523 17 15 17H9C8.44772 17 8 16.5523 8 16V8C8 7.44772 8.44772 7 9 7Z"
          fill="#8B5CF6"
        />
        <path d="M10 10H14" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M10 13H14" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
    otica: (
      <svg viewBox="0 0 24 24" fill="none" className={cn(sizeClass, className)}>
        <circle cx="12" cy="12" r="11" fill="#06B6D4" fillOpacity="0.15" />
        <circle cx="8.5" cy="12" r="3" stroke="#06B6D4" strokeWidth="1.5" fill="#06B6D4" fillOpacity="0.3" />
        <circle cx="15.5" cy="12" r="3" stroke="#06B6D4" strokeWidth="1.5" fill="#06B6D4" fillOpacity="0.3" />
        <path d="M11.5 12H12.5" stroke="#06B6D4" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M5 11L5.5 12" stroke="#06B6D4" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M19 11L18.5 12" stroke="#06B6D4" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
    outros: (
      <svg viewBox="0 0 24 24" fill="none" className={cn(sizeClass, className)}>
        <circle cx="12" cy="12" r="11" fill="#6B7280" fillOpacity="0.15" />
        <rect x="7" y="9" width="10" height="8" rx="1" fill="#6B7280" />
        <path d="M9 9V8C9 6.89543 9.89543 6 11 6H13C14.1046 6 15 6.89543 15 8V9" stroke="#6B7280" strokeWidth="1.5" />
        <circle cx="12" cy="13" r="1.5" fill="white" />
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
