import { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, Pencil, Trash2, Search, UserCog, Shield, Users, UserCheck, Filter } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { UserFormDialog } from '@/components/usuarios/UserFormDialog';
import { DeleteUserDialog } from '@/components/usuarios/DeleteUserDialog';
import { PaginationControls } from '@/components/ui/pagination-controls';

interface UserWithRole {
  id: string;
  user_id: string;
  email: string;
  full_name: string;
  role: 'admin' | 'gestor' | 'agente_dp';
}

type SystemRole = 'admin' | 'gestor' | 'agente_dp';

const roleLabels: Record<SystemRole, string> = {
  admin: 'Administrador',
  gestor: 'Gestor',
  agente_dp: 'Agente de DP',
};

const roleColors: Record<SystemRole, string> = {
  admin: 'bg-destructive/10 text-destructive border-destructive/20',
  gestor: 'bg-warning/10 text-warning border-warning/20',
  agente_dp: 'bg-info/10 text-info border-info/20',
};

const roleIcons: Record<SystemRole, typeof Shield> = {
  admin: Shield,
  gestor: Users,
  agente_dp: UserCheck,
};

export default function Usuarios() {
  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  
  // Dialog states
  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserWithRole | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data: rolesData, error: rolesError } = await supabase
        .from('user_roles')
        .select('*')
        .in('role', ['admin', 'gestor', 'agente_dp']);

      if (rolesError) {
        console.error('Error fetching roles:', rolesError);
        return;
      }

      if (!rolesData || rolesData.length === 0) {
        setUsers([]);
        return;
      }

      const userIds = rolesData.map(r => r.user_id);
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('user_id, full_name, email')
        .in('user_id', userIds);

      if (profilesError) {
        console.error('Error fetching profiles:', profilesError);
        return;
      }

      const profilesMap = new Map(profilesData?.map(p => [p.user_id, p]) || []);

      const usersWithRoles: UserWithRole[] = rolesData.map(role => ({
        id: role.id,
        user_id: role.user_id,
        email: profilesMap.get(role.user_id)?.email || '',
        full_name: profilesMap.get(role.user_id)?.full_name || 'N/A',
        role: role.role as SystemRole,
      }));

      setUsers(usersWithRoles);
    } catch (err) {
      console.error('Error:', err);
      toast.error('Erro ao carregar usuários');
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.full_name.toLowerCase().includes(search.toLowerCase()) ||
                          user.email.toLowerCase().includes(search.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  // Pagination
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [search, roleFilter]);

  // Calculate stats
  const stats = {
    total: users.length,
    admins: users.filter(u => u.role === 'admin').length,
    gestores: users.filter(u => u.role === 'gestor').length,
    agentes: users.filter(u => u.role === 'agente_dp').length,
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  const handleEdit = (user: UserWithRole) => {
    setSelectedUser(user);
    setFormDialogOpen(true);
  };

  const handleDelete = (user: UserWithRole) => {
    setSelectedUser(user);
    setDeleteDialogOpen(true);
  };

  const handleNewUser = () => {
    setSelectedUser(null);
    setFormDialogOpen(true);
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground flex items-center gap-2">
              <UserCog className="h-6 w-6 sm:h-7 sm:w-7 text-primary" />
              Usuários do Sistema
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
              Gerencie os usuários com acesso ao painel administrativo
            </p>
          </div>
          <Button onClick={handleNewUser} className="gap-2">
            <Plus className="h-4 w-4" />
            Novo Usuário
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Card 
            className={`border-2 cursor-pointer transition-all ${roleFilter === 'all' ? 'border-primary ring-2 ring-primary/20' : 'border-border/50 hover:border-primary/20'}`}
            onClick={() => setRoleFilter('all')}
          >
            <CardContent className="pt-4 pb-3">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Users className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.total}</p>
                  <p className="text-xs text-muted-foreground">Total</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card 
            className={`border-2 cursor-pointer transition-all ${roleFilter === 'admin' ? 'border-destructive ring-2 ring-destructive/20' : 'border-destructive/20 hover:border-destructive/40'}`}
            onClick={() => setRoleFilter(roleFilter === 'admin' ? 'all' : 'admin')}
          >
            <CardContent className="pt-4 pb-3">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-destructive/10">
                  <Shield className="h-5 w-5 text-destructive" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.admins}</p>
                  <p className="text-xs text-muted-foreground">Administradores</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card 
            className={`border-2 cursor-pointer transition-all ${roleFilter === 'gestor' ? 'border-warning ring-2 ring-warning/20' : 'border-warning/20 hover:border-warning/40'}`}
            onClick={() => setRoleFilter(roleFilter === 'gestor' ? 'all' : 'gestor')}
          >
            <CardContent className="pt-4 pb-3">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-warning/10">
                  <Users className="h-5 w-5 text-warning" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.gestores}</p>
                  <p className="text-xs text-muted-foreground">Gestores</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card 
            className={`border-2 cursor-pointer transition-all ${roleFilter === 'agente_dp' ? 'border-info ring-2 ring-info/20' : 'border-info/20 hover:border-info/40'}`}
            onClick={() => setRoleFilter(roleFilter === 'agente_dp' ? 'all' : 'agente_dp')}
          >
            <CardContent className="pt-4 pb-3">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-info/10">
                  <UserCheck className="h-5 w-5 text-info" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.agentes}</p>
                  <p className="text-xs text-muted-foreground">Agentes de DP</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome ou email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="w-full sm:w-[200px]">
              <Filter className="h-4 w-4 mr-2 text-muted-foreground" />
              <SelectValue placeholder="Filtrar por função" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as funções</SelectItem>
              <SelectItem value="admin">
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-destructive" />
                  Administrador
                </div>
              </SelectItem>
              <SelectItem value="gestor">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-warning" />
                  Gestor
                </div>
              </SelectItem>
              <SelectItem value="agente_dp">
                <div className="flex items-center gap-2">
                  <UserCheck className="h-4 w-4 text-info" />
                  Agente de DP
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Table */}
        <Card className="border-2 border-border/50 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50 hover:bg-muted/50">
                <TableHead className="font-semibold">Usuário</TableHead>
                <TableHead className="font-semibold hidden sm:table-cell">Email</TableHead>
                <TableHead className="font-semibold">Função</TableHead>
                <TableHead className="text-right font-semibold">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i} className="even:bg-muted/20">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Skeleton className="h-10 w-10 rounded-full" />
                        <Skeleton className="h-4 w-32" />
                      </div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell"><Skeleton className="h-4 w-40" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-8 w-20 ml-auto" /></TableCell>
                  </TableRow>
                ))
              ) : filteredUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-12">
                    <div className="flex flex-col items-center gap-2">
                      <UserCog className="h-10 w-10 text-muted-foreground/50" />
                      <p className="text-muted-foreground">Nenhum usuário encontrado</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                paginatedUsers.map((user, index) => {
                  const RoleIcon = roleIcons[user.role];
                  return (
                    <TableRow 
                      key={user.id} 
                      className={`hover:bg-muted/40 transition-colors ${index % 2 === 1 ? 'bg-muted/20' : ''}`}
                    >
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10 border-2 border-border">
                            <AvatarFallback className="bg-primary/10 text-primary font-medium">
                              {getInitials(user.full_name)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex flex-col">
                            <span className="font-medium">{user.full_name}</span>
                            <span className="text-xs text-muted-foreground sm:hidden">{user.email}</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell text-muted-foreground">
                        {user.email}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={`${roleColors[user.role]} gap-1.5`}>
                          <RoleIcon className="h-3 w-3" />
                          <span className="hidden sm:inline">{roleLabels[user.role]}</span>
                          <span className="sm:hidden">{user.role === 'admin' ? 'Admin' : user.role === 'gestor' ? 'Gestor' : 'Agente'}</span>
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 hover:bg-primary/10"
                            onClick={() => handleEdit(user)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-destructive hover:bg-destructive/10 hover:text-destructive"
                            onClick={() => handleDelete(user)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </Card>

        {/* Pagination */}
        {filteredUsers.length > 0 && (
          <PaginationControls
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={filteredUsers.length}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
            onItemsPerPageChange={setItemsPerPage}
          />
        )}
      </div>

      {/* Dialogs */}
      <UserFormDialog
        open={formDialogOpen}
        onOpenChange={setFormDialogOpen}
        user={selectedUser}
        onSuccess={fetchUsers}
      />
      <DeleteUserDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        user={selectedUser}
        onSuccess={fetchUsers}
      />
    </MainLayout>
  );
}
