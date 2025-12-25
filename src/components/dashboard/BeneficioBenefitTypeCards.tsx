import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { BeneficioBenefitType, beneficioBenefitTypeLabels } from '@/types/benefits';
import { cn } from '@/lib/utils';
import { AnimatedCounter } from './AnimatedCounter';
import { Smile, HeartPulse, Bus } from 'lucide-react';

interface BeneficioBenefitTypeData {
  type: BeneficioBenefitType;
  count: number;
}

interface BeneficioBenefitTypeCardsProps {
  data: BeneficioBenefitTypeData[];
  total: number;
}

const cardStyles: Record<BeneficioBenefitType, string> = {
  plano_odontologico: 'hover:border-cyan-500/50 hover:bg-cyan-500/5',
  plano_saude: 'hover:border-pink-500/50 hover:bg-pink-500/5',
  vale_transporte: 'hover:border-amber-500/50 hover:bg-amber-500/5',
};

const iconConfig: Record<BeneficioBenefitType, { icon: typeof Smile; bgColor: string; iconColor: string }> = {
  plano_odontologico: {
    icon: Smile,
    bgColor: 'bg-cyan-500/15 dark:bg-cyan-400/20',
    iconColor: 'text-cyan-600 dark:text-cyan-400',
  },
  plano_saude: {
    icon: HeartPulse,
    bgColor: 'bg-pink-500/15 dark:bg-pink-400/20',
    iconColor: 'text-pink-600 dark:text-pink-400',
  },
  vale_transporte: {
    icon: Bus,
    bgColor: 'bg-amber-500/15 dark:bg-amber-400/20',
    iconColor: 'text-amber-600 dark:text-amber-400',
  },
};

export function BeneficioBenefitTypeCards({ data, total }: BeneficioBenefitTypeCardsProps) {
  const navigate = useNavigate();

  const handleClick = (type: BeneficioBenefitType) => {
    navigate(`/solicitacoes?benefit_type=${type}`);
  };

  return (
    <div className="grid grid-cols-3 gap-3">
      {data.map((item, index) => {
        const percentage = total > 0 ? Math.round((item.count / total) * 100) : 0;
        const config = iconConfig[item.type];
        const Icon = config.icon;
        
        return (
          <Card 
            key={item.type}
            className={cn(
              "border-border/50 cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] group",
              cardStyles[item.type],
              "animate-fade-in"
            )}
            style={{ animationDelay: `${index * 0.1}s` }}
            onClick={() => handleClick(item.type)}
          >
            <CardContent className="p-4 flex flex-col items-center gap-3">
              <div className="transform transition-transform duration-300 group-hover:scale-110">
                <div className={cn("w-12 h-12 rounded-full flex items-center justify-center", config.bgColor)}>
                  <Icon className={cn("h-6 w-6", config.iconColor)} />
                </div>
              </div>
              <div className="text-center">
                <p className="text-[10px] sm:text-xs font-medium text-muted-foreground uppercase tracking-wide truncate max-w-[100px]">
                  {beneficioBenefitTypeLabels[item.type]}
                </p>
                <p className="text-xl sm:text-2xl font-bold text-foreground mt-1">
                  <AnimatedCounter value={item.count} duration={800 + index * 100} />
                </p>
                <div className="mt-2 h-1.5 w-full bg-muted rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-primary to-primary/70 rounded-full transition-all duration-1000 ease-out"
                    style={{ 
                      width: `${percentage}%`,
                      transitionDelay: `${index * 0.1 + 0.5}s`
                    }}
                  />
                </div>
                <p className="text-[10px] text-muted-foreground mt-1">{percentage}% do total</p>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}