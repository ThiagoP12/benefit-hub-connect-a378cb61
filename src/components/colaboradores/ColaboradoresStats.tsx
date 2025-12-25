import { Users, Building2, AlertTriangle, TrendingUp } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface StatsProps {
  total: number;
  byDepartment: Record<string, number>;
  exceededLimit: number;
}

export function ColaboradoresStats({ total, byDepartment, exceededLimit }: StatsProps) {
  const topDepartments = Object.entries(byDepartment)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-fade-in">
      <Card className="border-2 hover:shadow-md transition-all">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{total}</p>
              <p className="text-xs text-muted-foreground">Total de Colaboradores</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-2 hover:shadow-md transition-all">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-info/10 text-info">
              <Building2 className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{Object.keys(byDepartment).length}</p>
              <p className="text-xs text-muted-foreground">Departamentos</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-2 hover:shadow-md transition-all">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-success/10 text-success">
              <TrendingUp className="h-5 w-5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-foreground truncate">
                {topDepartments[0]?.[0] || '-'}
              </p>
              <p className="text-xs text-muted-foreground">Maior Depto ({topDepartments[0]?.[1] || 0})</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className={`border-2 hover:shadow-md transition-all ${exceededLimit > 0 ? 'border-destructive/30' : ''}`}>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${exceededLimit > 0 ? 'bg-destructive/10 text-destructive animate-pulse' : 'bg-muted text-muted-foreground'}`}>
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <p className={`text-2xl font-bold ${exceededLimit > 0 ? 'text-destructive' : 'text-foreground'}`}>{exceededLimit}</p>
              <p className="text-xs text-muted-foreground">Limite Excedido</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
