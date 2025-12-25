import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { BenefitIcon } from '@/components/ui/benefit-icon';
import { BenefitType, benefitTypeLabels } from '@/types/benefits';
import { cn } from '@/lib/utils';
import { AnimatedCounter } from './AnimatedCounter';

interface BenefitTypeData {
  type: BenefitType;
  count: number;
}

interface BenefitTypeCardsProps {
  data: BenefitTypeData[];
  total: number;
}

const cardStyles: Record<BenefitType, string> = {
  autoescola: 'hover:border-blue-500/50 hover:bg-blue-500/5',
  farmacia: 'hover:border-emerald-500/50 hover:bg-emerald-500/5',
  oficina: 'hover:border-amber-500/50 hover:bg-amber-500/5',
  vale_gas: 'hover:border-red-500/50 hover:bg-red-500/5',
  papelaria: 'hover:border-violet-500/50 hover:bg-violet-500/5',
  otica: 'hover:border-cyan-500/50 hover:bg-cyan-500/5',
  outros: 'hover:border-gray-500/50 hover:bg-gray-500/5',
};

export function BenefitTypeCards({ data, total }: BenefitTypeCardsProps) {
  const navigate = useNavigate();

  const handleClick = (type: BenefitType) => {
    navigate(`/solicitacoes?benefit_type=${type}`);
  };

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
      {data.map((item, index) => {
        const percentage = total > 0 ? Math.round((item.count / total) * 100) : 0;
        
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
                <BenefitIcon type={item.type} size="xl" />
              </div>
              <div className="text-center">
                <p className="text-[10px] sm:text-xs font-medium text-muted-foreground uppercase tracking-wide truncate">
                  {benefitTypeLabels[item.type]}
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
