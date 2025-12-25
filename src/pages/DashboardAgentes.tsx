import { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { supabase } from '@/integrations/supabase/client';
import { 
  Users, 
  RefreshCw, 
  CheckCircle, 
  XCircle, 
  Clock, 
  TrendingUp,
  Award,
  BarChart3,
  Target,
  Zap,
  User,
  FileText
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { format, subDays, startOfMonth, endOfMonth, startOfDay, endOfDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface AgentStats {
  userId: string;
  userName: string;
  totalHandled: number;
  approved: number;
  rejected: number;
  inProgress: number;
  approvalRate: number;
  avgResponseTime: number; // in hours
}

interface OverallStats {
  totalRequests: number;
  totalHandled: number;
  totalPending: number;
  totalApproved: number;
  totalRejected: number;
  overallApprovalRate: number;
}

type DateFilter = 'today' | 'week' | 'month' | 'all';

export default function DashboardAgentes() {
  const [loading, setLoading] = useState(true);
  const [agentStats, setAgentStats] = useState<AgentStats[]>([]);
  const [overallStats, setOverallStats] = useState<OverallStats | null>(null);
  const [dateFilter, setDateFilter] = useState<DateFilter>('month');

  useEffect(() => {
    fetchStats();
  }, [dateFilter]);

  const getDateRange = () => {
    const now = new Date();
    switch (dateFilter) {
      case 'today':
        return { start: startOfDay(now), end: endOfDay(now) };
      case 'week':
        return { start: subDays(now, 7), end: now };
      case 'month':
        return { start: startOfMonth(now), end: endOfMonth(now) };
      case 'all':
      default:
        return { start: null, end: null };
    }
  };

  const fetchStats = async () => {
    setLoading(true);
    try {
      const { start, end } = getDateRange();

      // Build query for requests
      let requestsQuery = supabase
        .from('benefit_requests')
        .select('id, status, reviewed_by, reviewed_at, created_at, closed_at');

      if (start && end) {
        requestsQuery = requestsQuery
          .gte('created_at', start.toISOString())
          .lte('created_at', end.toISOString());
      }

      const { data: requests, error: requestsError } = await requestsQuery;

      if (requestsError) {
        console.error('Error fetching requests:', requestsError);
        return;
      }

      // Get unique reviewer IDs
      const reviewerIds = [...new Set(requests?.filter(r => r.reviewed_by).map(r => r.reviewed_by) || [])];

      // Fetch profiles for reviewers
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, full_name')
        .in('user_id', reviewerIds);

      const profilesMap = new Map(profiles?.map(p => [p.user_id, p.full_name]) || []);

      // Calculate stats per agent
      const agentStatsMap = new Map<string, AgentStats>();

      requests?.forEach(req => {
        if (req.reviewed_by) {
          if (!agentStatsMap.has(req.reviewed_by)) {
            agentStatsMap.set(req.reviewed_by, {
              userId: req.reviewed_by,
              userName: profilesMap.get(req.reviewed_by) || 'Desconhecido',
              totalHandled: 0,
              approved: 0,
              rejected: 0,
              inProgress: 0,
              approvalRate: 0,
              avgResponseTime: 0
            });
          }

          const stats = agentStatsMap.get(req.reviewed_by)!;
          stats.totalHandled++;

          if (req.status === 'aprovada') {
            stats.approved++;
          } else if (req.status === 'recusada') {
            stats.rejected++;
          } else if (req.status === 'em_analise') {
            stats.inProgress++;
          }

          // Calculate response time if closed
          if (req.closed_at && req.created_at) {
            const responseTime = (new Date(req.closed_at).getTime() - new Date(req.created_at).getTime()) / (1000 * 60 * 60);
            stats.avgResponseTime = (stats.avgResponseTime * (stats.totalHandled - 1) + responseTime) / stats.totalHandled;
          }
        }
      });

      // Calculate approval rates
      agentStatsMap.forEach(stats => {
        const total = stats.approved + stats.rejected;
        stats.approvalRate = total > 0 ? (stats.approved / total) * 100 : 0;
      });

      // Sort by total handled
      const sortedStats = Array.from(agentStatsMap.values()).sort((a, b) => b.totalHandled - a.totalHandled);
      setAgentStats(sortedStats);

      // Calculate overall stats
      const totalHandled = requests?.filter(r => r.status === 'aprovada' || r.status === 'recusada').length || 0;
      const totalPending = requests?.filter(r => r.status === 'aberta' || r.status === 'em_analise').length || 0;
      const totalApproved = requests?.filter(r => r.status === 'aprovada').length || 0;
      const totalRejected = requests?.filter(r => r.status === 'recusada').length || 0;

      setOverallStats({
        totalRequests: requests?.length || 0,
        totalHandled,
        totalPending,
        totalApproved,
        totalRejected,
        overallApprovalRate: totalHandled > 0 ? (totalApproved / totalHandled) * 100 : 0
      });

    } catch (err) {
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const getApprovalColor = (rate: number) => {
    if (rate >= 80) return 'text-green-500';
    if (rate >= 60) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getApprovalBadge = (rate: number) => {
    if (rate >= 80) return { text: 'Excelente', variant: 'default' as const, className: 'bg-green-500/20 text-green-600 dark:text-green-400 border-green-500/30' };
    if (rate >= 60) return { text: 'Bom', variant: 'secondary' as const, className: 'bg-yellow-500/20 text-yellow-600 dark:text-yellow-400 border-yellow-500/30' };
    return { text: 'Atenção', variant: 'destructive' as const, className: 'bg-red-500/20 text-red-600 dark:text-red-400 border-red-500/30' };
  };

  const dateFilterLabels: Record<DateFilter, string> = {
    today: 'Hoje',
    week: 'Últimos 7 dias',
    month: 'Este mês',
    all: 'Todo período'
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-foreground flex items-center gap-2">
              <BarChart3 className="h-7 w-7 text-primary" />
              Dashboard de Agentes
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Estatísticas de atendimento por agente
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Select value={dateFilter} onValueChange={(v) => setDateFilter(v as DateFilter)}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="today">Hoje</SelectItem>
                <SelectItem value="week">Últimos 7 dias</SelectItem>
                <SelectItem value="month">Este mês</SelectItem>
                <SelectItem value="all">Todo período</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm" onClick={fetchStats} disabled={loading}>
              <RefreshCw className={cn("h-4 w-4 mr-2", loading && "animate-spin")} />
              Atualizar
            </Button>
          </div>
        </div>

        {/* Overall Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {loading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="border-2 border-primary/10">
                <CardContent className="p-4">
                  <Skeleton className="h-4 w-20 mb-2" />
                  <Skeleton className="h-8 w-16" />
                </CardContent>
              </Card>
            ))
          ) : (
            <>
              <Card className="border-2 border-primary/10 bg-gradient-to-br from-primary/5 to-transparent">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 text-muted-foreground mb-1">
                    <FileText className="h-4 w-4" />
                    <span className="text-xs font-medium">Total</span>
                  </div>
                  <p className="text-2xl font-bold text-foreground">{overallStats?.totalRequests || 0}</p>
                </CardContent>
              </Card>

              <Card className="border-2 border-blue-500/20">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 text-blue-500 mb-1">
                    <Clock className="h-4 w-4" />
                    <span className="text-xs font-medium">Pendentes</span>
                  </div>
                  <p className="text-2xl font-bold text-blue-500">{overallStats?.totalPending || 0}</p>
                </CardContent>
              </Card>

              <Card className="border-2 border-purple-500/20">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 text-purple-500 mb-1">
                    <Zap className="h-4 w-4" />
                    <span className="text-xs font-medium">Finalizados</span>
                  </div>
                  <p className="text-2xl font-bold text-purple-500">{overallStats?.totalHandled || 0}</p>
                </CardContent>
              </Card>

              <Card className="border-2 border-green-500/20">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 text-green-500 mb-1">
                    <CheckCircle className="h-4 w-4" />
                    <span className="text-xs font-medium">Aprovados</span>
                  </div>
                  <p className="text-2xl font-bold text-green-500">{overallStats?.totalApproved || 0}</p>
                </CardContent>
              </Card>

              <Card className="border-2 border-red-500/20">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 text-red-500 mb-1">
                    <XCircle className="h-4 w-4" />
                    <span className="text-xs font-medium">Recusados</span>
                  </div>
                  <p className="text-2xl font-bold text-red-500">{overallStats?.totalRejected || 0}</p>
                </CardContent>
              </Card>

              <Card className="border-2 border-primary/20">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 text-primary mb-1">
                    <Target className="h-4 w-4" />
                    <span className="text-xs font-medium">Taxa Aprovação</span>
                  </div>
                  <p className="text-2xl font-bold text-primary">{overallStats?.overallApprovalRate.toFixed(0) || 0}%</p>
                </CardContent>
              </Card>
            </>
          )}
        </div>

        {/* Top Agents Cards */}
        {!loading && agentStats.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {agentStats.slice(0, 3).map((agent, index) => (
              <Card 
                key={agent.userId} 
                className={cn(
                  "border-2 relative overflow-hidden",
                  index === 0 && "border-yellow-500/50 bg-gradient-to-br from-yellow-500/10 to-transparent",
                  index === 1 && "border-gray-400/50 bg-gradient-to-br from-gray-400/10 to-transparent",
                  index === 2 && "border-orange-600/50 bg-gradient-to-br from-orange-600/10 to-transparent"
                )}
              >
                {index < 3 && (
                  <div className={cn(
                    "absolute top-2 right-2 rounded-full p-1.5",
                    index === 0 && "bg-yellow-500/20 text-yellow-500",
                    index === 1 && "bg-gray-400/20 text-gray-400",
                    index === 2 && "bg-orange-600/20 text-orange-600"
                  )}>
                    <Award className="h-5 w-5" />
                  </div>
                )}
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/20 text-primary text-sm font-semibold">
                      {agent.userName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <span className="block">{agent.userName}</span>
                      <span className="text-xs font-normal text-muted-foreground">
                        #{index + 1} em atendimentos
                      </span>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div>
                      <p className="text-2xl font-bold text-foreground">{agent.totalHandled}</p>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Total</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-green-500">{agent.approved}</p>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Aprovados</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-red-500">{agent.rejected}</p>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Recusados</p>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Taxa de aprovação</span>
                      <span className={cn("font-semibold", getApprovalColor(agent.approvalRate))}>
                        {agent.approvalRate.toFixed(0)}%
                      </span>
                    </div>
                    <Progress 
                      value={agent.approvalRate} 
                      className="h-2"
                    />
                  </div>
                  {agent.inProgress > 0 && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      <span>{agent.inProgress} em andamento</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Agents Table */}
        <Card className="border-2 border-primary/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              Todos os Agentes
            </CardTitle>
            <CardDescription>
              Estatísticas detalhadas de cada agente - {dateFilterLabels[dateFilter]}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="font-semibold">#</TableHead>
                    <TableHead className="font-semibold">
                      <User className="h-3.5 w-3.5 inline mr-1" />
                      Agente
                    </TableHead>
                    <TableHead className="text-center font-semibold">
                      <FileText className="h-3.5 w-3.5 inline mr-1" />
                      Total
                    </TableHead>
                    <TableHead className="text-center font-semibold">
                      <CheckCircle className="h-3.5 w-3.5 inline mr-1" />
                      Aprovados
                    </TableHead>
                    <TableHead className="text-center font-semibold">
                      <XCircle className="h-3.5 w-3.5 inline mr-1" />
                      Recusados
                    </TableHead>
                    <TableHead className="text-center font-semibold">
                      <Clock className="h-3.5 w-3.5 inline mr-1" />
                      Em Andamento
                    </TableHead>
                    <TableHead className="text-center font-semibold">
                      <TrendingUp className="h-3.5 w-3.5 inline mr-1" />
                      Taxa Aprovação
                    </TableHead>
                    <TableHead className="text-center font-semibold">Performance</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <TableRow key={i}>
                        <TableCell><Skeleton className="h-4 w-6" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-12 mx-auto" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-12 mx-auto" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-12 mx-auto" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-12 mx-auto" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-16 mx-auto" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-20 mx-auto" /></TableCell>
                      </TableRow>
                    ))
                  ) : agentStats.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                        😕 Nenhum atendimento encontrado para o período selecionado
                      </TableCell>
                    </TableRow>
                  ) : (
                    agentStats.map((agent, index) => {
                      const badge = getApprovalBadge(agent.approvalRate);
                      return (
                        <TableRow 
                          key={agent.userId}
                          className={cn(
                            "hover:bg-primary/5 transition-colors",
                            index % 2 === 0 ? "bg-muted/20" : ""
                          )}
                        >
                          <TableCell className="font-bold text-muted-foreground">
                            {index + 1}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/20 text-primary text-xs font-semibold">
                                {agent.userName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                              </div>
                              <span className="font-medium">{agent.userName}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-center font-bold">{agent.totalHandled}</TableCell>
                          <TableCell className="text-center text-green-500 font-semibold">{agent.approved}</TableCell>
                          <TableCell className="text-center text-red-500 font-semibold">{agent.rejected}</TableCell>
                          <TableCell className="text-center">
                            {agent.inProgress > 0 ? (
                              <span className="text-blue-500 font-semibold">{agent.inProgress}</span>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </TableCell>
                          <TableCell className="text-center">
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <span className={cn("font-bold cursor-help", getApprovalColor(agent.approvalRate))}>
                                    {agent.approvalRate.toFixed(0)}%
                                  </span>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>{agent.approved} aprovados de {agent.approved + agent.rejected} finalizados</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge variant={badge.variant} className={badge.className}>
                              {badge.text}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
