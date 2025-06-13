// Utility functions for Figmata plugin

export function parseTSV(tsvText: string): Record<string, Record<string, string>> {
  const lines = tsvText.trim().split('\n');
  if (lines.length === 0) return {};

  const headers = lines[0].split('\t');
  const data: Record<string, Record<string, string>> = {};

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split('\t');
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

// Add more utility functions here as your plugin grows
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export function formatNumber(num: number, decimals: number = 2): string {
  return num.toFixed(decimals);
}

// Export all utility functions for easy access
export const utilityFunctions = {
  parseTSV,
  delay,
  clamp,
  formatNumber
};
