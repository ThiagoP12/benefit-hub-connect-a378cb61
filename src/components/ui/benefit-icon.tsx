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
        {/* Engrenagem */}
        <path
          d="M12 8.5C10.07 8.5 8.5 10.07 8.5 12C8.5 13.93 10.07 15.5 12 15.5C13.93 15.5 15.5 13.93 15.5 12C15.5 10.07 13.93 8.5 12 8.5ZM12 14C10.9 14 10 13.1 10 12C10 10.9 10.9 10 12 10C13.1 10 14 10.9 14 12C14 13.1 13.1 14 12 14Z"
          fill="#F59E0B"
        />
        <path
          d="M17.4 11H18V13H17.4C17.2 13.8 16.9 14.5 16.4 15.1L16.9 15.6L15.5 17L15 16.5C14.4 17 13.7 17.3 12.9 17.5V18H11.1V17.5C10.3 17.3 9.6 17 9 16.5L8.5 17L7.1 15.6L7.6 15.1C7.1 14.5 6.8 13.8 6.6 13H6V11H6.6C6.8 10.2 7.1 9.5 7.6 8.9L7.1 8.4L8.5 7L9 7.5C9.6 7 10.3 6.7 11.1 6.5V6H12.9V6.5C13.7 6.7 14.4 7 15 7.5L15.5 7L16.9 8.4L16.4 8.9C16.9 9.5 17.2 10.2 17.4 11Z"
          fill="#F59E0B"
        />
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
