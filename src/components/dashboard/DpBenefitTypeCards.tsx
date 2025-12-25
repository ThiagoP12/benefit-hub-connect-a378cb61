import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { DpBenefitType, dpBenefitTypeLabels, dpBenefitTypeEmojis } from '@/types/benefits';
import { cn } from '@/lib/utils';
import { AnimatedCounter } from './AnimatedCounter';
import { Calendar, FileText, Stethoscope, Banknote, Clock, Timer, CalendarDays, BarChart3 } from 'lucide-react';

interface DpBenefitTypeData {
  type: DpBenefitType;
  count: number;
}

interface DpBenefitTypeCardsProps {
  data: DpBenefitTypeData[];
  total: number;
}

const cardStyles: Record<DpBenefitType, string> = {
  alteracao_ferias: 'hover:border-teal-500/50 hover:bg-teal-500/5',
  aviso_folga_falta: 'hover:border-slate-500/50 hover:bg-slate-500/5',
  atestado: 'hover:border-rose-500/50 hover:bg-rose-500/5',
  contracheque: 'hover:border-emerald-500/50 hover:bg-emerald-500/5',
  abono_horas: 'hover:border-orange-500/50 hover:bg-orange-500/5',
  alteracao_horario: 'hover:border-indigo-500/50 hover:bg-indigo-500/5',
  operacao_domingo: 'hover:border-purple-500/50 hover:bg-purple-500/5',
  relatorio_ponto: 'hover:border-sky-500/50 hover:bg-sky-500/5',
};

const iconConfig: Record<DpBenefitType, { icon: typeof Calendar; bgColor: string; iconColor: string }> = {
  alteracao_ferias: {
    icon: Calendar,
    bgColor: 'bg-teal-500/15 dark:bg-teal-400/20',
    iconColor: 'text-teal-600 dark:text-teal-400',
  },
  aviso_folga_falta: {
    icon: FileText,
    bgColor: 'bg-slate-500/15 dark:bg-slate-400/20',
    iconColor: 'text-slate-600 dark:text-slate-400',
  },
  atestado: {
    icon: Stethoscope,
    bgColor: 'bg-rose-500/15 dark:bg-rose-400/20',
    iconColor: 'text-rose-600 dark:text-rose-400',
  },
  contracheque: {
    icon: Banknote,
    bgColor: 'bg-emerald-500/15 dark:bg-emerald-400/20',
    iconColor: 'text-emerald-600 dark:text-emerald-400',
  },
  abono_horas: {
    icon: Clock,
    bgColor: 'bg-orange-500/15 dark:bg-orange-400/20',
    iconColor: 'text-orange-600 dark:text-orange-400',
  },
  alteracao_horario: {
    icon: Timer,
    bgColor: 'bg-indigo-500/15 dark:bg-indigo-400/20',
    iconColor: 'text-indigo-600 dark:text-indigo-400',
  },
  operacao_domingo: {
    icon: CalendarDays,
    bgColor: 'bg-purple-500/15 dark:bg-purple-400/20',
    iconColor: 'text-purple-600 dark:text-purple-400',
  },
  relatorio_ponto: {
    icon: BarChart3,
    bgColor: 'bg-sky-500/15 dark:bg-sky-400/20',
    iconColor: 'text-sky-600 dark:text-sky-400',
  },
};

export function DpBenefitTypeCards({ data, total }: DpBenefitTypeCardsProps) {
  const navigate = useNavigate();

  const handleClick = (type: DpBenefitType) => {
    navigate(`/solicitacoes?benefit_type=${type}`);
  };

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
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
                  {dpBenefitTypeLabels[item.type]}
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
