import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Unit {
  id: string;
  name: string;
  code: string;
}

interface EditUnitDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  unit: Unit | null;
  onSuccess: () => void;
}

export function EditUnitDialog({ open, onOpenChange, unit, onSuccess }: EditUnitDialogProps) {
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [saving, setSaving] = useState(false);

  const isEditing = !!unit;

  useEffect(() => {
    if (unit) {
      setName(unit.name);
      setCode(unit.code);
    } else {
      setName('');
      setCode('');
    }
  }, [unit, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim() || !code.trim()) {
      toast.error('Preencha todos os campos');
      return;
    }

    setSaving(true);
    try {
      if (isEditing && unit) {
        const { error } = await supabase
          .from('units')
          .update({ name: name.trim(), code: code.trim().toUpperCase() })
          .eq('id', unit.id);

        if (error) throw error;
        toast.success('Unidade atualizada com sucesso');
      } else {
        const { error } = await supabase
          .from('units')
          .insert({ name: name.trim(), code: code.trim().toUpperCase() });

        if (error) throw error;
        toast.success('Unidade criada com sucesso');
      }
      
      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      console.error('Error saving unit:', error);
      if (error.code === '23505') {
        toast.error('Já existe uma unidade com este código');
      } else {
        toast.error('Erro ao salvar unidade');
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Editar Unidade' : 'Nova Unidade'}</DialogTitle>
          <DialogDescription>
            {isEditing 
              ? 'Altere as informações da unidade abaixo.'
              : 'Preencha as informações para criar uma nova unidade.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="code">Código</Label>
              <Input
                id="code"
                placeholder="Ex: UN001"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                className="font-mono"
                maxLength={10}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">Nome da Unidade</Label>
              <Input
                id="name"
                placeholder="Ex: Unidade Central"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? 'Salvando...' : isEditing ? 'Salvar' : 'Criar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
