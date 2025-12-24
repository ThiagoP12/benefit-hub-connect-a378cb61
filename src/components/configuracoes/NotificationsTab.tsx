import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Bell, Mail, MessageSquare, Save, Clock, AlertTriangle, CheckCircle } from 'lucide-react';

interface NotificationSettings {
  emailNewRequest: boolean;
  emailStatusChange: boolean;
  emailSlaWarning: boolean;
  pushEnabled: boolean;
  pushNewRequest: boolean;
  pushStatusChange: boolean;
  whatsappEnabled: boolean;
  whatsappStatusChange: boolean;
}

export function NotificationsTab() {
  const [settings, setSettings] = useState<NotificationSettings>({
    emailNewRequest: true,
    emailStatusChange: true,
    emailSlaWarning: true,
    pushEnabled: false,
    pushNewRequest: true,
    pushStatusChange: true,
    whatsappEnabled: false,
    whatsappStatusChange: false,
  });
  const [saving, setSaving] = useState(false);

  const handleToggle = (key: keyof NotificationSettings) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // In a real implementation, save to database
      await new Promise(resolve => setTimeout(resolve, 500));
      toast.success('Configurações de notificação salvas!');
    } catch (error) {
      toast.error('Erro ao salvar configurações');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Email Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5 text-primary" />
            Notificações por E-mail
          </CardTitle>
          <CardDescription>
            Configure quando enviar e-mails automáticos
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50 border border-border">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-5 w-5 text-success" />
              <div>
                <Label className="text-base">Nova Solicitação</Label>
                <p className="text-sm text-muted-foreground">
                  Notificar gestores quando uma nova solicitação for criada
                </p>
              </div>
            </div>
            <Switch
              checked={settings.emailNewRequest}
              onCheckedChange={() => handleToggle('emailNewRequest')}
            />
          </div>

          <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50 border border-border">
            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-info" />
              <div>
                <Label className="text-base">Mudança de Status</Label>
                <p className="text-sm text-muted-foreground">
                  Notificar colaborador quando status da solicitação mudar
                </p>
              </div>
            </div>
            <Switch
              checked={settings.emailStatusChange}
              onCheckedChange={() => handleToggle('emailStatusChange')}
            />
          </div>

          <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50 border border-border">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-warning" />
              <div>
                <Label className="text-base">Alerta de SLA</Label>
                <p className="text-sm text-muted-foreground">
                  Notificar gestores quando SLA estiver próximo de vencer
                </p>
              </div>
            </div>
            <Switch
              checked={settings.emailSlaWarning}
              onCheckedChange={() => handleToggle('emailSlaWarning')}
            />
          </div>
        </CardContent>
      </Card>

      {/* Push Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-primary" />
            Notificações Push
          </CardTitle>
          <CardDescription>
            Notificações no navegador (requer permissão)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50 border border-border">
            <div className="flex items-center gap-3">
              <Bell className="h-5 w-5 text-primary" />
              <div>
                <Label className="text-base">Ativar Push Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Habilitar notificações push no navegador
                </p>
              </div>
            </div>
            <Switch
              checked={settings.pushEnabled}
              onCheckedChange={() => handleToggle('pushEnabled')}
            />
          </div>

          {settings.pushEnabled && (
            <>
              <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30 border border-border ml-4">
                <div>
                  <Label className="text-sm">Novas Solicitações</Label>
                </div>
                <Switch
                  checked={settings.pushNewRequest}
                  onCheckedChange={() => handleToggle('pushNewRequest')}
                />
              </div>

              <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30 border border-border ml-4">
                <div>
                  <Label className="text-sm">Mudanças de Status</Label>
                </div>
                <Switch
                  checked={settings.pushStatusChange}
                  onCheckedChange={() => handleToggle('pushStatusChange')}
                />
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* WhatsApp Integration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-success" />
            Integração WhatsApp
          </CardTitle>
          <CardDescription>
            Notificações automáticas via WhatsApp Business
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50 border border-border">
            <div className="flex items-center gap-3">
              <MessageSquare className="h-5 w-5 text-success" />
              <div>
                <Label className="text-base">Ativar WhatsApp</Label>
                <p className="text-sm text-muted-foreground">
                  Requer configuração da API do WhatsApp Business
                </p>
              </div>
            </div>
            <Switch
              checked={settings.whatsappEnabled}
              onCheckedChange={() => handleToggle('whatsappEnabled')}
            />
          </div>

          {settings.whatsappEnabled && (
            <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30 border border-border ml-4">
              <div>
                <Label className="text-sm">Notificar Mudança de Status</Label>
              </div>
              <Switch
                checked={settings.whatsappStatusChange}
                onCheckedChange={() => handleToggle('whatsappStatusChange')}
              />
            </div>
          )}

          {!settings.whatsappEnabled && (
            <div className="p-4 rounded-lg bg-warning/10 border border-warning/20">
              <p className="text-sm text-warning-foreground flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                Configure a integração WhatsApp na página dedicada
              </p>
            </div>
          )}
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
