import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BenefitIcon, BenefitType } from '@/components/ui/benefit-icon';
import { convenioLabels, ConvenioType, convenioTypes } from '@/types/benefits';
import { cn } from '@/lib/utils';
import { AnimatedCounter } from './AnimatedCounter';
import { Handshake } from 'lucide-react';

interface ConvenioData {
  type: ConvenioType;
  count: number;
}

interface ConvenioCardsProps {
  data: ConvenioData[];
  total: number;
}

const cardStyles: Record<ConvenioType, string> = {
  autoescola: 'hover:border-sky-500/50 hover:bg-sky-500/5',
  farmacia: 'hover:border-teal-500/50 hover:bg-teal-500/5',
  oficina: 'hover:border-yellow-500/50 hover:bg-yellow-500/5',
  vale_gas: 'hover:border-rose-500/50 hover:bg-rose-500/5',
  papelaria: 'hover:border-purple-500/50 hover:bg-purple-500/5',
  otica: 'hover:border-fuchsia-500/50 hover:bg-fuchsia-500/5',
};

export function ConvenioCards({ data, total }: ConvenioCardsProps) {
  const navigate = useNavigate();
  const convenioTotal = data.reduce((sum, item) => sum + item.count, 0);

  const handleClick = (type: ConvenioType) => {
    navigate(`/solicitacoes?benefit_type=${type}`);
  };

  return (
    <Card className="border-2 border-primary/10 shadow-lg animate-fade-in" style={{ animationDelay: '0.35s' }}>
      <CardHeader className="bg-gradient-to-r from-primary/5 to-transparent pb-4">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Handshake className="h-5 w-5 text-primary" />
            Convênios
          </div>
          <span className="text-sm font-normal text-muted-foreground bg-primary/10 px-3 py-1 rounded-full">
            {convenioTotal} solicitações
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
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
                    <BenefitIcon type={item.type as BenefitType} size="lg" />
                  </div>
                  <div className="text-center">
                    <p className="text-[10px] sm:text-xs font-medium text-muted-foreground uppercase tracking-wide truncate">
                      {convenioLabels[item.type]}
                    </p>
                    <p className="text-lg sm:text-xl font-bold text-foreground mt-1">
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
                    <p className="text-[10px] text-muted-foreground mt-1">{percentage}%</p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
