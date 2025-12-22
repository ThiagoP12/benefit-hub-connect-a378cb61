import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Settings, Construction } from 'lucide-react';

export default function Configuracoes() {
  return (
    <MainLayout>
      <div className="space-y-4 sm:space-y-6">
        <div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground">
            Configurações
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
            Configure as opções do sistema
          </p>
        </div>

        <Card className="max-w-xl">
          <CardHeader className="text-center pb-2">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-warning/10 mb-4">
              <Construction className="h-8 w-8 text-warning" />
            </div>
            <CardTitle className="flex items-center justify-center gap-2">
              <Settings className="h-5 w-5" />
              Em Desenvolvimento
            </CardTitle>
            <CardDescription>
              Esta funcionalidade está sendo desenvolvida e estará disponível em breve.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center text-sm text-muted-foreground">
            As configurações permitirão personalizar diversos aspectos do sistema, como notificações, valores de benefícios e regras de aprovação.
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
