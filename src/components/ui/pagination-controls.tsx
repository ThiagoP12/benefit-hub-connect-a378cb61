import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "./button";

interface PaginationControlsProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function PaginationControls({ currentPage, totalPages, onPageChange }: PaginationControlsProps) {
  return (
    <div className="flex items-center justify-center gap-2 mt-4">
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage <= 1}
      >
        <ChevronLeft className="h-4 w-4" />
        <span className="hidden sm:inline ml-1">Anterior</span>
      </Button>
      
      <div className="flex items-center gap-1">
        <span className="text-sm text-muted-foreground">
          Página {currentPage} de {totalPages}
        </span>
      </div>
      
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage >= totalPages}
      >
        <span className="hidden sm:inline mr-1">Próxima</span>
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
}
