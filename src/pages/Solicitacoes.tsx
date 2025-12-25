import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { benefitTypeLabels, statusLabels, BenefitStatus, BenefitType } from '@/types/benefits';
import { BenefitIcon } from '@/components/ui/benefit-icon';
import { StatusBadge } from '@/components/ui/status-badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { PaginationControls } from '@/components/ui/pagination-controls';
import { Calendar } from '@/components/ui/calendar';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Search, Eye, CalendarIcon, X, Filter, RefreshCw, PauseCircle, Download, FileSpreadsheet, Building2, FileText, CircleDot, Package, Hash, User, Clock, Settings } from 'lucide-react';
import { exportToExcel, formatDateForExport, ExportColumn } from '@/lib/exportUtils';
import { toast } from 'sonner';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { format, isWithinInterval, startOfDay, endOfDay, differenceInHours } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { DateRange } from 'react-day-picker';
import { BenefitDetailsSheet } from '@/components/benefits/BenefitDetailsSheet';

interface SlaConfig {
  benefit_type: string;
  green_hours: number;
  yellow_hours: number;
}

interface ApprovalCutoff {
  day: number;
}

interface Unit {
  id: string;
  name: string;
  code: string;
}

interface BenefitRequest {
  id: string;
  protocol: string;
  user_id: string;
  benefit_type: BenefitType;
  status: BenefitStatus;
  details: string | null;
  requested_value: number | null;
  approved_value: number | null;
  rejection_reason: string | null;
  closing_message: string | null;
  pdf_url: string | null;
  pdf_file_name: string | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
  account_id: number | null;
  conversation_id: number | null;
  created_at: string;
  profile?: {
    full_name: string;
    cpf: string | null;
    phone: string | null;
    unit_id: string | null;
    unit?: {
      name: string;
      code: string;
    } | null;
  } | null;
}

const ITEMS_PER_PAGE = 10;

export default function Solicitacoes() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [requests, setRequests] = useState<BenefitRequest[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>(searchParams.get('status') || 'all');
  const [typeFilter, setTypeFilter] = useState<string>(searchParams.get('benefit_type') || 'all');
  const [unitFilter, setUnitFilter] = useState<string>('all');
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [currentPage, setCurrentPage] = useState(1);

  // Sheet state
  const [sheetOpen, setSheetOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);

  // SLA state
  const [slaConfigs, setSlaConfigs] = useState<SlaConfig[]>([]);
  const [cutoffDay, setCutoffDay] = useState(25);
  const [isBlockPeriod, setIsBlockPeriod] = useState(false);

  useEffect(() => {
    fetchRequests();
    fetchUnits();
    fetchSlaConfigs();
    fetchCutoffDay();
  }, []);

  // Check block period
  useEffect(() => {
    const currentDay = new Date().getDate();
    setIsBlockPeriod(currentDay >= cutoffDay);
  }, [cutoffDay]);

  // Handle protocol param from URL (e.g., from Dashboard navigation)
  useEffect(() => {
    const protocolParam = searchParams.get('protocol');
    if (protocolParam && requests.length > 0) {
      const index = requests.findIndex(r => r.protocol === protocolParam);
      if (index !== -1) {
        setSelectedIndex(index);
        setSheetOpen(true);
        // Clear the protocol param after opening
        const newParams = new URLSearchParams(searchParams);
        newParams.delete('protocol');
        setSearchParams(newParams);
      }
    }
  }, [searchParams, requests]);

  // Sync URL params with filters
  useEffect(() => {
    const urlStatus = searchParams.get('status');
    const urlBenefitType = searchParams.get('benefit_type');
    
    if (urlStatus && urlStatus !== statusFilter) {
      setStatusFilter(urlStatus);
    }
    if (urlBenefitType && urlBenefitType !== typeFilter) {
      setTypeFilter(urlBenefitType);
    }
    
    // Clear URL params after applying
    if (urlStatus || urlBenefitType) {
      const newParams = new URLSearchParams();
      setSearchParams(newParams);
    }
  }, [searchParams]);

  const fetchSlaConfigs = async () => {
    const { data } = await supabase
      .from('sla_configs')
      .select('benefit_type, green_hours, yellow_hours');
    if (data) setSlaConfigs(data);
  };

  const fetchCutoffDay = async () => {
    const { data } = await supabase
      .from('system_config')
      .select('value')
      .eq('key', 'approval_cutoff_day')
      .maybeSingle();
    
    if (data?.value) {
      const parsed = data.value as unknown as ApprovalCutoff;
      setCutoffDay(parsed.day || 25);
    }
  };

  const fetchUnits = async () => {
    const { data } = await supabase
      .from('units')
      .select('id, name, code')
      .order('name');
    setUnits(data || []);
  };

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const { data: requestsData, error: requestsError } = await supabase
        .from('benefit_requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (requestsError) {
        console.error('Error fetching requests:', requestsError);
        return;
      }

      // Fetch profiles separately with CPF and phone
      const userIds = [...new Set(requestsData?.map(r => r.user_id) || [])];
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('user_id, full_name, cpf, phone, unit_id, unit:units(name, code)')
        .in('user_id', userIds);

      const profilesMap = new Map(profilesData?.map(p => [p.user_id, p]) || []);

      const requestsWithProfiles = (requestsData || []).map(req => ({
        ...req,
        profile: profilesMap.get(req.user_id) || null
      }));

      setRequests(requestsWithProfiles as BenefitRequest[]);
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const clearFilters = () => {
    setSearch('');
    setStatusFilter('all');
    setTypeFilter('all');
    setUnitFilter('all');
    setDateRange(undefined);
    setSearchParams({});
    setCurrentPage(1);
  };

  const hasActiveFilters = search || statusFilter !== 'all' || typeFilter !== 'all' || unitFilter !== 'all' || dateRange;

  const filteredRequests = requests.filter(request => {
    const searchLower = search.toLowerCase().replace(/[.-]/g, '');
    const cpfClean = request.profile?.cpf?.replace(/[.-]/g, '').toLowerCase() || '';
    const phoneClean = request.profile?.phone?.replace(/[()-\s]/g, '').toLowerCase() || '';
    
    const matchesSearch = 
      request.protocol.toLowerCase().includes(searchLower) ||
      request.profile?.full_name?.toLowerCase().includes(searchLower) ||
      cpfClean.includes(searchLower) ||
      phoneClean.includes(searchLower);
    
    // Handle comma-separated status values from URL
    let matchesStatus = statusFilter === 'all';
    if (!matchesStatus) {
      const statuses = statusFilter.split(',');
      matchesStatus = statuses.includes(request.status);
    }
    
    const matchesType = typeFilter === 'all' || request.benefit_type === typeFilter;
    const matchesUnit = unitFilter === 'all' || request.profile?.unit_id === unitFilter;
    
    // Date range filter
    let matchesDate = true;
    if (dateRange?.from) {
      const requestDate = new Date(request.created_at);
      const from = startOfDay(dateRange.from);
      const to = dateRange.to ? endOfDay(dateRange.to) : endOfDay(dateRange.from);
      matchesDate = isWithinInterval(requestDate, { start: from, end: to });
    }

    return matchesSearch && matchesStatus && matchesType && matchesUnit && matchesDate;
  });

  const totalPages = Math.ceil(filteredRequests.length / ITEMS_PER_PAGE);
  const paginatedRequests = filteredRequests.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Get the actual index in the full filtered list for navigation
  const getFilteredIndex = (pageIndex: number) => {
    return (currentPage - 1) * ITEMS_PER_PAGE + pageIndex;
  };

  const handleOpenSheet = (pageIndex: number) => {
    setSelectedIndex(getFilteredIndex(pageIndex));
    setSheetOpen(true);
  };

  const handleNavigate = useCallback((direction: 'prev' | 'next') => {
    setSelectedIndex(prev => {
      if (direction === 'prev' && prev > 0) return prev - 1;
      if (direction === 'next' && prev < filteredRequests.length - 1) return prev + 1;
      return prev;
    });
  }, [filteredRequests.length]);

  // Export function
  const handleExport = (format: 'excel' | 'csv') => {
    const columns: ExportColumn<BenefitRequest>[] = [
      { header: 'Protocolo', accessor: 'protocol' },
      { header: 'Data', accessor: (r) => formatDateForExport(r.created_at) },
      { header: 'Colaborador', accessor: (r) => r.profile?.full_name || '' },
      { header: 'CPF', accessor: (r) => r.profile?.cpf || '' },
      { header: 'Telefone', accessor: (r) => r.profile?.phone || '' },
      { header: 'Unidade', accessor: (r) => r.profile?.unit?.name || '' },
      { header: 'Tipo', accessor: (r) => benefitTypeLabels[r.benefit_type] },
      { header: 'Status', accessor: (r) => statusLabels[r.status] },
      { header: 'Detalhes', accessor: (r) => r.details || '' },
    ];

    const filename = `solicitacoes_${format === 'excel' ? new Date().toISOString().split('T')[0] : 'export'}`;
    
    if (format === 'excel') {
      exportToExcel(filteredRequests, columns, filename, 'Solicitações');
      toast.success('Relatório Excel exportado com sucesso');
    } else {
      // Use CSV export
      const { exportToCSV } = require('@/lib/exportUtils');
      exportToCSV(filteredRequests, columns, filename);
      toast.success('Relatório CSV exportado com sucesso');
    }
  };

  const selectedRequest = filteredRequests[selectedIndex];

  // Transform request for BenefitDetailsSheet format
  const getSheetRequest = () => {
    if (!selectedRequest) return null;
    return {
      id: selectedRequest.id,
      protocol: selectedRequest.protocol,
      benefit_type: selectedRequest.benefit_type,
      status: selectedRequest.status,
      details: selectedRequest.details,
      created_at: selectedRequest.created_at,
      pdf_url: selectedRequest.pdf_url,
      pdf_file_name: selectedRequest.pdf_file_name,
      rejection_reason: selectedRequest.rejection_reason,
      closing_message: selectedRequest.closing_message,
      account_id: selectedRequest.account_id,
      conversation_id: selectedRequest.conversation_id,
      reviewed_by: selectedRequest.reviewed_by,
      reviewed_at: selectedRequest.reviewed_at,
      reviewer_name: null, // Would need another query for reviewer name
      profiles: selectedRequest.profile ? {
        full_name: selectedRequest.profile.full_name,
        cpf: selectedRequest.profile.cpf,
        phone: selectedRequest.profile.phone,
        units: selectedRequest.profile.unit ? { name: selectedRequest.profile.unit.name } : null
      } : null
    };
  };

  // Get SLA indicator for a request
  const getSlaIndicator = (request: BenefitRequest) => {
    // Only show SLA for open/in-progress requests
    if (request.status === 'aprovada' || request.status === 'recusada') {
      return null;
    }
    
    // If in block period, show paused indicator
    if (isBlockPeriod) {
      return {
        bgColor: 'bg-muted',
        text: 'Pausado',
        label: 'SLA Pausado'
      };
    }
    
    // Get SLA config for this benefit type
    const config = slaConfigs.find(c => c.benefit_type === request.benefit_type);
    if (!config) return null;
    
    const hoursElapsed = differenceInHours(new Date(), new Date(request.created_at));
    const daysElapsed = Math.floor(hoursElapsed / 24);
    const remainingHours = hoursElapsed % 24;
    
    const timeText = daysElapsed > 0 
      ? `${daysElapsed}d ${remainingHours}h` 
      : `${hoursElapsed}h`;
    
    if (hoursElapsed <= config.green_hours) {
      return { bgColor: 'bg-green-500', text: timeText, label: `${timeText} (dentro do prazo)` };
    } else if (hoursElapsed <= config.yellow_hours) {
      return { bgColor: 'bg-yellow-500', text: timeText, label: `${timeText} (atenção)` };
    } else {
      return { bgColor: 'bg-red-500', text: timeText, label: `${timeText} (atrasado)` };
    }
  };

  return (
    <MainLayout>
      <div className="space-y-4 sm:space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground flex items-center gap-2">
              <FileText className="h-6 w-6 sm:h-7 sm:w-7 text-primary" />
              Protocolos
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
              Gerencie todas as solicitações de benefícios
            </p>
          </div>
          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" disabled={loading || filteredRequests.length === 0}>
                  <Download className="h-4 w-4 mr-2" />
                  Exportar
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleExport('excel')}>
                  <FileSpreadsheet className="h-4 w-4 mr-2" />
                  Exportar Excel (.xlsx)
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExport('csv')}>
                  <Download className="h-4 w-4 mr-2" />
                  Exportar CSV
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button variant="outline" size="sm" onClick={fetchRequests} disabled={loading}>
              <RefreshCw className={cn("h-4 w-4 mr-2", loading && "animate-spin")} />
              Atualizar
            </Button>
          </div>
        </div>

        {/* Block Period Alert */}
        {isBlockPeriod && (
          <Alert className="border-warning bg-warning/10">
            <PauseCircle className="h-4 w-4 text-warning" />
            <AlertDescription className="text-warning">
              ⚠️ Período de bloqueio ativo (a partir do dia {cutoffDay}). SLA está pausado e aprovações requerem confirmação extra.
            </AlertDescription>
          </Alert>
        )}

        {/* Filters */}
        <div className="flex flex-col gap-3">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por protocolo, nome, CPF ou telefone..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={(v) => {
              setStatusFilter(v);
              if (v !== 'all') {
                setSearchParams({ status: v });
              } else {
                setSearchParams({});
              }
            }}>
              <SelectTrigger className="w-full sm:w-40">
                <CircleDot className="h-4 w-4 mr-2 text-muted-foreground" />
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os status</SelectItem>
                <SelectItem value="aberta">Abertos</SelectItem>
                <SelectItem value="em_analise">Em Atendimento</SelectItem>
                <SelectItem value="aprovada,recusada">Encerrados</SelectItem>
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <Package className="h-4 w-4 mr-2 text-muted-foreground" />
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os tipos</SelectItem>
                {Object.entries(benefitTypeLabels).map(([key, label]) => (
                  <SelectItem key={key} value={key}>
                    <div className="flex items-center gap-2">
                      <BenefitIcon type={key as BenefitType} size="sm" />
                      <span>{label}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={unitFilter} onValueChange={setUnitFilter}>
              <SelectTrigger className="w-full sm:w-44">
                <Building2 className="h-4 w-4 mr-2 text-muted-foreground" />
                <SelectValue placeholder="Unidade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas Unidades</SelectItem>
                {units.map((unit) => (
                  <SelectItem key={unit.id} value={unit.id}>
                    {unit.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full sm:w-[200px] justify-start text-left font-normal",
                    !dateRange && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateRange?.from ? (
                    dateRange.to ? (
                      <>
                        {format(dateRange.from, "dd/MM", { locale: ptBR })} -{" "}
                        {format(dateRange.to, "dd/MM", { locale: ptBR })}
                      </>
                    ) : (
                      format(dateRange.from, "dd/MM/yyyy", { locale: ptBR })
                    )
                  ) : (
                    "Período"
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  initialFocus
                  mode="range"
                  defaultMonth={dateRange?.from}
                  selected={dateRange}
                  onSelect={setDateRange}
                  numberOfMonths={2}
                  locale={ptBR}
                />
              </PopoverContent>
            </Popover>
          </div>
          
          {hasActiveFilters && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Filter className="h-3 w-3" />
                {filteredRequests.length} resultados
              </span>
              <Button variant="ghost" size="sm" onClick={clearFilters} className="h-7 text-xs">
                <X className="h-3 w-3 mr-1" />
                Limpar filtros
              </Button>
            </div>
          )}
        </div>

        {/* Table */}
        <div className="rounded-lg border-2 border-primary/10 bg-card overflow-hidden shadow-lg">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="font-semibold"><CalendarIcon className="h-3.5 w-3.5 inline mr-1" />Data</TableHead>
                <TableHead className="font-semibold"><Hash className="h-3.5 w-3.5 inline mr-1" />Protocolo</TableHead>
                <TableHead className="font-semibold"><User className="h-3.5 w-3.5 inline mr-1" />Colaborador</TableHead>
                <TableHead className="font-semibold"><Building2 className="h-3.5 w-3.5 inline mr-1" />Unidade</TableHead>
                <TableHead className="font-semibold"><Package className="h-3.5 w-3.5 inline mr-1" />Tipo</TableHead>
                <TableHead className="font-semibold"><Clock className="h-3.5 w-3.5 inline mr-1" />SLA</TableHead>
                <TableHead className="font-semibold"><CircleDot className="h-3.5 w-3.5 inline mr-1" />Status</TableHead>
                <TableHead className="text-right font-semibold"><Settings className="h-3.5 w-3.5 inline mr-1" />Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-12" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-8" /></TableCell>
                  </TableRow>
                ))
              ) : paginatedRequests.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    😕 Nenhuma solicitação encontrada
                  </TableCell>
                </TableRow>
              ) : (
                paginatedRequests.map((request, index) => (
                  <TableRow 
                    key={request.id} 
                    className={cn(
                      "animate-fade-in hover:bg-primary/5 transition-colors",
                      index % 2 === 0 ? "bg-muted/20" : ""
                    )}
                  >
                    <TableCell className="text-sm text-muted-foreground">
                      {format(new Date(request.created_at), "dd/MM/yyyy", { locale: ptBR })}
                    </TableCell>
                    <TableCell>
                      <span className="font-bold font-mono text-sm text-primary">{request.protocol}</span>
                    </TableCell>
                    <TableCell className="font-medium">{request.profile?.full_name || 'N/A'}</TableCell>
                    <TableCell className="text-sm">
                      {request.profile?.unit?.name || '-'}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <BenefitIcon type={request.benefit_type} size="sm" />
                        <span className="text-sm truncate max-w-[120px]">{benefitTypeLabels[request.benefit_type] || request.benefit_type}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {getSlaIndicator(request) ? (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div className="flex items-center gap-2 cursor-help">
                                <div className={cn("w-2.5 h-2.5 rounded-full", getSlaIndicator(request)?.bgColor)} />
                                <span className="text-xs font-medium">{getSlaIndicator(request)?.text}</span>
                              </div>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>{getSlaIndicator(request)?.label}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <StatusBadge 
                        status={request.status} 
                        label={statusLabels[request.status]} 
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="hover:bg-primary/10"
                        onClick={() => handleOpenSheet(index)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {totalPages > 1 && (
          <PaginationControls
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        )}

        {/* Details Sheet */}
        {selectedRequest && getSheetRequest() && (
          <BenefitDetailsSheet
            open={sheetOpen}
            onOpenChange={setSheetOpen}
            request={getSheetRequest()!}
            onSuccess={fetchRequests}
            currentIndex={selectedIndex}
            totalItems={filteredRequests.length}
            onNavigate={handleNavigate}
            isBlockPeriod={isBlockPeriod}
            cutoffDay={cutoffDay}
          />
        )}
      </div>
    </MainLayout>
  );
}