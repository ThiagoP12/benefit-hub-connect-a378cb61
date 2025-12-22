import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageSquare, Construction } from 'lucide-react';

export default function WhatsApp() {
  return (
    <MainLayout>
      <div className="space-y-4 sm:space-y-6">
        <div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground">
            Integração WhatsApp
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
            Configure a integração com WhatsApp Business
          </p>
        </div>

        <Card className="max-w-xl">
          <CardHeader className="text-center pb-2">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-warning/10 mb-4">
              <Construction className="h-8 w-8 text-warning" />
            </div>
            <CardTitle className="flex items-center justify-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Em Desenvolvimento
            </CardTitle>
            <CardDescription>
              Esta funcionalidade está sendo desenvolvida e estará disponível em breve.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center text-sm text-muted-foreground">
            A integração com WhatsApp permitirá enviar notificações automáticas sobre o status das solicitações de benefícios.
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
