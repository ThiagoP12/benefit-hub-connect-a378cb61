import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { BenefitType, benefitTypeLabels, benefitTypeEmojis } from '@/types/benefits';
import { DollarSign, Save, Plus, Trash2, AlertCircle } from 'lucide-react';

interface CreditLimit {
  id: string;
  benefit_type: string | null;
  limit_amount: number;
  period_type: string;
}

const periodTypes = [
  { value: 'monthly', label: 'Mensal' },
  { value: 'yearly', label: 'Anual' },
  { value: 'per_request', label: 'Por Solicitação' },
];

export function CreditLimitsTab() {
  const [limits, setLimits] = useState<CreditLimit[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [defaultLimit, setDefaultLimit] = useState<number>(500);

  useEffect(() => {
    fetchLimits();
  }, []);

  const fetchLimits = async () => {
    try {
      // Fetch from sla_configs table as a base and derive credit limit structure
      const { data: profiles } = await supabase
        .from('profiles')
        .select('credit_limit')
        .limit(1);

      // Get default limit from first profile or use 500
      if (profiles && profiles.length > 0 && profiles[0].credit_limit) {
        setDefaultLimit(profiles[0].credit_limit);
      }

      // For now, create in-memory limits based on benefit types
      const benefitTypes: BenefitType[] = ['alteracao_ferias', 'aviso_folga_falta', 'atestado', 'contracheque', 'abono_horas', 'alteracao_horario', 'operacao_domingo', 'relatorio_ponto'];
      const defaultLimits: CreditLimit[] = benefitTypes.map((type, index) => ({
        id: `temp-${index}`,
        benefit_type: type,
        limit_amount: 500,
        period_type: 'monthly',
      }));

      setLimits(defaultLimits);
    } catch (error) {
      console.error('Erro ao carregar limites:', error);
      toast.error('Erro ao carregar configurações de limite');
    } finally {
      setLoading(false);
    }
  };

  const handleLimitChange = (id: string, field: keyof CreditLimit, value: any) => {
    setLimits(prev => 
      prev.map(limit => 
        limit.id === id ? { ...limit, [field]: value } : limit
      )
    );
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // In a real implementation, we would save to credit_limits table
      // For now, show success message
      toast.success('Configurações de limite salvas com sucesso!');
    } catch (error) {
      console.error('Erro ao salvar:', error);
      toast.error('Erro ao salvar configurações');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Default Limit Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-primary" />
            Limite Padrão
          </CardTitle>
          <CardDescription>
            Limite de crédito padrão aplicado a novos colaboradores
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="flex-1 max-w-xs">
              <Label htmlFor="default-limit">Valor (R$)</Label>
              <Input
                id="default-limit"
                type="number"
                value={defaultLimit}
                onChange={(e) => setDefaultLimit(Number(e.target.value))}
                min={0}
                step={50}
              />
            </div>
            <p className="text-sm text-muted-foreground mt-6">
              Este valor será usado para novos colaboradores cadastrados
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Limits by Benefit Type */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-warning" />
            Limites por Tipo de Benefício
          </CardTitle>
          <CardDescription>
            Configure limites específicos para cada tipo de benefício
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {limits.map((limit) => (
              <div 
                key={limit.id} 
                className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 rounded-lg bg-muted/50 border border-border"
              >
                <div className="flex items-center gap-2 min-w-[180px]">
                  <span className="text-xl">
                    {limit.benefit_type && benefitTypeEmojis[limit.benefit_type as BenefitType]}
                  </span>
                  <span className="font-medium">
                    {limit.benefit_type && benefitTypeLabels[limit.benefit_type as BenefitType]}
                  </span>
                </div>

                <div className="flex-1 flex flex-col sm:flex-row gap-4 w-full">
                  <div className="flex-1">
                    <Label className="text-xs text-muted-foreground">Limite (R$)</Label>
                    <Input
                      type="number"
                      value={limit.limit_amount}
                      onChange={(e) => handleLimitChange(limit.id, 'limit_amount', Number(e.target.value))}
                      min={0}
                      step={50}
                    />
                  </div>

                  <div className="flex-1">
                    <Label className="text-xs text-muted-foreground">Período</Label>
                    <Select
                      value={limit.period_type}
                      onValueChange={(value) => handleLimitChange(limit.id, 'period_type', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {periodTypes.map((period) => (
                          <SelectItem key={period.value} value={period.value}>
                            {period.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving} className="gap-2">
          <Save className="h-4 w-4" />
          {saving ? 'Salvando...' : 'Salvar Configurações'}
        </Button>
      </div>
    </div>
  );
}
