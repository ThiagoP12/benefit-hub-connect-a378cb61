import { TrendingUp, TrendingDown, Clock, Target, CheckCircle2, BarChart3 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { AnimatedCounter } from './AnimatedCounter';
import { cn } from '@/lib/utils';

interface HeroStatsProps {
  approvalRate: number;
  avgResponseTime: number;
  totalRequests: number;
  todayRequests: number;
  previousApprovalRate?: number;
  previousAvgTime?: number;
}

function CircularProgress({ 
  value, 
  size = 120, 
  strokeWidth = 10,
  className = ''
}: { 
  value: number; 
  size?: number; 
  strokeWidth?: number;
  className?: string;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (value / 100) * circumference;

  return (
    <div className={cn("relative inline-flex items-center justify-center", className)}>
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="none"
          className="text-muted/20"
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="url(#progressGradient)"
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-1000 ease-out"
        />
        <defs>
          <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="hsl(var(--success))" />
            <stop offset="100%" stopColor="hsl(var(--primary))" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl sm:text-3xl font-bold text-foreground">
          <AnimatedCounter value={value} duration={1500} suffix="%" />
        </span>
        <span className="text-[10px] sm:text-xs text-muted-foreground font-medium">Aprovação</span>
      </div>
    </div>
  );
}

function StatItem({ 
  icon: Icon, 
  label, 
  value, 
  suffix = '',
  trend,
  trendValue,
  className = ''
}: { 
  icon: typeof Clock;
  label: string;
  value: number | string;
  suffix?: string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: number;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col items-center gap-1 p-3 rounded-xl bg-background/50 backdrop-blur-sm border border-border/50", className)}>
      <div className="flex items-center gap-2">
        <div className="p-2 rounded-lg bg-primary/10">
          <Icon className="h-4 w-4 text-primary" />
        </div>
        <span className="text-xl sm:text-2xl font-bold text-foreground">
          <AnimatedCounter value={value} suffix={suffix} />
        </span>
      </div>
      <span className="text-xs text-muted-foreground font-medium">{label}</span>
      {trend && trendValue !== undefined && (
        <div className={cn(
          "flex items-center gap-1 text-[10px] font-medium",
          trend === 'up' ? 'text-success' : trend === 'down' ? 'text-destructive' : 'text-muted-foreground'
        )}>
          {trend === 'up' ? <TrendingUp className="h-3 w-3" /> : trend === 'down' ? <TrendingDown className="h-3 w-3" /> : null}
          {trend !== 'neutral' && <span>{trend === 'up' ? '+' : '-'}{trendValue}%</span>}
        </div>
      )}
    </div>
  );
}

export function HeroStats({ 
  approvalRate, 
  avgResponseTime, 
  totalRequests,
  todayRequests,
  previousApprovalRate = 0,
  previousAvgTime = 0
}: HeroStatsProps) {
  const approvalTrend = previousApprovalRate > 0 
    ? approvalRate > previousApprovalRate ? 'up' : approvalRate < previousApprovalRate ? 'down' : 'neutral'
    : 'neutral';
  const approvalTrendValue = previousApprovalRate > 0 
    ? Math.abs(Math.round(((approvalRate - previousApprovalRate) / previousApprovalRate) * 100))
    : 0;

  const timeTrend = previousAvgTime > 0
    ? avgResponseTime < previousAvgTime ? 'up' : avgResponseTime > previousAvgTime ? 'down' : 'neutral'
    : 'neutral';
  const timeTrendValue = previousAvgTime > 0
    ? Math.abs(Math.round(((avgResponseTime - previousAvgTime) / previousAvgTime) * 100))
    : 0;

  return (
    <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 via-background to-accent/5 overflow-hidden relative animate-fade-in">
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-primary/10 to-transparent rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-accent/10 to-transparent rounded-full blur-3xl" />
      
      <CardContent className="p-4 sm:p-6 relative z-10">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
          {/* Circular Progress */}
          <div className="flex items-center gap-4 sm:gap-6">
            <CircularProgress value={approvalRate} size={130} strokeWidth={12} />
            <div className="space-y-1">
              <h3 className="text-sm font-medium text-muted-foreground">Taxa de Aprovação</h3>
              <p className="text-3xl sm:text-4xl font-bold text-foreground">
                <AnimatedCounter value={approvalRate} suffix="%" duration={1500} />
              </p>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                {approvalTrend === 'up' && <TrendingUp className="h-3 w-3 text-success" />}
                {approvalTrend === 'down' && <TrendingDown className="h-3 w-3 text-destructive" />}
                <span>vs. período anterior</span>
              </p>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full lg:w-auto">
            <StatItem 
              icon={BarChart3}
              label="Total"
              value={totalRequests}
            />
            <StatItem 
              icon={Target}
              label="Hoje"
              value={todayRequests}
            />
            <StatItem 
              icon={Clock}
              label="Tempo Médio"
              value={avgResponseTime}
              suffix="h"
              trend={timeTrend}
              trendValue={timeTrendValue}
            />
            <StatItem 
              icon={CheckCircle2}
              label="Eficiência"
              value={avgResponseTime <= 2 ? 'Ótimo' : avgResponseTime <= 6 ? 'Bom' : 'Regular'}
              className={cn(
                avgResponseTime <= 2 ? 'border-success/30 bg-success/5' :
                avgResponseTime <= 6 ? 'border-warning/30 bg-warning/5' :
                'border-destructive/30 bg-destructive/5'
              )}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
