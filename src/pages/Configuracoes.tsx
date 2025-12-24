import { MainLayout } from '@/components/layout/MainLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CreditLimitsTab } from '@/components/configuracoes/CreditLimitsTab';
import { SlaConfigTab } from '@/components/configuracoes/SlaConfigTab';
import { NotificationsTab } from '@/components/configuracoes/NotificationsTab';
import { ApprovalRulesTab } from '@/components/configuracoes/ApprovalRulesTab';
import { Settings, DollarSign, Clock, Bell, ShieldCheck } from 'lucide-react';

export default function Configuracoes() {
  return (
    <MainLayout>
      <div className="space-y-4 sm:space-y-6">
        <div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground flex items-center gap-2">
            <Settings className="h-6 w-6 sm:h-7 sm:w-7" />
            Configurações
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
            Configure limites de crédito, SLA, notificações e regras de aprovação
          </p>
        </div>

        <Tabs defaultValue="credit" className="w-full">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 mb-6">
            <TabsTrigger value="credit" className="gap-2">
              <DollarSign className="h-4 w-4" />
              <span className="hidden sm:inline">Limites de Crédito</span>
              <span className="sm:hidden">Limites</span>
            </TabsTrigger>
            <TabsTrigger value="sla" className="gap-2">
              <Clock className="h-4 w-4" />
              <span>SLA</span>
            </TabsTrigger>
            <TabsTrigger value="notifications" className="gap-2">
              <Bell className="h-4 w-4" />
              <span className="hidden sm:inline">Notificações</span>
              <span className="sm:hidden">Alertas</span>
            </TabsTrigger>
            <TabsTrigger value="approval" className="gap-2">
              <ShieldCheck className="h-4 w-4" />
              <span className="hidden sm:inline">Regras de Aprovação</span>
              <span className="sm:hidden">Aprovação</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="credit">
            <CreditLimitsTab />
          </TabsContent>

          <TabsContent value="sla">
            <SlaConfigTab />
          </TabsContent>

          <TabsContent value="notifications">
            <NotificationsTab />
          </TabsContent>

          <TabsContent value="approval">
            <ApprovalRulesTab />
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}
