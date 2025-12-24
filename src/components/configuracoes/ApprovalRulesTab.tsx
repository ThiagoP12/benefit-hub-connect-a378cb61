import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { ShieldCheck, Save, Zap, Users, DollarSign } from 'lucide-react';

interface ApprovalRules {
  autoApproveEnabled: boolean;
  autoApproveMaxValue: number;
  requireManagerApproval: boolean;
  requireDpAgentApproval: boolean;
  minApproversCount: number;
}

export function ApprovalRulesTab() {
  const [rules, setRules] = useState<ApprovalRules>({
    autoApproveEnabled: false,
    autoApproveMaxValue: 100,
    requireManagerApproval: true,
    requireDpAgentApproval: false,
    minApproversCount: 1,
  });
  const [saving, setSaving] = useState(false);

  const handleToggle = (key: keyof ApprovalRules) => {
    if (typeof rules[key] === 'boolean') {
      setRules(prev => ({ ...prev, [key]: !prev[key] }));
    }
  };

  const handleNumberChange = (key: keyof ApprovalRules, value: number) => {
    setRules(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // In a real implementation, save to database
      await new Promise(resolve => setTimeout(resolve, 500));
      toast.success('Regras de aprovação salvas!');
    } catch (error) {
      toast.error('Erro ao salvar regras');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Auto Approval */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-warning" />
            Aprovação Automática
          </CardTitle>
          <CardDescription>
            Configure regras para aprovação automática de solicitações
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50 border border-border">
            <div className="flex items-center gap-3">
              <Zap className="h-5 w-5 text-warning" />
              <div>
                <Label className="text-base">Ativar Aprovação Automática</Label>
                <p className="text-sm text-muted-foreground">
                  Aprovar automaticamente solicitações dentro do limite
                </p>
              </div>
            </div>
            <Switch
              checked={rules.autoApproveEnabled}
              onCheckedChange={() => handleToggle('autoApproveEnabled')}
            />
          </div>

          {rules.autoApproveEnabled && (
            <div className="p-4 rounded-lg bg-muted/30 border border-border ml-4">
              <div className="flex items-center gap-4">
                <div className="flex-1 max-w-xs">
                  <Label className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    Valor máximo para auto-aprovação (R$)
                  </Label>
                  <Input
                    type="number"
                    value={rules.autoApproveMaxValue}
                    onChange={(e) => handleNumberChange('autoApproveMaxValue', Number(e.target.value))}
                    min={0}
                    step={50}
                    className="mt-2"
                  />
                </div>
                <p className="text-sm text-muted-foreground">
                  Solicitações até este valor serão aprovadas automaticamente
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Manual Approval Requirements */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-primary" />
            Requisitos de Aprovação Manual
          </CardTitle>
          <CardDescription>
            Configure quem pode aprovar solicitações manualmente
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50 border border-border">
            <div className="flex items-center gap-3">
              <Users className="h-5 w-5 text-info" />
              <div>
                <Label className="text-base">Requer Aprovação de Gestor</Label>
                <p className="text-sm text-muted-foreground">
                  Gestores podem aprovar solicitações
                </p>
              </div>
            </div>
            <Switch
              checked={rules.requireManagerApproval}
              onCheckedChange={() => handleToggle('requireManagerApproval')}
            />
          </div>

          <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50 border border-border">
            <div className="flex items-center gap-3">
              <ShieldCheck className="h-5 w-5 text-success" />
              <div>
                <Label className="text-base">Requer Aprovação do Agente DP</Label>
                <p className="text-sm text-muted-foreground">
                  Agentes de DP também podem aprovar
                </p>
              </div>
            </div>
            <Switch
              checked={rules.requireDpAgentApproval}
              onCheckedChange={() => handleToggle('requireDpAgentApproval')}
            />
          </div>

          <div className="p-4 rounded-lg bg-muted/50 border border-border">
            <div className="flex items-center gap-4">
              <div className="flex-1 max-w-xs">
                <Label className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Número mínimo de aprovadores
                </Label>
                <Input
                  type="number"
                  value={rules.minApproversCount}
                  onChange={(e) => handleNumberChange('minApproversCount', Number(e.target.value))}
                  min={1}
                  max={3}
                  className="mt-2"
                />
              </div>
              <p className="text-sm text-muted-foreground">
                Quantos aprovadores são necessários para confirmar
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving} className="gap-2">
          <Save className="h-4 w-4" />
          {saving ? 'Salvando...' : 'Salvar Regras'}
        </Button>
      </div>
    </div>
  );
}
