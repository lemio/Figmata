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
      message: "line " + lineNumber + ": " + errorMessage,
      line: lineNumber
    };
  }

  handleGeneralError(error: Error, context: string): void {
    this.logger.error(`Error in ${context}:`, error);
  }

  private getLineNumberFromStack(error: Error): number {
    const stack = error.stack?.toString().split(/\r\n|\n/);
    const frameRE = /([0-9]+)\)*$/;
    let lineNumber = -1000;
    console.log('error stack:', stack)
    if (stack) {      
      while (stack.length) {
        const frame = stack.shift() || '';
        const match = frameRE.exec(frame);
        if (match) {
          //TODO this number should not be hardcoded
          lineNumber = Number(match[1]) -366;
          break;
        }
      }
    }
    
    return lineNumber;
  }
}
