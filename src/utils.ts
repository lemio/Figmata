// Utility functions for Figmata plugin

export function parseTSV(tsvText: string): Record<string, Record<string, string>> {
  const lines = tsvText.trim().split('\n');
  if (lines.length === 0) return {};

  const headers = lines[0].split('\t');
  const data: Record<string, Record<string, string>> = {};

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split('\t');
    /*
    if (values.length !== headers.length) {
      // Optionally skip malformed rows
      continue;
    }*/

    const row: Record<string, string> = {};

    for (let j = 1; j <= headers.length; j++) {
      row[headers[j-1]] = values[j] || "";
    }
    data[values[0]] = row;
  }

  return data;
}

export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Export all utility functions for context injection
export const utilityFunctions = {
  parseTSV,
  delay
};
