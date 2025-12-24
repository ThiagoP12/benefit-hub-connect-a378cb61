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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Loader2, Shield, Users, UserCheck } from 'lucide-react';

interface UserWithRole {
  id: string;
  user_id: string;
  email: string;
  full_name: string;
  role: 'admin' | 'gestor' | 'agente_dp';
}

type SystemRole = 'admin' | 'gestor' | 'agente_dp';

interface UserFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user?: UserWithRole | null;
  onSuccess: () => void;
}

const roleOptions: { value: SystemRole; label: string; icon: typeof Shield }[] = [
  { value: 'admin', label: 'Administrador', icon: Shield },
  { value: 'gestor', label: 'Gestor', icon: Users },
  { value: 'agente_dp', label: 'Agente de DP', icon: UserCheck },
];

export function UserFormDialog({ open, onOpenChange, user, onSuccess }: UserFormDialogProps) {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<SystemRole>('gestor');
  const [profiles, setProfiles] = useState<{ user_id: string; full_name: string; email: string }[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [searchEmail, setSearchEmail] = useState('');

  const isEditing = !!user;

  useEffect(() => {
    if (open) {
      if (user) {
        setRole(user.role);
        setSelectedUserId(user.user_id);
        setEmail(user.email);
      } else {
        setRole('gestor');
        setSelectedUserId('');
        setEmail('');
        setSearchEmail('');
      }
      fetchProfiles();
    }
  }, [open, user]);

  const fetchProfiles = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('user_id, full_name, email')
        .order('full_name');

      if (error) throw error;
      setProfiles(data || []);
    } catch (err) {
      console.error('Error fetching profiles:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isEditing && !selectedUserId) {
      toast.error('Selecione um colaborador');
      return;
    }

    if (!role) {
      toast.error('Selecione uma função');
      return;
    }

    setLoading(true);

    try {
      if (isEditing && user) {
        // Update existing role
        const { error } = await supabase
          .from('user_roles')
          .update({ role })
          .eq('id', user.id);

        if (error) throw error;
        toast.success('Função atualizada com sucesso');
      } else {
        // Check if user already has a system role
        const { data: existingRole, error: checkError } = await supabase
          .from('user_roles')
          .select('id, role')
          .eq('user_id', selectedUserId)
          .in('role', ['admin', 'gestor', 'agente_dp'])
          .maybeSingle();

        if (checkError) throw checkError;

        if (existingRole) {
          toast.error('Este usuário já possui uma função de sistema');
          setLoading(false);
          return;
        }

        // Insert new role
        const { error } = await supabase
          .from('user_roles')
          .insert({ user_id: selectedUserId, role });

        if (error) throw error;
        toast.success('Usuário adicionado com sucesso');
      }

      onSuccess();
      onOpenChange(false);
    } catch (err: any) {
      console.error('Error saving user:', err);
      toast.error(err.message || 'Erro ao salvar usuário');
    } finally {
      setLoading(false);
    }
  };

  const filteredProfiles = profiles.filter(p => 
    p.full_name.toLowerCase().includes(searchEmail.toLowerCase()) ||
    p.email.toLowerCase().includes(searchEmail.toLowerCase())
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            {isEditing ? 'Editar Função' : 'Novo Usuário do Sistema'}
          </DialogTitle>
          <DialogDescription>
            {isEditing 
              ? 'Altere a função deste usuário no sistema.'
              : 'Selecione um colaborador e atribua uma função de sistema.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isEditing && (
            <div className="space-y-2">
              <Label htmlFor="user">Colaborador</Label>
              <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um colaborador" />
                </SelectTrigger>
                <SelectContent>
                  <div className="p-2">
                    <Input
                      placeholder="Buscar por nome ou email..."
                      value={searchEmail}
                      onChange={(e) => setSearchEmail(e.target.value)}
                      className="mb-2"
                    />
                  </div>
                  {filteredProfiles.length === 0 ? (
                    <div className="p-4 text-center text-sm text-muted-foreground">
                      Nenhum colaborador encontrado
                    </div>
                  ) : (
                    filteredProfiles.slice(0, 10).map((profile) => (
                      <SelectItem key={profile.user_id} value={profile.user_id}>
                        <div className="flex flex-col">
                          <span className="font-medium">{profile.full_name}</span>
                          <span className="text-xs text-muted-foreground">{profile.email}</span>
                        </div>
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
          )}

          {isEditing && user && (
            <div className="space-y-2">
              <Label>Usuário</Label>
              <div className="p-3 rounded-lg bg-muted/50 border border-border">
                <p className="font-medium">{user.full_name}</p>
                <p className="text-sm text-muted-foreground">{user.email || 'Email não disponível'}</p>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="role">Função</Label>
            <Select value={role} onValueChange={(v) => setRole(v as SystemRole)}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma função" />
              </SelectTrigger>
              <SelectContent>
                {roleOptions.map((option) => {
                  const Icon = option.icon;
                  return (
                    <SelectItem key={option.value} value={option.value}>
                      <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4" />
                        <span>{option.label}</span>
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEditing ? 'Salvar' : 'Adicionar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
