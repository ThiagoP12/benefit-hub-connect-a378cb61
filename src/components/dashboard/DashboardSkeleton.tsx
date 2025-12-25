import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export function StatCardSkeleton({ index = 0 }: { index?: number }) {
  return (
    <div 
      className="rounded-xl border border-border p-4 sm:p-5 lg:p-6 bg-card animate-pulse"
      style={{ animationDelay: `${index * 0.1}s` }}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1 space-y-2">
          <Skeleton className="h-3 w-16 shimmer" />
          <Skeleton className="h-8 w-20 shimmer" />
        </div>
        <Skeleton className="h-10 w-10 rounded-lg shimmer" />
      </div>
    </div>
  );
}

export function ChartSkeleton() {
  return (
    <Card className="border-2 border-border">
      <CardHeader>
        <Skeleton className="h-6 w-48 shimmer" />
      </CardHeader>
      <CardContent>
        <div className="h-[300px] flex items-end justify-around gap-2 p-4">
          {[...Array(6)].map((_, i) => (
            <Skeleton 
              key={i} 
              className="w-12 shimmer rounded-t-lg"
              style={{ 
                height: `${Math.random() * 60 + 40}%`,
                animationDelay: `${i * 0.1}s`
              }} 
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export function HeroStatsSkeleton() {
  return (
    <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 via-background to-accent/5">
      <CardContent className="p-6">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-6">
            <Skeleton className="h-32 w-32 rounded-full shimmer" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-24 shimmer" />
              <Skeleton className="h-10 w-32 shimmer" />
              <Skeleton className="h-4 w-40 shimmer" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="text-center space-y-2">
                <Skeleton className="h-8 w-16 mx-auto shimmer" />
                <Skeleton className="h-3 w-20 mx-auto shimmer" />
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function BenefitTypeCardsSkeleton() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
      {[...Array(6)].map((_, i) => (
        <Card 
          key={i} 
          className="border-border animate-pulse"
          style={{ animationDelay: `${i * 0.1}s` }}
        >
          <CardContent className="p-4 flex flex-col items-center gap-3">
            <Skeleton className="h-12 w-12 rounded-full shimmer" />
            <Skeleton className="h-4 w-16 shimmer" />
            <Skeleton className="h-6 w-8 shimmer" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export function AlertBoardSkeleton() {
  return (
    <Card className="border-2 border-warning/30">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Skeleton className="h-5 w-5 rounded shimmer" />
          <Skeleton className="h-5 w-32 shimmer" />
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="flex items-center justify-between p-3 rounded-lg border border-border">
            <div className="flex items-center gap-3">
              <Skeleton className="h-8 w-8 rounded-full shimmer" />
              <div className="space-y-1">
                <Skeleton className="h-4 w-24 shimmer" />
                <Skeleton className="h-3 w-32 shimmer" />
              </div>
            </div>
            <div className="text-right space-y-1">
              <Skeleton className="h-4 w-8 shimmer" />
              <Skeleton className="h-3 w-12 shimmer" />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

export function TableSkeleton() {
  return (
    <Card className="border-2 border-info/10">
      <CardHeader>
        <div className="flex items-center justify-between">
          <Skeleton className="h-5 w-40 shimmer" />
          <Skeleton className="h-8 w-20 shimmer" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center gap-4 py-2">
              <Skeleton className="h-4 w-16 shimmer" />
              <Skeleton className="h-4 w-24 shimmer" />
              <Skeleton className="h-4 w-32 shimmer" />
              <Skeleton className="h-4 w-20 shimmer" />
              <Skeleton className="h-8 w-8 rounded-full shimmer" />
              <Skeleton className="h-6 w-20 rounded-full shimmer" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="space-y-2">
          <Skeleton className="h-8 w-64 shimmer" />
          <Skeleton className="h-4 w-48 shimmer" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-10 w-40 shimmer" />
          <Skeleton className="h-10 w-40 shimmer" />
          <Skeleton className="h-10 w-24 shimmer" />
        </div>
      </div>

      {/* Hero Stats */}
      <HeroStatsSkeleton />

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-2 sm:gap-3 md:gap-4 sm:grid-cols-4 lg:grid-cols-7">
        {[...Array(7)].map((_, i) => (
          <StatCardSkeleton key={i} index={i} />
        ))}
      </div>

      {/* Benefit Type Cards */}
      <BenefitTypeCardsSkeleton />

      {/* Charts Grid */}
      <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-2">
        <ChartSkeleton />
        <ChartSkeleton />
        <AlertBoardSkeleton />
      </div>

      {/* Recent Requests Table */}
      <TableSkeleton />
    </div>
  );
}
