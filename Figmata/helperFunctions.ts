/**
 * Parses a TSV (Tab-Separated Values) string into an array of JSON objects
 * @param tsvString - The TSV string with headers in the first row
 * @returns Array of objects where each object represents a row with header keys
 */
export function parseTSV(tsvString: string): Record<string, string>[] {
  if (!tsvString.trim()) {
    return [];
  }

  const lines = tsvString.trim().split('\n');
  
  if (lines.length < 2) {
    return [];
  }

  // Extract headers from the first row
  const headers = lines[0].split('\t').map(header => header.trim());
  
  // Parse data rows
  const data: Record<string, string>[] = [];
  
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split('\t');
    const row: Record<string, string> = {};
    
    headers.forEach((header, index) => {
      row[header] = values[index] ? values[index].trim() : '';
    });
    
    data.push(row);
  }
  
  return data;
}
