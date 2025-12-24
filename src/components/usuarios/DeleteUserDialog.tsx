import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useState } from 'react';
import { Loader2, AlertTriangle } from 'lucide-react';

interface UserWithRole {
  id: string;
  user_id: string;
  email: string;
  full_name: string;
  role: 'admin' | 'gestor' | 'agente_dp';
}

interface DeleteUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: UserWithRole | null;
  onSuccess: () => void;
}

const roleLabels: Record<string, string> = {
  admin: 'Administrador',
  gestor: 'Gestor',
  agente_dp: 'Agente de DP',
};

export function DeleteUserDialog({ open, onOpenChange, user, onSuccess }: DeleteUserDialogProps) {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!user) return;

    setLoading(true);

    try {
      const { error } = await supabase
        .from('user_roles')
        .delete()
        .eq('id', user.id);

      if (error) throw error;

      toast.success('Função removida com sucesso');
      onSuccess();
      onOpenChange(false);
    } catch (err: any) {
      console.error('Error deleting user role:', err);
      toast.error(err.message || 'Erro ao remover função');
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            Remover Função de Sistema
          </AlertDialogTitle>
          <AlertDialogDescription className="space-y-2">
            <p>
              Tem certeza que deseja remover a função <strong>{roleLabels[user.role]}</strong> do usuário:
            </p>
            <div className="p-3 rounded-lg bg-muted/50 border border-border mt-2">
              <p className="font-medium text-foreground">{user.full_name}</p>
            </div>
            <p className="text-sm mt-2">
              O usuário perderá o acesso ao painel administrativo, mas continuará como colaborador no sistema.
            </p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={loading}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Remover
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
