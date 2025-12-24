/**
 * Utility functions for exporting data to CSV/Excel format
 */
import * as XLSX from 'xlsx';

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
 * Exports data to Excel format (.xlsx)
 */
export function exportToExcel<T>(
  data: T[],
  columns: ExportColumn<T>[],
  filename: string,
  sheetName: string = 'Dados'
): void {
  // Transform data to rows
  const rows = data.map(item => {
    const row: Record<string, any> = {};
    columns.forEach(col => {
      let value: string | number | null | undefined;
      if (typeof col.accessor === 'function') {
        value = col.accessor(item);
      } else {
        value = item[col.accessor] as string | number | null | undefined;
      }
      row[col.header] = value ?? '';
    });
    return row;
  });

  // Create worksheet
  const worksheet = XLSX.utils.json_to_sheet(rows);
  
  // Auto-size columns
  const colWidths = columns.map(col => ({
    wch: Math.max(col.header.length, 15)
  }));
  worksheet['!cols'] = colWidths;

  // Create workbook
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

  // Export
  XLSX.writeFile(workbook, `${filename}.xlsx`);
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

/**
 * Calculate time difference in hours between two dates
 */
export function calculateHoursDifference(startDate: string | Date, endDate: string | Date): number {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffMs = end.getTime() - start.getTime();
  return Math.round(diffMs / (1000 * 60 * 60) * 10) / 10; // Round to 1 decimal
}
