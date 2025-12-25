import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';
import { useEffect, useState, useRef } from 'react';

interface StatCardProps {
  title: string;
  value: number | string;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'info' | 'destructive';
  onClick?: () => void;
  animationDelay?: number;
}

const variantStyles = {
  default: 'bg-card border-border hover:border-primary/40',
  primary: 'bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20 hover:border-primary/40',
  success: 'bg-gradient-to-br from-success/10 to-success/5 border-success/20 hover:border-success/40',
  warning: 'bg-gradient-to-br from-warning/10 to-warning/5 border-warning/20 hover:border-warning/40',
  info: 'bg-gradient-to-br from-info/10 to-info/5 border-info/20 hover:border-info/40',
  destructive: 'bg-gradient-to-br from-destructive/10 to-destructive/5 border-destructive/20 hover:border-destructive/40',
};

const iconStyles = {
  default: 'bg-muted text-muted-foreground group-hover:scale-110',
  primary: 'bg-primary text-primary-foreground shadow-lg shadow-primary/25 group-hover:scale-110',
  success: 'bg-success text-success-foreground shadow-lg shadow-success/25 group-hover:scale-110',
  warning: 'bg-warning text-warning-foreground shadow-lg shadow-warning/25 group-hover:scale-110',
  info: 'bg-info text-info-foreground shadow-lg shadow-info/25 group-hover:scale-110',
  destructive: 'bg-destructive text-destructive-foreground shadow-lg shadow-destructive/25 group-hover:scale-110',
};

function AnimatedNumber({ value, duration = 1000 }: { value: number | string; duration?: number }) {
  const [displayValue, setDisplayValue] = useState(0);
  const previousValue = useRef(0);
  const animationRef = useRef<number | null>(null);

  useEffect(() => {
    const numericValue = typeof value === 'string' 
      ? parseFloat(value.replace(/[^0-9.-]/g, '')) || 0
      : value;
    
    const startValue = previousValue.current;
    const endValue = numericValue;
    const startTime = Date.now();

    const animate = () => {
      const now = Date.now();
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      const currentValue = startValue + (endValue - startValue) * easeOutQuart;
      
      setDisplayValue(currentValue);

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        previousValue.current = endValue;
      }
    };

    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }

    animate();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [value, duration]);

  const suffix = typeof value === 'string' ? value.replace(/[0-9.-]/g, '') : '';
  const hasDecimal = typeof value === 'string' && value.includes('.');
  
  return (
    <span>
      {hasDecimal ? displayValue.toFixed(1) : Math.round(displayValue).toLocaleString('pt-BR')}
      {suffix}
    </span>
  );
}

export function StatCard({ 
  title, 
  value, 
  icon: Icon, 
  trend, 
  variant = 'default', 
  onClick,
  animationDelay = 0
}: StatCardProps) {
  return (
    <div
      className={cn(
        'group rounded-xl border p-3 sm:p-4 transition-all duration-300',
        'hover:shadow-lg hover:-translate-y-0.5',
        'animate-fade-in opacity-0',
        variantStyles[variant],
        onClick && 'cursor-pointer active:scale-[0.98]'
      )}
      style={{ 
        animationDelay: `${animationDelay}s`,
        animationFillMode: 'forwards'
      }}
      onClick={onClick}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="text-[10px] sm:text-xs font-medium text-muted-foreground uppercase tracking-wide truncate">
            {title}
          </p>
          <p className="mt-1 text-lg sm:text-xl lg:text-2xl font-bold text-foreground">
            <AnimatedNumber value={value} duration={1200 + animationDelay * 200} />
          </p>
          {trend && (
            <p className={cn(
              'mt-1 text-xs font-medium flex items-center gap-1',
              trend.isPositive ? 'text-success' : 'text-destructive'
            )}>
              <span className={cn(
                'inline-block transition-transform',
                trend.isPositive ? 'rotate-0' : 'rotate-180'
              )}>
                ↑
              </span>
              {Math.abs(trend.value)}% vs. mês anterior
            </p>
          )}
        </div>
        <div className={cn(
          'flex h-8 w-8 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-xl transition-all duration-300',
          iconStyles[variant]
        )}>
          <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
        </div>
      </div>
    </div>
  );
}
