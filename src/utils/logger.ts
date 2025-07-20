export class Logger {
  private logPrefix = '[Figmata]';

  log(message: string): void {
    console.log(`${this.logPrefix} ${message}`);
  }

  error(message: string, error?: Error): void {
    console.error(`${this.logPrefix} ERROR: ${message}`, error);
  }

  warn(message: string): void {
    console.warn(`${this.logPrefix} WARNING: ${message}`);
  }

  success(message: string): void {
    console.log(`${this.logPrefix} SUCCESS: ${message}`);
  }

  timing(label: string, duration?: number): void {
    if (duration !== undefined) {
      console.log(`${this.logPrefix} TIMING: ${label} took ${duration}ms`);
    } else {
      console.time(`${this.logPrefix} ${label}`);
    }
  }

  timeEnd(label: string): void {
    console.timeEnd(`${this.logPrefix} ${label}`);
  }
}
