import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { BenefitIcon } from '@/components/ui/benefit-icon';
import { BenefitType, benefitTypeLabels, benefitTypeEmojis } from '@/types/benefits';

interface BenefitTypeCardsProps {
  data: { type: BenefitType; count: number }[];
  total: number;
}

const cardStyles: Record<BenefitType, string> = {
  alteracao_ferias: 'hover:border-emerald-500/50 hover:bg-emerald-500/5',
  aviso_folga_falta: 'hover:border-amber-500/50 hover:bg-amber-500/5',
  atestado: 'hover:border-red-500/50 hover:bg-red-500/5',
  contracheque: 'hover:border-blue-500/50 hover:bg-blue-500/5',
  abono_horas: 'hover:border-violet-500/50 hover:bg-violet-500/5',
  alteracao_horario: 'hover:border-cyan-500/50 hover:bg-cyan-500/5',
  operacao_domingo: 'hover:border-orange-500/50 hover:bg-orange-500/5',
  relatorio_ponto: 'hover:border-pink-500/50 hover:bg-pink-500/5',
};

export function BenefitTypeCards({ data, total }: BenefitTypeCardsProps) {
  const navigate = useNavigate();

  const handleClick = (type: BenefitType) => {
    navigate(`/solicitacoes?benefit_type=${type}`);
  };

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-4 gap-3">
      {data.map((item) => {
        const percentage = total > 0 ? Math.round((item.count / total) * 100) : 0;
        
        return (
          <Card
            key={item.type}
            className={`p-3 cursor-pointer transition-all duration-200 border border-border/50 ${cardStyles[item.type]}`}
            onClick={() => handleClick(item.type)}
          >
            <div className="flex items-center gap-2 mb-2">
              <BenefitIcon type={item.type} size="sm" />
              <span className="text-xs font-medium text-muted-foreground truncate">
                {benefitTypeEmojis[item.type]} {benefitTypeLabels[item.type]}
              </span>
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-xl font-bold text-foreground">{item.count}</span>
              <span className="text-xs text-muted-foreground">{percentage}%</span>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
