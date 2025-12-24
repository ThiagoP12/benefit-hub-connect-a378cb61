import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { StatCard } from '@/components/dashboard/StatCard';
import { format, startOfMonth, endOfMonth, subMonths, differenceInHours, parseISO, isWithinInterval, startOfDay, endOfDay, subDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { FileText, Clock, CheckCircle, XCircle, FolderOpen, TrendingUp, Eye, Download, FileSpreadsheet, Calendar, Timer, Percent, LayoutDashboard } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { BenefitType, benefitTypeLabels, benefitTypeEmojis, statusLabels } from '@/types/benefits';
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

interface UnitData {
  name: string;
  count: number;
}

type DateFilter = 'all' | '7days' | '30days' | '90days' | 'custom';

const COLORS = [
  'hsl(217, 91%, 60%)',
  'hsl(160, 84%, 39%)',
  'hsl(25, 95%, 53%)',
  'hsl(38, 92%, 50%)',
  'hsl(280, 65%, 60%)',
  'hsl(187, 85%, 43%)',
];

const UNIT_COLORS = [
  'hsl(217, 91%, 60%)',
  'hsl(142, 76%, 36%)',
  'hsl(25, 95%, 53%)',
  'hsl(280, 65%, 60%)',
  'hsl(187, 85%, 43%)',
  'hsl(38, 92%, 50%)',
  'hsl(0, 84%, 60%)',
  'hsl(160, 84%, 39%)',
];

export default function Dashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats>({ 
    total: 0, today: 0, abertos: 0, emAnalise: 0, aprovados: 0, reprovados: 0,
    approvalRate: 0, avgResponseTime: 0
  });
  const [benefitTypeData, setBenefitTypeData] = useState<{ type: BenefitType; count: number }[]>([]);
  const [allRequests, setAllRequests] = useState<RequestData[]>([]);
  const [recentRequests, setRecentRequests] = useState<RecentRequest[]>([]);
  const [unitData, setUnitData] = useState<UnitData[]>([]);
  const [allRequestsForExport, setAllRequestsForExport] = useState<any[]>([]);
  const [units, setUnits] = useState<{ id: string; name: string }[]>([]);
  const [unitFilter, setUnitFilter] = useState<string>('all');
  
  // Date filter state
  const [dateFilter, setDateFilter] = useState<DateFilter>('all');
  const [customDateRange, setCustomDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({
    from: undefined,
    to: undefined,
  });

  useEffect(() => {
    fetchUnits();
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [dateFilter, customDateRange, unitFilter]);

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
      
      // First fetch profiles to know unit_id for filtering
      const allUserIds = [...new Set(rawData.map(r => r.user_id))];
      
      const { data: allProfilesData } = await supabase
        .from('profiles')
        .select('user_id, full_name, unit_id, unit:units(name)')
        .in('user_id', allUserIds);

      const profilesMap = new Map(allProfilesData?.map(p => [p.user_id, p]) || []);
      
      // Apply date filter first
      let filteredData = filterByDate(rawData);
      
      // Apply unit filter
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

      // Calculate approval rate
      const closedRequests = aprovados + reprovados;
      const approvalRate = closedRequests > 0 ? Math.round((aprovados / closedRequests) * 100) : 0;

      // Calculate average response time (from created to reviewed/closed)
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

      // Calculate unit data for chart (using profilesMap already created above)

      // Calculate unit data for chart
      const unitCounts: Record<string, number> = {};
      filteredData.forEach(req => {
        const profile = profilesMap.get(req.user_id);
        const unitName = profile?.unit?.name || 'Sem Unidade';
        unitCounts[unitName] = (unitCounts[unitName] || 0) + 1;
      });

      const unitChartData = Object.entries(unitCounts)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 8);
      setUnitData(unitChartData);

      // Prepare data for export
      const exportData = filteredData.map(req => {
        const profile = profilesMap.get(req.user_id);
        return {
          ...req,
          collaborator_name: profile?.full_name || 'N/A',
          unit_name: profile?.unit?.name || 'Sem Unidade'
        };
      });
      setAllRequestsForExport(exportData);

      // Fetch recent requests with profiles
      const recentData = filteredData.slice(0, 8);
      const recentWithProfiles = recentData.map(req => ({
        ...req,
        profile: profilesMap.get(req.user_id) || null
      }));
      
      setRecentRequests(recentWithProfiles);
    } catch (err) {
      console.error('Error in fetchDashboardData:', err);
    }
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

  const pieData = benefitTypeData.map((item, index) => ({
    name: `${benefitTypeEmojis[item.type]} ${benefitTypeLabels[item.type]}`,
    value: item.count,
    color: COLORS[index % COLORS.length],
  }));

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
          <p className="font-semibold text-foreground mb-1">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: <span className="font-bold">{entry.value}</span>
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const getDateFilterLabel = () => {
    switch (dateFilter) {
      case '7days': return 'Últimos 7 dias';
      case '30days': return 'Últimos 30 dias';
      case '90days': return 'Últimos 90 dias';
      case 'custom': 
        if (customDateRange.from && customDateRange.to) {
          return `${format(customDateRange.from, 'dd/MM')} - ${format(customDateRange.to, 'dd/MM')}`;
        }
        return 'Período personalizado';
      default: return 'Todo período';
    }
  };

  return (
    <MainLayout>
      <div className="space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground flex items-center gap-2">
              <LayoutDashboard className="h-6 w-6 sm:h-7 sm:w-7" />
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

            {/* Export Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <Download className="h-4 w-4" />
                  Exportar
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

        {/* Stats Grid - 8 KPI Cards */}
        <div className="grid grid-cols-2 gap-2 sm:gap-3 md:gap-4 sm:grid-cols-4 lg:grid-cols-8">
          <StatCard
            title="Total"
            value={stats.total}
            icon={FileText}
            onClick={() => navigate('/solicitacoes')}
          />
          <StatCard
            title="Hoje"
            value={stats.today}
            icon={TrendingUp}
            onClick={() => navigate('/solicitacoes')}
          />
          <StatCard
            title="Aberto"
            value={stats.abertos}
            icon={FolderOpen}
            variant="info"
            onClick={() => navigate('/solicitacoes?status=aberta')}
          />
          <StatCard
            title="Análise"
            value={stats.emAnalise}
            icon={Clock}
            variant="warning"
            onClick={() => navigate('/solicitacoes?status=em_analise')}
          />
          <StatCard
            title="Aprovadas"
            value={stats.aprovados}
            icon={CheckCircle}
            variant="success"
            onClick={() => navigate('/solicitacoes?status=aprovada')}
          />
          <StatCard
            title="Reprovadas"
            value={stats.reprovados}
            icon={XCircle}
            variant="destructive"
            onClick={() => navigate('/solicitacoes?status=recusada')}
          />
          <StatCard
            title="Taxa Aprov."
            value={`${stats.approvalRate}%`}
            icon={Percent}
            variant="success"
          />
          <StatCard
            title="Tempo Méd."
            value={`${stats.avgResponseTime}h`}
            icon={Timer}
            variant="info"
          />
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-2">
          <Card className="border-2 border-primary/10 shadow-lg hover:shadow-xl transition-shadow">
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

          <Card className="border-2 border-accent/10 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="bg-gradient-to-r from-accent/5 to-transparent">
              <CardTitle className="flex items-center gap-2">
                🎯 Solicitações por Tipo
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <defs>
                      {COLORS.map((color, index) => (
                        <linearGradient key={`pieGradient-${index}`} id={`pieGradient-${index}`} x1="0" y1="0" x2="1" y2="1">
                          <stop offset="0%" stopColor={color} stopOpacity={1}/>
                          <stop offset="100%" stopColor={color} stopOpacity={0.7}/>
                        </linearGradient>
                      ))}
                    </defs>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={100}
                      innerRadius={40}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      stroke="hsl(var(--background))"
                      strokeWidth={2}
                    >
                      {pieData.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={`url(#pieGradient-${index})`}
                          className="hover:opacity-80 transition-opacity cursor-pointer"
                        />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))', 
                        border: '2px solid hsl(var(--border))',
                        borderRadius: '12px',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                      }} 
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Unit Chart */}
          <Card className="border-2 border-success/10 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="bg-gradient-to-r from-success/5 to-transparent">
              <CardTitle className="flex items-center gap-2">
                🏢 Solicitações por Unidade
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={unitData} layout="vertical">
                    <defs>
                      {UNIT_COLORS.map((color, index) => (
                        <linearGradient key={`unitGradient-${index}`} id={`unitGradient-${index}`} x1="0" y1="0" x2="1" y2="0">
                          <stop offset="0%" stopColor={color} stopOpacity={1}/>
                          <stop offset="100%" stopColor={color} stopOpacity={0.7}/>
                        </linearGradient>
                      ))}
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border/50" />
                    <XAxis type="number" tick={{ fill: 'hsl(var(--foreground))' }} />
                    <YAxis 
                      type="category" 
                      dataKey="name" 
                      width={100} 
                      tick={{ fill: 'hsl(var(--foreground))', fontSize: 12 }}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar 
                      dataKey="count" 
                      name="📊 Solicitações"
                      radius={[0, 6, 6, 0]}
                    >
                      {unitData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={`url(#unitGradient-${index % UNIT_COLORS.length})`} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Requests */}
        <Card className="border-2 border-info/10 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-info/5 to-transparent">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                🕐 Chamados Recentes
              </CardTitle>
              <Button variant="outline" size="sm" onClick={() => navigate('/solicitacoes')}>
                Ver todos
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-2 text-xs font-semibold text-muted-foreground">📅 Data</th>
                    <th className="text-left py-3 px-2 text-xs font-semibold text-muted-foreground">🔢 Protocolo</th>
                    <th className="text-left py-3 px-2 text-xs font-semibold text-muted-foreground">👤 Colaborador</th>
                    <th className="text-left py-3 px-2 text-xs font-semibold text-muted-foreground">🏢 Unidade</th>
                    <th className="text-left py-3 px-2 text-xs font-semibold text-muted-foreground">📦 Tipo</th>
                    <th className="text-left py-3 px-2 text-xs font-semibold text-muted-foreground">📊 Status</th>
                    <th className="text-right py-3 px-2 text-xs font-semibold text-muted-foreground">⚙️ Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {recentRequests.map((request, index) => (
                    <tr 
                      key={request.id} 
                      className={`border-b border-border/50 hover:bg-muted/50 transition-colors ${index % 2 === 0 ? 'bg-muted/20' : ''}`}
                    >
                      <td className="py-3 px-2 text-sm text-muted-foreground">
                        {format(new Date(request.created_at), "dd/MM/yy", { locale: ptBR })}
                      </td>
                      <td className="py-3 px-2">
                        <span className="font-bold font-mono text-sm text-primary">{request.protocol}</span>
                      </td>
                      <td className="py-3 px-2 text-sm">{request.profile?.full_name || 'N/A'}</td>
                      <td className="py-3 px-2 text-sm text-muted-foreground">{request.profile?.unit?.name || '-'}</td>
                      <td className="py-3 px-2">
                        <span className="inline-flex items-center gap-1 text-sm">
                          {benefitTypeEmojis[request.benefit_type as BenefitType]}
                          <span className="hidden md:inline">{benefitTypeLabels[request.benefit_type as BenefitType]}</span>
                        </span>
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
                          className="h-8 w-8"
                          onClick={() => navigate(`/solicitacoes?protocol=${request.protocol}`)}
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
      </div>
    </MainLayout>
  );
}
