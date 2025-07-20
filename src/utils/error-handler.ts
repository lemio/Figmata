import { Logger } from './logger';

export class ErrorHandler {
  private logger: Logger;

  constructor() {
    this.logger = new Logger();
  }

  handleExecutionError(error: Error): { message: string; line?: number } {
    const lineNumber = this.getLineNumberFromStack(error);
    const errorMessage = error.message || 'Unknown execution error';
    
    this.logger.error(`Code execution failed at line ${lineNumber}:`, error);
    
    return {
      message: errorMessage,
      line: lineNumber
    };
  }

  handleGeneralError(error: Error, context: string): void {
    this.logger.error(`Error in ${context}:`, error);
  }

  private getLineNumberFromStack(error: Error): number {
    const stack = error.stack?.toString().split(/\r\n|\n/);
    const frameRE = /([0-9]+)\)*$/;
    let lineNumber = 0;
    
    if (stack) {
      stack.shift(); // Remove the first line which is the error message
      
      while (stack.length > 1) {
        const frame = stack.shift() || '';
        const match = frameRE.exec(frame);
        if (match) {
          lineNumber = Number(match[1]);
          break;
        }
      }
    }
    
    return lineNumber;
  }
}
