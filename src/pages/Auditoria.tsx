import { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, ClipboardList, Plus, Pencil, Trash2, CheckCircle, XCircle, FileText, User, Building2, Clock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';
import { PaginationControls } from '@/components/ui/pagination-controls';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

interface Log {
  id: string;
  entity_type: string | null;
  entity_id: string | null;
  action: string;
  user_id: string | null;
  details: any;
  created_at: string;
  profile?: {
    full_name: string;
  } | null;
}

const ITEMS_PER_PAGE = 15;

const actionConfig: Record<string, { label: string; icon: React.ElementType; color: string; bgColor: string }> = {
  benefit_request_created: { label: '📝 Nova Solicitação', icon: Plus, color: 'text-green-600', bgColor: 'bg-green-100 dark:bg-green-900/30' },
  benefit_request_status_changed: { label: '🔄 Status Alterado', icon: Clock, color: 'text-blue-600', bgColor: 'bg-blue-100 dark:bg-blue-900/30' },
  benefit_request_deleted: { label: '🗑️ Solicitação Excluída', icon: Trash2, color: 'text-red-600', bgColor: 'bg-red-100 dark:bg-red-900/30' },
  profile_updated_by_admin: { label: '✏️ Perfil Atualizado', icon: Pencil, color: 'text-orange-600', bgColor: 'bg-orange-100 dark:bg-orange-900/30' },
  profile_deleted: { label: '🗑️ Perfil Excluído', icon: Trash2, color: 'text-red-600', bgColor: 'bg-red-100 dark:bg-red-900/30' },
  user_role_assigned: { label: '👑 Permissão Atribuída', icon: User, color: 'text-purple-600', bgColor: 'bg-purple-100 dark:bg-purple-900/30' },
  user_role_changed: { label: '🔄 Permissão Alterada', icon: User, color: 'text-purple-600', bgColor: 'bg-purple-100 dark:bg-purple-900/30' },
  user_role_removed: { label: '❌ Permissão Removida', icon: XCircle, color: 'text-red-600', bgColor: 'bg-red-100 dark:bg-red-900/30' },
  document_deleted: { label: '📄 Documento Excluído', icon: FileText, color: 'text-red-600', bgColor: 'bg-red-100 dark:bg-red-900/30' },
};

const entityConfig: Record<string, { label: string; icon: React.ElementType; color: string }> = {
  benefit_request: { label: 'Solicitação', icon: FileText, color: 'text-primary' },
  profile: { label: 'Perfil', icon: User, color: 'text-info' },
  user_role: { label: 'Permissão', icon: User, color: 'text-purple-500' },
  collaborator_document: { label: 'Documento', icon: FileText, color: 'text-orange-500' },
  unit: { label: 'Unidade', icon: Building2, color: 'text-green-500' },
};

export default function Auditoria() {
  const [logs, setLogs] = useState<Log[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState<string>('all');
  const [entityFilter, setEntityFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const { data: logsData, error: logsError } = await supabase
        .from('logs')
        .select('*')
        .order('created_at', { ascending: false });

      if (logsError) {
        console.error('Error fetching logs:', logsError);
        return;
      }

      // Fetch profiles separately
      const userIds = [...new Set(logsData?.map(l => l.user_id).filter(Boolean) || [])];
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('user_id, full_name')
        .in('user_id', userIds);

      const profilesMap = new Map(profilesData?.map(p => [p.user_id, p]) || []);

      const logsWithProfiles = (logsData || []).map(log => ({
        ...log,
        profile: log.user_id ? profilesMap.get(log.user_id) || null : null
      }));

      setLogs(logsWithProfiles as Log[]);
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const uniqueActions = [...new Set(logs.map(l => l.action))];
  const uniqueEntities = [...new Set(logs.map(l => l.entity_type).filter(Boolean))];

  const filteredLogs = logs.filter(log => {
    const matchesSearch = 
      log.action.toLowerCase().includes(search.toLowerCase()) ||
      log.entity_type?.toLowerCase().includes(search.toLowerCase()) ||
      log.profile?.full_name?.toLowerCase().includes(search.toLowerCase());
    
    const matchesAction = actionFilter === 'all' || log.action === actionFilter;
    const matchesEntity = entityFilter === 'all' || log.entity_type === entityFilter;

    return matchesSearch && matchesAction && matchesEntity;
  });

  const totalPages = Math.ceil(filteredLogs.length / ITEMS_PER_PAGE);
  const paginatedLogs = filteredLogs.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  };

  const getActionConfig = (action: string) => {
    return actionConfig[action] || { 
      label: action, 
      icon: ClipboardList, 
      color: 'text-muted-foreground',
      bgColor: 'bg-muted'
    };
  };

  const getEntityConfig = (entity: string | null) => {
    if (!entity) return null;
    return entityConfig[entity] || { label: entity, icon: FileText, color: 'text-muted-foreground' };
  };

  return (
    <MainLayout>
      <div className="space-y-4 sm:space-y-6">
        <div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground flex items-center gap-2">
            <ClipboardList className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
            📋 Auditoria
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
            Histórico de todas as ações realizadas no sistema
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="🔍 Buscar por ação, entidade ou usuário..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={actionFilter} onValueChange={setActionFilter}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Filtrar ação" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">📊 Todas as ações</SelectItem>
              {uniqueActions.map((action) => (
                <SelectItem key={action} value={action}>
                  {getActionConfig(action).label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={entityFilter} onValueChange={setEntityFilter}>
            <SelectTrigger className="w-full sm:w-44">
              <SelectValue placeholder="Filtrar entidade" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">📦 Todas as entidades</SelectItem>
              {uniqueEntities.map((entity) => (
                <SelectItem key={entity} value={entity!}>
                  {getEntityConfig(entity)?.label || entity}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Timeline Cards */}
        <div className="space-y-3">
          {loading ? (
            Array.from({ length: 10 }).map((_, i) => (
              <Card key={i} className="border-2">
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-48" />
                      <Skeleton className="h-3 w-32" />
                    </div>
                    <Skeleton className="h-4 w-24" />
                  </div>
                </CardContent>
              </Card>
            ))
          ) : paginatedLogs.length === 0 ? (
            <Card className="border-2">
              <CardContent className="p-8 text-center">
                <ClipboardList className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                <p className="text-muted-foreground">Nenhum registro de auditoria encontrado</p>
              </CardContent>
            </Card>
          ) : (
            paginatedLogs.map((log, index) => {
              const action = getActionConfig(log.action);
              const entity = getEntityConfig(log.entity_type);
              const ActionIcon = action.icon;
              
              return (
                <Card 
                  key={log.id} 
                  className={cn(
                    "border-2 transition-all hover:shadow-md animate-fade-in",
                    index % 2 === 0 ? "bg-card" : "bg-muted/20"
                  )}
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      {/* Action Icon */}
                      <div className={cn("p-2.5 rounded-full", action.bgColor)}>
                        <ActionIcon className={cn("h-5 w-5", action.color)} />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <span className="font-semibold text-foreground">{action.label}</span>
                          {entity && (
                            <Badge variant="outline" className={cn("text-xs", entity.color)}>
                              {entity.label}
                            </Badge>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-3 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1.5">
                            <Avatar className="h-5 w-5">
                              <AvatarFallback className="text-[10px] bg-primary/10 text-primary">
                                {log.profile ? getInitials(log.profile.full_name) : 'SY'}
                              </AvatarFallback>
                            </Avatar>
                            <span>{log.profile?.full_name || 'Sistema'}</span>
                          </div>
                          {log.entity_id && (
                            <span className="font-mono text-xs bg-muted px-1.5 py-0.5 rounded">
                              ID: {log.entity_id.slice(0, 8)}...
                            </span>
                          )}
                        </div>

                        {/* Details */}
                        {log.details && (
                          <div className="mt-2 text-xs text-muted-foreground bg-muted/50 rounded p-2">
                            {log.details.protocol && (
                              <span className="mr-3">📋 Protocolo: <strong>{log.details.protocol}</strong></span>
                            )}
                            {log.details.benefit_type && (
                              <span className="mr-3">📦 Tipo: {log.details.benefit_type}</span>
                            )}
                            {log.details.old_status && log.details.new_status && (
                              <span>🔄 {log.details.old_status} → {log.details.new_status}</span>
                            )}
                            {log.details.full_name && (
                              <span>👤 {log.details.full_name}</span>
                            )}
                            {log.details.role && (
                              <span>👑 {log.details.role}</span>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Timestamp */}
                      <div className="text-right shrink-0">
                        <div className="text-sm font-medium text-foreground">
                          {format(new Date(log.created_at), "HH:mm", { locale: ptBR })}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {format(new Date(log.created_at), "dd/MM/yyyy", { locale: ptBR })}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>

        {totalPages > 1 && (
          <PaginationControls
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        )}
      </div>
    </MainLayout>
  );
}