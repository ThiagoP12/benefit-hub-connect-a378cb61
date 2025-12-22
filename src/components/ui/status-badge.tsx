import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const statusBadgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors",
  {
    variants: {
      variant: {
        aberta: "bg-info/10 text-info border border-info/20",
        em_analise: "bg-warning/10 text-warning border border-warning/20",
        aprovada: "bg-success/10 text-success border border-success/20",
        concluida: "bg-success/10 text-success border border-success/20",
        recusada: "bg-destructive/10 text-destructive border border-destructive/20",
        default: "bg-muted text-muted-foreground border border-border",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

interface StatusBadgeProps extends VariantProps<typeof statusBadgeVariants> {
  status: string;
  label: string;
  className?: string;
}

export function StatusBadge({ status, label, className }: StatusBadgeProps) {
  const variant = status as "aberta" | "em_analise" | "aprovada" | "concluida" | "recusada" | "default";
  
  return (
    <span className={cn(statusBadgeVariants({ variant }), className)}>
      {label}
    </span>
  );
}
