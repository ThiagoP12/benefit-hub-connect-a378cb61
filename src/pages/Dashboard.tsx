import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { StatCard } from '@/components/dashboard/StatCard';
import { DashboardSkeleton } from '@/components/dashboard/DashboardSkeleton';
import { BenefitTypeCards } from '@/components/dashboard/BenefitTypeCards';
import { format, startOfMonth, endOfMonth, subMonths, differenceInHours, isWithinInterval, startOfDay, endOfDay, subDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { FileText, Clock, CheckCircle, FolderOpen, TrendingUp, Eye, Download, FileSpreadsheet, Calendar, Timer, LayoutDashboard, Building2, XCircle, AlertTriangle, Hash, User, Package, CircleDot, Settings, RefreshCw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { BenefitType, benefitTypeLabels, benefitTypeEmojis, statusLabels } from '@/types/benefits';
import { BenefitIcon } from '@/components/ui/benefit-icon';
import { benefitTypes } from '@/data/mockData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/ui/status-badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell } from 'recharts';
import { exportToCSV, exportToExcel, formatDateTimeForExport } from '@/lib/exportUtils';
import { toast } from 'sonner';

const filteredBenefitTypes = benefitTypes.filter(t => t !== 'outros') as BenefitType[];

interface DashboardStats {
  total: number;
  today: number;
  abertos: number;
  emAnalise: number;
  aprovados: number;
  reprovados: number;
  approvalRate: number;
  avgResponseTime: number;
}

interface RequestData {
  id: string;
  protocol: string;
  status: string;
  benefit_type: string;
  user_id: string;
  created_at: string;
  reviewed_at?: string | null;
  closed_at?: string | null;
}

interface RecentRequest extends RequestData {
  profile?: {
    full_name: string;
    unit?: { name: string } | null;
  } | null;
}

interface SlaConfig {
  benefit_type: string;
  green_hours: number;
  yellow_hours: number;
}

interface AlertRequest extends RequestData {
  profile?: {
    full_name: string;
    unit?: { name: string } | null;
  } | null;
  hoursOpen: number;
  slaStatus: 'yellow' | 'red';
}

type DateFilter = 'all' | '7days' | '30days' | '90days' | 'custom';

// Colors matching benefit types (aligned with database enums)
const BENEFIT_COLORS: Record<string, string> = {
  alteracao_ferias: '#3B82F6',     // Blue
  aviso_folga_falta: '#F59E0B',    // Amber
  atestado: '#10B981',             // Emerald
  contracheque: '#8B5CF6',         // Violet
  abono_horas: '#06B6D4',          // Cyan
  alteracao_horario: '#F97316',    // Orange
  operacao_domingo: '#EF4444',     // Red
  relatorio_ponto: '#6366F1',      // Indigo
  outros: '#6B7280',               // Gray
};


export default function Dashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({ 
    total: 0, today: 0, abertos: 0, emAnalise: 0, aprovados: 0, reprovados: 0,
    approvalRate: 0, avgResponseTime: 0
  });
  const [benefitTypeData, setBenefitTypeData] = useState<{ type: BenefitType; count: number }[]>([]);
  const [allRequests, setAllRequests] = useState<RequestData[]>([]);
  const [recentRequests, setRecentRequests] = useState<RecentRequest[]>([]);
  const [alertRequests, setAlertRequests] = useState<AlertRequest[]>([]);
  const [slaConfigs, setSlaConfigs] = useState<SlaConfig[]>([]);
  const [allRequestsForExport, setAllRequestsForExport] = useState<any[]>([]);
  const [units, setUnits] = useState<{ id: string; name: string }[]>([]);
  const [unitFilter, setUnitFilter] = useState<string>('all');
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  
  // Date filter state
  const [dateFilter, setDateFilter] = useState<DateFilter>('all');
  const [customDateRange, setCustomDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({
    from: undefined,
    to: undefined,
  });

  useEffect(() => {
    fetchUnits();
    fetchSlaConfigs();
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [dateFilter, customDateRange, unitFilter, slaConfigs]);

  const fetchSlaConfigs = async () => {
    try {
      const { data, error } = await supabase
        .from('sla_configs')
        .select('benefit_type, green_hours, yellow_hours');
      
      if (error) throw error;
      setSlaConfigs(data || []);
    } catch (err) {
      console.error('Error fetching SLA configs:', err);
      setSlaConfigs([{ benefit_type: 'default', green_hours: 2, yellow_hours: 6 }]);
    }
  };

  const fetchUnits = async () => {
    const { data } = await supabase.from('units').select('id, name').order('name');
    setUnits(data || []);
  };

  const getDateRange = (): { start: Date | null; end: Date | null } => {
    const now = new Date();
    switch (dateFilter) {
      case '7days':
        return { start: subDays(now, 7), end: now };
      case '30days':
        return { start: subDays(now, 30), end: now };
      case '90days':
        return { start: subDays(now, 90), end: now };
      case 'custom':
        return { 
          start: customDateRange.from ? startOfDay(customDateRange.from) : null, 
          end: customDateRange.to ? endOfDay(customDateRange.to) : null 
        };
      default:
        return { start: null, end: null };
    }
  };

  const filterByDate = (data: RequestData[]): RequestData[] => {
    const { start, end } = getDateRange();
    if (!start || !end) return data;
    
    return data.filter(req => {
      const reqDate = new Date(req.created_at);
      return isWithinInterval(reqDate, { start, end });
    });
  };

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('benefit_requests')
        .select('id, protocol, status, benefit_type, user_id, created_at, reviewed_at, closed_at')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching dashboard data:', error);
        return;
      }

      const rawData = data || [];
      setAllRequests(rawData);
      
      const allUserIds = [...new Set(rawData.map(r => r.user_id))];
      
      const { data: allProfilesData } = await supabase
        .from('profiles')
        .select('user_id, full_name, unit_id, unit:units(name)')
        .in('user_id', allUserIds);

      const profilesMap = new Map(allProfilesData?.map(p => [p.user_id, p]) || []);
      
      let filteredData = filterByDate(rawData);
      
      if (unitFilter !== 'all') {
        filteredData = filteredData.filter(req => {
          const profile = profilesMap.get(req.user_id);
          return profile?.unit_id === unitFilter;
        });
      }

      const total = filteredData.length;
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      const today = filteredData.filter(r => new Date(r.created_at) >= todayStart).length;

      const abertos = filteredData.filter(r => r.status === 'aberta').length;
      const emAnalise = filteredData.filter(r => r.status === 'em_analise').length;
      const aprovados = filteredData.filter(r => r.status === 'aprovada').length;
      const reprovados = filteredData.filter(r => r.status === 'recusada').length;

      const closedRequests = aprovados + reprovados;
      const approvalRate = closedRequests > 0 ? Math.round((aprovados / closedRequests) * 100) : 0;

      const requestsWithResponse = filteredData.filter(r => r.reviewed_at || r.closed_at);
      let avgResponseTime = 0;
      if (requestsWithResponse.length > 0) {
        const totalHours = requestsWithResponse.reduce((sum, req) => {
          const created = new Date(req.created_at);
          const responded = new Date(req.reviewed_at || req.closed_at || req.created_at);
          return sum + differenceInHours(responded, created);
        }, 0);
        avgResponseTime = Math.round((totalHours / requestsWithResponse.length) * 10) / 10;
      }

      setStats({ total, today, abertos, emAnalise, aprovados, reprovados, approvalRate, avgResponseTime });

      const typeData = filteredBenefitTypes.map(type => ({
        type,
        count: filteredData.filter(r => r.benefit_type === type).length,
      }));
      setBenefitTypeData(typeData);

      const exportData = filteredData.map(req => {
        const profile = profilesMap.get(req.user_id);
        return {
          ...req,
          collaborator_name: profile?.full_name || 'N/A',
          unit_name: profile?.unit?.name || 'Sem Unidade'
        };
      });
      setAllRequestsForExport(exportData);

      const recentData = filteredData.slice(0, 8);
      const recentWithProfiles = recentData.map(req => ({
        ...req,
        profile: profilesMap.get(req.user_id) || null
      }));
      
      setRecentRequests(recentWithProfiles);

      const getSlaForBenefitType = (benefitType: string) => {
        const config = slaConfigs.find(c => c.benefit_type === benefitType);
        return config || { green_hours: 2, yellow_hours: 6 };
      };

      const openRequests = filteredData.filter(r => r.status === 'aberta' || r.status === 'em_analise');
      const now = new Date();
      
      const alertReqs = openRequests
        .map(req => {
          const sla = getSlaForBenefitType(req.benefit_type);
          const hoursOpen = differenceInHours(now, new Date(req.created_at));
          let slaStatus: 'yellow' | 'red' = 'yellow';
          
          if (hoursOpen > sla.yellow_hours) {
            slaStatus = 'red';
          }
          
          const isAlert = hoursOpen > sla.green_hours;
          
          return {
            ...req,
            profile: profilesMap.get(req.user_id) || null,
            hoursOpen,
            slaStatus,
            isAlert
          };
        })
        .filter(req => req.isAlert)
        .sort((a, b) => b.hoursOpen - a.hoursOpen)
        .slice(0, 10) as AlertRequest[];
      
      setAlertRequests(alertReqs);
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Error in fetchDashboardData:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    fetchDashboardData();
    toast.success('Dados atualizados!');
  };

  const getExportColumns = () => [
    { header: 'Protocolo', accessor: 'protocol' as const },
    { header: 'Colaborador', accessor: 'collaborator_name' as const },
    { header: 'Unidade', accessor: 'unit_name' as const },
    { header: 'Tipo de Benefício', accessor: (item: any) => benefitTypeLabels[item.benefit_type as BenefitType] || item.benefit_type },
    { header: 'Status', accessor: (item: any) => statusLabels[item.status as keyof typeof statusLabels] || item.status },
    { header: 'Data de Criação', accessor: (item: any) => formatDateTimeForExport(item.created_at) },
  ];

  const handleExportCSV = () => {
    if (allRequestsForExport.length === 0) {
      toast.error('Não há dados para exportar');
      return;
    }
    exportToCSV(allRequestsForExport, getExportColumns(), `solicitacoes_${format(new Date(), 'yyyy-MM-dd')}`);
    toast.success('Arquivo CSV exportado com sucesso!');
  };

  const handleExportExcel = () => {
    if (allRequestsForExport.length === 0) {
      toast.error('Não há dados para exportar');
      return;
    }
    exportToExcel(allRequestsForExport, getExportColumns(), `solicitacoes_${format(new Date(), 'yyyy-MM-dd')}`, 'Solicitações');
    toast.success('Arquivo Excel exportado com sucesso!');
  };

  const monthlyData = useMemo(() => {
    const end = new Date();
    const start = subMonths(end, 5);
    const filteredData = filterByDate(allRequests);

    const months: { month: string; solicitacoes: number; aprovadas: number; recusadas: number }[] = [];
    const currentDate = startOfMonth(start);
    const endMonth = startOfMonth(end);

    while (currentDate <= endMonth) {
      const monthStart = startOfMonth(currentDate);
      const monthEnd = endOfMonth(currentDate);

      const monthRequests = filteredData.filter((req) => {
        const reqDate = new Date(req.created_at);
        return reqDate >= monthStart && reqDate <= monthEnd;
      });

      months.push({
        month: format(currentDate, 'MMM', { locale: ptBR }),
        solicitacoes: monthRequests.length,
        aprovadas: monthRequests.filter((r) => r.status === 'aprovada').length,
        recusadas: monthRequests.filter((r) => r.status === 'recusada').length,
      });

      currentDate.setMonth(currentDate.getMonth() + 1);
    }

    return months;
  }, [allRequests, dateFilter, customDateRange]);

  const pieData = benefitTypeData
    .filter(item => item.count > 0)
    .map((item) => ({
      name: `${benefitTypeEmojis[item.type]} ${benefitTypeLabels[item.type]}`,
      value: item.count,
      color: BENEFIT_COLORS[item.type] || BENEFIT_COLORS.outros,
      type: item.type,
    }));

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card border-2 border-border rounded-xl p-4 shadow-xl backdrop-blur-sm">
          <p className="font-bold text-foreground mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm flex items-center gap-2" style={{ color: entry.color }}>
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
              {entry.name}: <span className="font-bold">{entry.value}</span>
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <MainLayout>
        <DashboardSkeleton />
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 animate-fade-in">
          <div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground flex items-center gap-2">
              <LayoutDashboard className="h-6 w-6 sm:h-7 sm:w-7 text-primary" />
              Dashboard
              <span className="hidden sm:inline"> - Revalle Gestão do DP</span>
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
              <span className="hidden sm:inline">Acompanhamento em tempo real das solicitações e análises do DP</span>
              <span className="sm:hidden">Visão geral das solicitações</span>
            </p>
          </div>
          
          <div className="flex flex-wrap items-center gap-2">
            {/* Date Filter */}
            <Select value={dateFilter} onValueChange={(v) => setDateFilter(v as DateFilter)}>
              <SelectTrigger className="w-[160px]">
                <Calendar className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Período" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todo período</SelectItem>
                <SelectItem value="7days">Últimos 7 dias</SelectItem>
                <SelectItem value="30days">Últimos 30 dias</SelectItem>
                <SelectItem value="90days">Últimos 90 dias</SelectItem>
                <SelectItem value="custom">Personalizado</SelectItem>
              </SelectContent>
            </Select>

            {/* Unit Filter */}
            <Select value={unitFilter} onValueChange={setUnitFilter}>
              <SelectTrigger className="w-[160px]">
                <Building2 className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Unidade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas unidades</SelectItem>
                {units.map((unit) => (
                  <SelectItem key={unit.id} value={unit.id}>
                    {unit.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {dateFilter === 'custom' && (
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm">
                    {customDateRange.from && customDateRange.to 
                      ? `${format(customDateRange.from, 'dd/MM')} - ${format(customDateRange.to, 'dd/MM')}`
                      : 'Selecionar datas'
                    }
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="end">
                  <CalendarComponent
                    mode="range"
                    selected={{ from: customDateRange.from, to: customDateRange.to }}
                    onSelect={(range) => setCustomDateRange({ from: range?.from, to: range?.to })}
                    numberOfMonths={2}
                    locale={ptBR}
                  />
                </PopoverContent>
              </Popover>
            )}

            {/* Refresh Button */}
            <Button variant="outline" size="icon" onClick={handleRefresh} className="shrink-0">
              <RefreshCw className="h-4 w-4" />
            </Button>

            {/* Export Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <Download className="h-4 w-4" />
                  <span className="hidden sm:inline">Exportar</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleExportCSV}>
                  <FileText className="h-4 w-4 mr-2" />
                  Exportar CSV
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleExportExcel}>
                  <FileSpreadsheet className="h-4 w-4 mr-2" />
                  Exportar Excel
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>


        {/* Stats Grid - 7 KPI Cards with staggered animation */}
        <div className="grid grid-cols-2 gap-2 sm:gap-3 md:gap-4 sm:grid-cols-4 lg:grid-cols-7">
          <StatCard
            title="Total"
            value={stats.total}
            icon={FileText}
            onClick={() => navigate('/solicitacoes')}
            animationDelay={0.05}
          />
          <StatCard
            title="Hoje"
            value={stats.today}
            icon={TrendingUp}
            onClick={() => navigate('/solicitacoes')}
            animationDelay={0.1}
          />
          <StatCard
            title="Aberto"
            value={stats.abertos}
            icon={FolderOpen}
            variant="info"
            onClick={() => navigate('/solicitacoes?status=aberta')}
            animationDelay={0.15}
          />
          <StatCard
            title="Análise"
            value={stats.emAnalise}
            icon={Clock}
            variant="warning"
            onClick={() => navigate('/solicitacoes?status=em_analise')}
            animationDelay={0.2}
          />
          <StatCard
            title="Aprovadas"
            value={stats.aprovados}
            icon={CheckCircle}
            variant="success"
            onClick={() => navigate('/solicitacoes?status=aprovada')}
            animationDelay={0.25}
          />
          <StatCard
            title="Reprovadas"
            value={stats.reprovados}
            icon={XCircle}
            variant="destructive"
            onClick={() => navigate('/solicitacoes?status=recusada')}
            animationDelay={0.3}
          />
          <StatCard
            title="Tempo Méd."
            value={`${stats.avgResponseTime}h`}
            icon={Timer}
            variant="info"
            animationDelay={0.35}
          />
        </div>

        {/* Benefit Type Cards */}
        <BenefitTypeCards data={benefitTypeData} total={stats.total} />

        {/* Charts Grid */}
        <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-2">
          <Card className="border-2 border-primary/10 shadow-lg hover:shadow-xl transition-all duration-300 animate-fade-in" style={{ animationDelay: '0.4s' }}>
            <CardHeader className="bg-gradient-to-r from-primary/5 to-transparent">
              <CardTitle className="flex items-center gap-2">
                📈 Solicitações por Mês
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyData}>
                    <defs>
                      <linearGradient id="totalGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="hsl(267, 83%, 57%)" stopOpacity={1}/>
                        <stop offset="100%" stopColor="hsl(267, 83%, 67%)" stopOpacity={0.8}/>
                      </linearGradient>
                      <linearGradient id="approvedGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="hsl(142, 76%, 36%)" stopOpacity={1}/>
                        <stop offset="100%" stopColor="hsl(142, 76%, 46%)" stopOpacity={0.8}/>
                      </linearGradient>
                      <linearGradient id="rejectedGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="hsl(0, 84%, 60%)" stopOpacity={1}/>
                        <stop offset="100%" stopColor="hsl(0, 84%, 70%)" stopOpacity={0.8}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border/50" />
                    <XAxis dataKey="month" className="text-xs font-medium" tick={{ fill: 'hsl(var(--foreground))' }} />
                    <YAxis className="text-xs" tick={{ fill: 'hsl(var(--foreground))' }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend wrapperStyle={{ paddingTop: '10px' }} />
                    <Bar dataKey="solicitacoes" name="📊 Total" fill="url(#totalGradient)" radius={[6, 6, 0, 0]} />
                    <Bar dataKey="aprovadas" name="✅ Aprovadas" fill="url(#approvedGradient)" radius={[6, 6, 0, 0]} />
                    <Bar dataKey="recusadas" name="❌ Recusadas" fill="url(#rejectedGradient)" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-accent/10 shadow-lg hover:shadow-xl transition-all duration-300 animate-fade-in" style={{ animationDelay: '0.45s' }}>
            <CardHeader className="bg-gradient-to-r from-accent/5 to-transparent">
              <CardTitle className="flex items-center gap-2">
                🎯 Solicitações por Tipo
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[320px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <defs>
                      {pieData.map((entry, index) => (
                        <linearGradient key={`pieGradient-${index}`} id={`pieGradient-${entry.type}`} x1="0" y1="0" x2="1" y2="1">
                          <stop offset="0%" stopColor={entry.color} stopOpacity={1}/>
                          <stop offset="100%" stopColor={entry.color} stopOpacity={0.75}/>
                        </linearGradient>
                      ))}
                    </defs>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      labelLine={{ stroke: 'hsl(var(--muted-foreground))', strokeWidth: 1 }}
                      outerRadius={90}
                      innerRadius={50}
                      paddingAngle={2}
                      dataKey="value"
                      label={({ name, percent, cx, cy, midAngle, outerRadius }) => {
                        const RADIAN = Math.PI / 180;
                        const radius = outerRadius * 1.35;
                        const x = cx + radius * Math.cos(-midAngle * RADIAN);
                        const y = cy + radius * Math.sin(-midAngle * RADIAN);
                        const percentage = (percent * 100).toFixed(0);
                        return (
                          <text
                            x={x}
                            y={y}
                            fill="hsl(var(--foreground))"
                            textAnchor={x > cx ? 'start' : 'end'}
                            dominantBaseline="central"
                            className="text-xs font-medium"
                          >
                            {`${name} ${percentage}%`}
                          </text>
                        );
                      }}
                      stroke="hsl(var(--background))"
                      strokeWidth={3}
                    >
                      {pieData.map((entry) => (
                        <Cell 
                          key={`cell-${entry.type}`} 
                          fill={`url(#pieGradient-${entry.type})`}
                          className="hover:opacity-90 transition-opacity cursor-pointer drop-shadow-md"
                        />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value: number) => [`${value} solicitações`, 'Quantidade']}
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))', 
                        border: '2px solid hsl(var(--border))',
                        borderRadius: '12px',
                        boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
                        padding: '12px 16px'
                      }}
                      labelStyle={{ fontWeight: 'bold', marginBottom: '4px' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Alert Board */}
          <Card className="border-2 border-warning/30 shadow-lg hover:shadow-xl transition-all duration-300 animate-fade-in" style={{ animationDelay: '0.5s' }}>
            <CardHeader className="bg-gradient-to-r from-warning/10 to-transparent">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-warning animate-pulse" />
                  Quadro de Avisos
                </CardTitle>
                <span className="text-xs text-muted-foreground bg-warning/10 px-2 py-1 rounded-full">
                  {alertRequests.length} em alerta
                </span>
              </div>
            </CardHeader>
            <CardContent>
              {alertRequests.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                  <div className="p-4 rounded-full bg-success/10 mb-3">
                    <CheckCircle className="h-12 w-12 text-success" />
                  </div>
                  <p className="font-medium text-foreground">Nenhum protocolo em atraso</p>
                  <p className="text-sm">Todos os protocolos estão dentro do SLA</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-[280px] overflow-y-auto">
                  {alertRequests.map((req, index) => (
                    <div 
                      key={req.id}
                      className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer hover:scale-[1.01] transition-all duration-200 animate-fade-in ${
                        req.slaStatus === 'red' 
                          ? 'border-destructive/50 bg-destructive/5' 
                          : 'border-warning/50 bg-warning/5'
                      }`}
                      style={{ animationDelay: `${index * 0.05 + 0.5}s` }}
                      onClick={() => navigate(`/solicitacoes?protocol=${req.protocol}`)}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-2.5 rounded-xl ${
                          req.slaStatus === 'red' ? 'bg-destructive/20' : 'bg-warning/20'
                        }`}>
                          {req.slaStatus === 'red' ? (
                            <XCircle className="h-5 w-5 text-destructive animate-pulse" />
                          ) : (
                            <AlertTriangle className="h-5 w-5 text-warning" />
                          )}
                        </div>
                        <div>
                          <p className="font-mono font-bold text-sm">{req.protocol}</p>
                          <p className="text-xs text-muted-foreground">{req.profile?.full_name || 'N/A'}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-bold text-lg ${
                          req.slaStatus === 'red' ? 'text-destructive' : 'text-warning'
                        }`}>
                          {req.hoursOpen}h
                        </p>
                        <p className={`text-[10px] font-medium uppercase tracking-wide ${
                          req.slaStatus === 'red' ? 'text-destructive' : 'text-warning'
                        }`}>
                          {req.slaStatus === 'red' ? 'Vencido' : 'Atenção'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Recent Requests */}
        <Card className="border-2 border-info/10 shadow-lg animate-fade-in" style={{ animationDelay: '0.55s' }}>
          <CardHeader className="bg-gradient-to-r from-info/5 to-transparent">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-info" />
                Chamados Recentes
              </CardTitle>
              <Button variant="outline" size="sm" onClick={() => navigate('/solicitacoes')} className="hover:bg-info/10">
                Ver todos
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-2 text-xs font-semibold text-muted-foreground"><Calendar className="h-3.5 w-3.5 inline mr-1" />Data</th>
                    <th className="text-left py-3 px-2 text-xs font-semibold text-muted-foreground"><Hash className="h-3.5 w-3.5 inline mr-1" />Protocolo</th>
                    <th className="text-left py-3 px-2 text-xs font-semibold text-muted-foreground"><User className="h-3.5 w-3.5 inline mr-1" />Colaborador</th>
                    <th className="text-left py-3 px-2 text-xs font-semibold text-muted-foreground hidden md:table-cell"><Building2 className="h-3.5 w-3.5 inline mr-1" />Unidade</th>
                    <th className="text-left py-3 px-2 text-xs font-semibold text-muted-foreground"><Package className="h-3.5 w-3.5 inline mr-1" />Tipo</th>
                    <th className="text-left py-3 px-2 text-xs font-semibold text-muted-foreground"><CircleDot className="h-3.5 w-3.5 inline mr-1" />Status</th>
                    <th className="text-right py-3 px-2 text-xs font-semibold text-muted-foreground"><Settings className="h-3.5 w-3.5 inline mr-1" />Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {recentRequests.map((request, index) => (
                    <tr 
                      key={request.id} 
                      className="border-b border-border/50 hover:bg-muted/50 transition-all duration-200 animate-fade-in cursor-pointer"
                      style={{ animationDelay: `${index * 0.05 + 0.6}s` }}
                      onClick={() => navigate(`/solicitacoes?protocol=${request.protocol}`)}
                    >
                      <td className="py-3 px-2 text-sm text-muted-foreground">
                        {format(new Date(request.created_at), "dd/MM/yy", { locale: ptBR })}
                      </td>
                      <td className="py-3 px-2">
                        <span className="font-bold font-mono text-sm text-primary hover:underline">{request.protocol}</span>
                      </td>
                      <td className="py-3 px-2 text-sm">{request.profile?.full_name || 'N/A'}</td>
                      <td className="py-3 px-2 text-sm text-muted-foreground hidden md:table-cell">{request.profile?.unit?.name || '-'}</td>
                      <td className="py-3 px-2">
                        <div className="inline-flex items-center gap-2 text-sm">
                          <BenefitIcon type={request.benefit_type as BenefitType} size="lg" />
                          <span className="hidden lg:inline">{benefitTypeLabels[request.benefit_type as BenefitType]}</span>
                        </div>
                      </td>
                      <td className="py-3 px-2">
                        <StatusBadge 
                          status={request.status} 
                          label={statusLabels[request.status as keyof typeof statusLabels]} 
                        />
                      </td>
                      <td className="py-3 px-2 text-right">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 hover:bg-info/10"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/solicitacoes?protocol=${request.protocol}`);
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Footer with last update info */}
        <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground py-2 animate-fade-in" style={{ animationDelay: '0.7s' }}>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
            <span>Dados em tempo real</span>
          </div>
          <span>•</span>
          <span>Última atualização: {format(lastUpdated, "HH:mm:ss", { locale: ptBR })}</span>
        </div>
      </div>
    </MainLayout>
  );
}
