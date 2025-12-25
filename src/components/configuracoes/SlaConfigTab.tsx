import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { BenefitType, benefitTypeLabels, benefitTypeEmojis } from '@/types/benefits';
import { Clock, Save, CheckCircle, AlertTriangle, XCircle, Calendar, PauseCircle } from 'lucide-react';

interface SlaConfig {
  id: string;
  benefit_type: string;
  green_hours: number;
  yellow_hours: number;
}

interface ApprovalCutoff {
  day: number;
}

const benefitTypes: BenefitType[] = ['autoescola', 'farmacia', 'oficina', 'vale_gas', 'papelaria', 'otica', 'outros'];

export function SlaConfigTab() {
  const [configs, setConfigs] = useState<SlaConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [cutoffDay, setCutoffDay] = useState(25);
  const [savingCutoff, setSavingCutoff] = useState(false);

  useEffect(() => {
    fetchConfigs();
    fetchCutoffDay();
  }, []);

  const fetchCutoffDay = async () => {
    try {
      const { data, error } = await supabase
        .from('system_config')
        .select('value')
        .eq('key', 'approval_cutoff_day')
        .maybeSingle();

      if (error) throw error;
      
      if (data?.value) {
        const parsed = data.value as unknown as ApprovalCutoff;
        setCutoffDay(parsed.day || 25);
      }
    } catch (error) {
      console.error('Erro ao carregar dia de corte:', error);
    }
  };

  const fetchConfigs = async () => {
    try {
      const { data, error } = await supabase
        .from('sla_configs')
        .select('*')
        .order('benefit_type');

      if (error) throw error;

      // If no configs exist, create default ones
      if (!data || data.length === 0) {
        const defaultConfigs: SlaConfig[] = benefitTypes.map((type, index) => ({
          id: `temp-${index}`,
          benefit_type: type,
          green_hours: 2,
          yellow_hours: 6,
        }));
        setConfigs(defaultConfigs);
      } else {
        setConfigs(data);
      }
    } catch (error) {
      console.error('Erro ao carregar configurações SLA:', error);
      // Create default configs on error
      const defaultConfigs: SlaConfig[] = benefitTypes.map((type, index) => ({
        id: `temp-${index}`,
        benefit_type: type,
        green_hours: 2,
        yellow_hours: 6,
      }));
      setConfigs(defaultConfigs);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveCutoff = async () => {
    if (cutoffDay < 1 || cutoffDay > 31) {
      toast.error('O dia deve estar entre 1 e 31');
      return;
    }
    
    setSavingCutoff(true);
    try {
      const { error } = await supabase
        .from('system_config')
        .update({ value: { day: cutoffDay }, updated_at: new Date().toISOString() })
        .eq('key', 'approval_cutoff_day');

      if (error) throw error;
      
      toast.success('Dia de corte atualizado com sucesso!');
    } catch (error) {
      console.error('Erro ao salvar dia de corte:', error);
      toast.error('Erro ao salvar dia de corte');
    } finally {
      setSavingCutoff(false);
    }
  };

  const handleConfigChange = (id: string, field: 'green_hours' | 'yellow_hours', value: number) => {
    setConfigs(prev => 
      prev.map(config => 
        config.id === id ? { ...config, [field]: value } : config
      )
    );
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Validate that yellow_hours > green_hours
      const invalidConfigs = configs.filter(c => c.yellow_hours <= c.green_hours);
      if (invalidConfigs.length > 0) {
        toast.error('O tempo amarelo deve ser maior que o tempo verde');
        setSaving(false);
        return;
      }

      // Upsert configs
      for (const config of configs) {
        const isTemp = config.id.startsWith('temp-');
        
        if (isTemp) {
          // Insert new config
          const { error } = await supabase
            .from('sla_configs')
            .insert({
              benefit_type: config.benefit_type,
              green_hours: config.green_hours,
              yellow_hours: config.yellow_hours,
            });
          
          if (error) throw error;
        } else {
          // Update existing config
          const { error } = await supabase
            .from('sla_configs')
            .update({
              green_hours: config.green_hours,
              yellow_hours: config.yellow_hours,
            })
            .eq('id', config.id);
          
          if (error) throw error;
        }
      }

      toast.success('Configurações de SLA salvas com sucesso!');
      fetchConfigs(); // Refresh to get real IDs
    } catch (error) {
      console.error('Erro ao salvar:', error);
      toast.error('Erro ao salvar configurações de SLA');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  const currentDay = new Date().getDate();
  const isBlockPeriod = currentDay >= cutoffDay;

  return (
    <div className="space-y-6">
      {/* Período de Bloqueio */}
      <Card className="border-warning/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-warning" />
            Período de Bloqueio de Aprovações
          </CardTitle>
          <CardDescription>
            A partir deste dia, o SLA será pausado e aprovações requerem confirmação extra
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-end gap-4">
            <div className="space-y-2 flex-1 max-w-[200px]">
              <Label htmlFor="cutoff-day" className="flex items-center gap-2">
                <PauseCircle className="h-4 w-4 text-warning" />
                Dia de corte (mensal)
              </Label>
              <Input
                id="cutoff-day"
                type="number"
                min={1}
                max={31}
                value={cutoffDay}
                onChange={(e) => setCutoffDay(Number(e.target.value))}
              />
            </div>
            <Button onClick={handleSaveCutoff} disabled={savingCutoff} variant="outline">
              <Save className="h-4 w-4 mr-2" />
              {savingCutoff ? 'Salvando...' : 'Salvar'}
            </Button>
          </div>
          
          {isBlockPeriod && (
            <Alert className="border-warning bg-warning/10">
              <PauseCircle className="h-4 w-4 text-warning" />
              <AlertDescription className="text-warning">
                ⚠️ Período de bloqueio ativo (dia {currentDay}). SLA está pausado e aprovações requerem confirmação.
              </AlertDescription>
            </Alert>
          )}
          
          <p className="text-sm text-muted-foreground">
            A partir do dia <strong>{cutoffDay}</strong> de cada mês, o indicador de SLA será pausado 
            e as aprovações exigirão uma confirmação adicional do gestor.
          </p>
        </CardContent>
      </Card>

      <Separator />

      {/* Info Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" />
            Configuração de SLA
          </CardTitle>
          <CardDescription>
            Define os tempos de atendimento para cada tipo de benefício
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-6">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-success" />
              <span className="text-sm">Verde: Dentro do prazo ideal</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-warning" />
              <span className="text-sm">Amarelo: Atenção ao prazo</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-destructive" />
              <span className="text-sm">Vermelho: Prazo vencido</span>
            </div>
            <div className="flex items-center gap-2">
              <PauseCircle className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm">Pausado: Período de bloqueio</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* SLA by Benefit Type */}
      <Card>
        <CardHeader>
          <CardTitle>Tempos por Tipo de Benefício</CardTitle>
          <CardDescription>
            Configure os limites de tempo em horas para cada indicador
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {configs.map((config) => (
              <div 
                key={config.id} 
                className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 rounded-lg bg-muted/50 border border-border"
              >
                <div className="flex items-center gap-2 min-w-[180px]">
                  <span className="text-xl">
                    {benefitTypeEmojis[config.benefit_type as BenefitType]}
                  </span>
                  <span className="font-medium">
                    {benefitTypeLabels[config.benefit_type as BenefitType]}
                  </span>
                </div>

                <div className="flex-1 flex flex-col sm:flex-row gap-4 w-full">
                  <div className="flex-1">
                    <Label className="text-xs flex items-center gap-1">
                      <CheckCircle className="h-3 w-3 text-success" />
                      Verde até (horas)
                    </Label>
                    <Input
                      type="number"
                      value={config.green_hours}
                      onChange={(e) => handleConfigChange(config.id, 'green_hours', Number(e.target.value))}
                      min={1}
                      max={48}
                    />
                  </div>

                  <div className="flex-1">
                    <Label className="text-xs flex items-center gap-1">
                      <AlertTriangle className="h-3 w-3 text-warning" />
                      Amarelo até (horas)
                    </Label>
                    <Input
                      type="number"
                      value={config.yellow_hours}
                      onChange={(e) => handleConfigChange(config.id, 'yellow_hours', Number(e.target.value))}
                      min={config.green_hours + 1}
                      max={72}
                    />
                  </div>

                  <div className="flex-1 flex items-end">
                    <div className="text-sm text-muted-foreground">
                      <XCircle className="h-3 w-3 text-destructive inline mr-1" />
                      Vermelho: após {config.yellow_hours}h
                    </div>
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
