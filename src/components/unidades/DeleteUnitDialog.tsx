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

interface Unit {
  id: string;
  name: string;
  code: string;
  collaboratorCount: number;
}

interface DeleteUnitDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  unit: Unit | null;
  onSuccess: () => void;
}

export function DeleteUnitDialog({ open, onOpenChange, unit, onSuccess }: DeleteUnitDialogProps) {
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!unit) return;

    setDeleting(true);
    try {
      const { error } = await supabase
        .from('units')
        .delete()
        .eq('id', unit.id);

      if (error) throw error;
      
      toast.success('Unidade excluída com sucesso');
      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      console.error('Error deleting unit:', error);
      if (error.code === '23503') {
        toast.error('Não é possível excluir. Existem colaboradores vinculados a esta unidade.');
      } else {
        toast.error('Erro ao excluir unidade');
      }
    } finally {
      setDeleting(false);
    }
  };

  if (!unit) return null;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Excluir Unidade</AlertDialogTitle>
          <AlertDialogDescription>
            Tem certeza que deseja excluir a unidade <strong>{unit.code} - {unit.name}</strong>?
            {unit.collaboratorCount > 0 && (
              <span className="block mt-2 text-destructive font-medium">
                Atenção: Esta unidade possui {unit.collaboratorCount} colaborador(es) vinculado(s).
              </span>
            )}
            <span className="block mt-2">Esta ação não pode ser desfeita.</span>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={deleting}>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={deleting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {deleting ? 'Excluindo...' : 'Excluir'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
