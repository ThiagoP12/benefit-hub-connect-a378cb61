/**
 * Utility functions for exporting data to CSV/Excel format
 */

export interface ExportColumn<T> {
  header: string;
  accessor: keyof T | ((item: T) => string | number | null | undefined);
}

/**
 * Converts an array of objects to CSV format and triggers download
 */
export function exportToCSV<T>(
  data: T[],
  columns: ExportColumn<T>[],
  filename: string
): void {
  // Generate CSV header
  const header = columns.map(col => `"${col.header}"`).join(';');
  
  // Generate CSV rows
  const rows = data.map(item => {
    return columns.map(col => {
      let value: string | number | null | undefined;
      
      if (typeof col.accessor === 'function') {
        value = col.accessor(item);
      } else {
        value = item[col.accessor] as string | number | null | undefined;
      }
      
      // Handle null/undefined
      if (value === null || value === undefined) {
        return '""';
      }
      
      // Escape quotes and wrap in quotes
      const stringValue = String(value).replace(/"/g, '""');
      return `"${stringValue}"`;
    }).join(';');
  });
  
  // Combine header and rows
  const csvContent = [header, ...rows].join('\n');
  
  // Add BOM for Excel compatibility with UTF-8
  const BOM = '\uFEFF';
  const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
  
  // Create download link
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Formats a date for export
 */
export function formatDateForExport(date: string | Date): string {
  const d = new Date(date);
  return d.toLocaleDateString('pt-BR');
}

/**
 * Formats a datetime for export
 */
export function formatDateTimeForExport(date: string | Date): string {
  const d = new Date(date);
  return `${d.toLocaleDateString('pt-BR')} ${d.toLocaleTimeString('pt-BR')}`;
}
