import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { StatCard } from '@/components/dashboard/StatCard';
import { format, startOfMonth, endOfMonth, subMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { FileText, Clock, CheckCircle, XCircle, FolderOpen, TrendingUp, Eye } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { BenefitType, benefitTypeLabels, benefitTypeEmojis, statusLabels } from '@/types/benefits';
import { benefitTypes } from '@/data/mockData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/ui/status-badge';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell } from 'recharts';

const filteredBenefitTypes = benefitTypes.filter(t => t !== 'outros') as BenefitType[];

interface DashboardStats {
  total: number;
  today: number;
  abertos: number;
  emAnalise: number;
  aprovados: number;
  reprovados: number;
}

interface RequestData {
  id: string;
  protocol: string;
  status: string;
  benefit_type: string;
  user_id: string;
  created_at: string;
}

interface RecentRequest extends RequestData {
  profile?: {
    full_name: string;
    unit?: { name: string } | null;
  } | null;
}

const COLORS = [
  'hsl(217, 91%, 60%)',   // Autoescola - blue
  'hsl(160, 84%, 39%)',   // Farmácia - green
  'hsl(25, 95%, 53%)',    // Oficina - orange
  'hsl(38, 92%, 50%)',    // Vale Gás - amber
  'hsl(280, 65%, 60%)',   // Papelaria - purple
  'hsl(187, 85%, 43%)',   // Ótica - cyan
];

export default function Dashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats>({ total: 0, today: 0, abertos: 0, emAnalise: 0, aprovados: 0, reprovados: 0 });
  const [benefitTypeData, setBenefitTypeData] = useState<{ type: BenefitType; count: number }[]>([]);
  const [allRequests, setAllRequests] = useState<RequestData[]>([]);
  const [recentRequests, setRecentRequests] = useState<RecentRequest[]>([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const { data, error } = await supabase
        .from('benefit_requests')
        .select('id, protocol, status, benefit_type, user_id, created_at')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching dashboard data:', error);
        return;
      }

      const filteredData = data || [];
      setAllRequests(filteredData);

      const total = filteredData.length;
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      const today = filteredData.filter(r => new Date(r.created_at) >= todayStart).length;

      const abertos = filteredData.filter(r => r.status === 'aberta').length;
      const emAnalise = filteredData.filter(r => r.status === 'em_analise').length;
      const aprovados = filteredData.filter(r => r.status === 'aprovada').length;
      const reprovados = filteredData.filter(r => r.status === 'recusada').length;

      setStats({ total, today, abertos, emAnalise, aprovados, reprovados });

      const typeData = filteredBenefitTypes.map(type => ({
        type,
        count: filteredData.filter(r => r.benefit_type === type).length,
      }));
      setBenefitTypeData(typeData);

      // Fetch recent requests with profiles
      const recentData = filteredData.slice(0, 8);
      const userIds = [...new Set(recentData.map(r => r.user_id))];
      
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('user_id, full_name, unit:units(name)')
        .in('user_id', userIds);

      const profilesMap = new Map(profilesData?.map(p => [p.user_id, p]) || []);
      
      const recentWithProfiles = recentData.map(req => ({
        ...req,
        profile: profilesMap.get(req.user_id) || null
      }));
      
      setRecentRequests(recentWithProfiles);
    } catch (err) {
      console.error('Error in fetchDashboardData:', err);
    }
  };

  const monthlyData = useMemo(() => {
    const end = new Date();
    const start = subMonths(end, 5);

    const months: { month: string; solicitacoes: number; aprovadas: number; recusadas: number }[] = [];
    const currentDate = startOfMonth(start);
    const endMonth = startOfMonth(end);

    while (currentDate <= endMonth) {
      const monthStart = startOfMonth(currentDate);
      const monthEnd = endOfMonth(currentDate);

      const monthRequests = allRequests.filter((req) => {
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
  }, [allRequests]);

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

  return (
    <MainLayout>
      <div className="space-y-4 sm:space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground">
            📊 Dashboard
            <span className="hidden sm:inline"> - Revalle Gestão do DP</span>
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
            <span className="hidden sm:inline">Acompanhamento em tempo real das solicitações e análises do DP</span>
            <span className="sm:hidden">Visão geral das solicitações</span>
          </p>
        </div>

        {/* Stats Grid - 6 KPI Cards */}
        <div className="grid grid-cols-2 gap-2 sm:gap-3 md:gap-4 sm:grid-cols-3 lg:grid-cols-6">
          <StatCard
            title="📋 Total"
            value={stats.total}
            icon={FileText}
            onClick={() => navigate('/solicitacoes')}
          />
          <StatCard
            title="🆕 Hoje"
            value={stats.today}
            icon={TrendingUp}
            onClick={() => navigate('/solicitacoes')}
          />
          <StatCard
            title="📂 Aberto"
            value={stats.abertos}
            icon={FolderOpen}
            variant="info"
            onClick={() => navigate('/solicitacoes?status=aberta')}
          />
          <StatCard
            title="🔍 Análise"
            value={stats.emAnalise}
            icon={Clock}
            variant="warning"
            onClick={() => navigate('/solicitacoes?status=em_analise')}
          />
          <StatCard
            title="✅ Aprovadas"
            value={stats.aprovados}
            icon={CheckCircle}
            variant="success"
            onClick={() => navigate('/solicitacoes?status=aprovada')}
          />
          <StatCard
            title="❌ Reprovadas"
            value={stats.reprovados}
            icon={XCircle}
            variant="destructive"
            onClick={() => navigate('/solicitacoes?status=recusada')}
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