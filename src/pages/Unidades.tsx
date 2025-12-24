import { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Search, Plus, Pencil, Trash2, Users, FileText, Building2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';

interface UnitWithStats {
  id: string;
  name: string;
  code: string;
  created_at: string;
  collaboratorCount: number;
  requestCount: number;
}

export default function Unidades() {
  const [units, setUnits] = useState<UnitWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchUnits();
  }, []);

  const fetchUnits = async () => {
    setLoading(true);
    try {
      // Fetch units
      const { data: unitsData, error: unitsError } = await supabase
        .from('units')
        .select('*')
        .order('name', { ascending: true });

      if (unitsError) {
        console.error('Error fetching units:', unitsError);
        toast.error('Erro ao carregar unidades');
        return;
      }

      // Fetch collaborator counts per unit
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('unit_id');

      // Fetch request counts per unit (via profiles)
      const { data: requestsData } = await supabase
        .from('benefit_requests')
        .select('user_id');

      // Get all profiles with unit_id to map user_id -> unit_id
      const { data: allProfiles } = await supabase
        .from('profiles')
        .select('user_id, unit_id');

      const userToUnit = new Map(allProfiles?.map(p => [p.user_id, p.unit_id]) || []);

      // Count collaborators per unit
      const collaboratorCounts = new Map<string, number>();
      profilesData?.forEach(p => {
        if (p.unit_id) {
          collaboratorCounts.set(p.unit_id, (collaboratorCounts.get(p.unit_id) || 0) + 1);
        }
      });

      // Count requests per unit
      const requestCounts = new Map<string, number>();
      requestsData?.forEach(r => {
        const unitId = userToUnit.get(r.user_id);
        if (unitId) {
          requestCounts.set(unitId, (requestCounts.get(unitId) || 0) + 1);
        }
      });

      const unitsWithStats: UnitWithStats[] = (unitsData || []).map(unit => ({
        ...unit,
        collaboratorCount: collaboratorCounts.get(unit.id) || 0,
        requestCount: requestCounts.get(unit.id) || 0,
      }));

      setUnits(unitsWithStats);
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredUnits = units.filter(unit => {
    return (
      unit.name.toLowerCase().includes(search.toLowerCase()) ||
      unit.code.toLowerCase().includes(search.toLowerCase())
    );
  });


  return (
    <MainLayout>
      <div className="space-y-4 sm:space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground flex items-center gap-2">
              <Building2 className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
              Unidades
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
              Gerencie as unidades da empresa
            </p>
          </div>
          <Button className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70">
            <Plus className="h-4 w-4 mr-2" />
            Nova Unidade
          </Button>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="🔍 Buscar por nome ou código..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Cards Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <Card key={i} className="border-2">
                <CardContent className="p-4 space-y-3">
                  <Skeleton className="h-6 w-16" />
                  <Skeleton className="h-5 w-32" />
                  <div className="flex gap-4">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-4 w-20" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredUnits.length === 0 ? (
          <div className="text-center py-12">
            <Building2 className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
            <p className="text-muted-foreground">Nenhuma unidade encontrada</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredUnits.map((unit) => (
              <Card 
                key={unit.id} 
                className="border bg-card hover:shadow-md transition-all duration-200"
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <Badge variant="outline" className="font-mono text-sm">
                      {unit.code}
                    </Badge>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive/10">
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                  
                  <h3 className="font-semibold text-lg mb-4 line-clamp-2">{unit.name}</h3>
                  
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                      <Users className="h-4 w-4" />
                      <span>{unit.collaboratorCount} colaboradores</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <FileText className="h-4 w-4" />
                      <span>{unit.requestCount} solicitações</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Summary Stats */}
        {!loading && filteredUnits.length > 0 && (
          <div className="flex flex-wrap gap-4 p-4 bg-muted/30 rounded-lg border">
            <div className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-primary" />
              <span className="text-sm text-muted-foreground">Total:</span>
              <span className="font-bold text-foreground">{filteredUnits.length} unidades</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-info" />
              <span className="text-sm text-muted-foreground">Colaboradores:</span>
              <span className="font-bold text-foreground">
                {filteredUnits.reduce((acc, u) => acc + u.collaboratorCount, 0)}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-success" />
              <span className="text-sm text-muted-foreground">Solicitações:</span>
              <span className="font-bold text-foreground">
                {filteredUnits.reduce((acc, u) => acc + u.requestCount, 0)}
              </span>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
}