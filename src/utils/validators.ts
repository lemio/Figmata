export class InputValidator {
  static isValidCode(code: string): boolean {
    return typeof code === 'string' && code.trim().length > 0;
  }

  static isValidFrameId(frameId: string): boolean {
    return typeof frameId === 'string' && frameId.length > 0;
  }

  static isValidPrompt(prompt: string): boolean {
    return typeof prompt === 'string' && prompt.trim().length > 0;
  }

  static sanitizeCode(code: string): string {
    // Remove any potentially dangerous eval statements
    return code.replace(/eval\s*\(/g, '// eval(');
  }
}
