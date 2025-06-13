// Data processing utilities for Figmata

export interface DataRow {
  [key: string]: string | number;
}

export interface ProcessedData {
  headers: string[];
  rows: DataRow[];
  summary: {
    totalRows: number;
    columns: string[];
  };
}

export function processCSV(csvText: string): ProcessedData {
  const lines = csvText.trim().split('\n');
  if (lines.length === 0) {
    return { headers: [], rows: [], summary: { totalRows: 0, columns: [] } };
  }

  const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
  const rows: DataRow[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.trim().replace(/^"|"$/g, ''));
    const row: DataRow = {};
    
    headers.forEach((header, index) => {
      const value = values[index] || '';
      // Try to convert to number if possible
      const numValue = parseFloat(value);
      row[header] = isNaN(numValue) ? value : numValue;
    });
    
    rows.push(row);
  }

  return {
    headers,
    rows,
    summary: {
      totalRows: rows.length,
      columns: headers
    }
  };
}

export function filterData(data: DataRow[], predicate: (row: DataRow) => boolean): DataRow[] {
  return data.filter(predicate);
}

export function sortData(data: DataRow[], key: string, ascending: boolean = true): DataRow[] {
  return [...data].sort((a, b) => {
    const aVal = a[key];
    const bVal = b[key];
    
    if (typeof aVal === 'number' && typeof bVal === 'number') {
      return ascending ? aVal - bVal : bVal - aVal;
    }
    
    const aStr = String(aVal);
    const bStr = String(bVal);
    return ascending ? aStr.localeCompare(bStr) : bStr.localeCompare(aStr);
  });
}
