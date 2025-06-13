// Type definitions for Figmata plugin

export interface MessageData {
  code: string;
}

export interface ErrorMessage {
  type: 'error';
  error: string;
  line?: number;
}

export interface LogMessage {
  type: 'log';
  message: string;
  line: number;
}

export interface TestMessage {
  test: string;
}

export type UIMessage = ErrorMessage | LogMessage | TestMessage;

// Context for Function execution
export interface ExecutionContext {
  parseTSV: (tsvText: string) => Record<string, Record<string, string>>;
  delay: (ms: number) => Promise<void>;
  clamp: (value: number, min: number, max: number) => number;
  formatNumber: (num: number, decimals?: number) => string;
  figma: PluginAPI;
  console: Console;
  Promise: PromiseConstructor;
  setTimeout: typeof setTimeout;
  clearTimeout: typeof clearTimeout;
}
