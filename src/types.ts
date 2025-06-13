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
