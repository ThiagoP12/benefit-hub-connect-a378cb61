import { useEffect, useState, useRef } from 'react';

interface AnimatedCounterProps {
  value: number | string;
  duration?: number;
  suffix?: string;
  className?: string;
}

export function AnimatedCounter({ 
  value, 
  duration = 1000, 
  suffix = '',
  className = ''
}: AnimatedCounterProps) {
  const [displayValue, setDisplayValue] = useState(0);
  const previousValue = useRef(0);
  const animationRef = useRef<number | null>(null);

  useEffect(() => {
    // Handle string values (like "12.5h")
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
      
      // Easing function for smooth animation
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      const currentValue = startValue + (endValue - startValue) * easeOutQuart;
      
      setDisplayValue(currentValue);

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        previousValue.current = endValue;
      }
    };

    // Cancel any ongoing animation
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

  const formatValue = () => {
    // Check if original value has decimal
    const hasDecimal = typeof value === 'string' && value.includes('.');
    const originalSuffix = typeof value === 'string' 
      ? value.replace(/[0-9.-]/g, '') 
      : suffix;
    
    if (hasDecimal) {
      return displayValue.toFixed(1) + originalSuffix;
    }
    return Math.round(displayValue).toLocaleString('pt-BR') + originalSuffix;
  };

  return (
    <span className={className}>
      {formatValue()}
    </span>
  );
}
