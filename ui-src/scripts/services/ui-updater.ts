import { FrameInfo, LogEntry } from '../../../shared/types/messages';
import { StateManager } from './state-manager';

export class UIUpdater {
  private stateManager: StateManager;

  constructor(stateManager: StateManager) {
    this.stateManager = stateManager;
  }

  updateFrameDropdown(frames: FrameInfo[]): void {
    const dropdown = document.getElementById('frameDropdown') as HTMLSelectElement;
    if (!dropdown) return;

    const currentValue = dropdown.value;
    
    // Clear existing options except the first one
    dropdown.innerHTML = '<option value="">Select Frame...</option>';

    frames.forEach(frame => {
      const option = document.createElement('option');
      option.value = frame.id;
      option.textContent = `${frame.name}${frame.hasCode ? ' ✓' : ''}`;
      dropdown.appendChild(option);
    });
    
    // Restore previous selection if it still exists
    if (currentValue && frames.some(frame => frame.id === currentValue)) {
      dropdown.value = currentValue;
    }
    
    // If we have a selected frame in state but dropdown shows "Select Frame...", update it
    const selectedFrameId = this.stateManager.getSelectedFrameId();
    if (selectedFrameId && frames.some(frame => frame.id === selectedFrameId)) {
      dropdown.value = selectedFrameId;
    }
  }

  updateEditor(code: string): void {
    // This will be implemented when we set up Monaco editor
    const editor = (window as any).monacoEditor;
    if (editor) {
      editor.setValue(code);
    }
  }

  updateRunButton(state: 'normal' | 'running' | 'success' | 'error'): void {
    const button = document.getElementById('runButton') as HTMLButtonElement;
    if (!button) return;

    // Remove all state classes
    button.classList.remove('running', 'success', 'error', 'changed');
    
    // Add current state class
    if (state !== 'normal') {
      button.classList.add(state);
    }

    // Check if code has changed since last execution
    const isCodeChanged = this.stateManager.isCodeChangedSinceExecution();
    if (isCodeChanged && state !== 'running') {
      button.classList.add('changed');
    }

    // Update button text and state
    const span = button.querySelector('span');
    if (span) {
      switch (state) {
        case 'running':
          span.textContent = 'Running...';
          button.disabled = true;
          break;
        case 'success':
          span.textContent = isCodeChanged ? 'Run' : 'Success!';
          button.disabled = false;
          break;
        case 'error':
          span.textContent = isCodeChanged ? 'Run' : 'Error';
          button.disabled = false;
          break;
        default:
          span.textContent = 'Run';
          button.disabled = false;
      }
    }
  }

  updateLockButton(isLocked: boolean): void {
    const button = document.getElementById('lockButton') as HTMLButtonElement;
    if (!button) return;

    if (isLocked) {
      button.classList.add('locked');
      button.title = 'Unlock Frame';
    } else {
      button.classList.remove('locked');
      button.title = 'Lock Frame';
    }
  }

  updateAutoRefreshButton(isEnabled: boolean): void {
    const button = document.getElementById('autoRefreshButton') as HTMLButtonElement;
    if (!button) return;

    if (isEnabled) {
      button.classList.add('active');
      button.title = 'Disable Auto-refresh';
    } else {
      button.classList.remove('active');
      button.title = 'Enable Auto-refresh';
    }
  }

  addConsoleLog(log: LogEntry): void {
    const consoleOutput = document.getElementById('consoleOutput');
    if (!consoleOutput) return;

    const logElement = document.createElement('div');
    logElement.className = `log-entry ${log.type}`;

    const timestamp = new Date(log.timestamp || Date.now()).toLocaleTimeString();
    
    let content = '';
    if (log.timestamp) {
      content += `<span class="log-timestamp">${timestamp}</span>`;
    }
    
    content += `<span class="log-message">${this.escapeHtml(log.message)}</span>`;
    
    if (log.line) {
      content += `<span class="log-line">:${log.line}</span>`;
    }

    logElement.innerHTML = content;
    consoleOutput.appendChild(logElement);

    // Auto-scroll to bottom
    consoleOutput.scrollTop = consoleOutput.scrollHeight;

    // Limit console history
    const maxEntries = 100;
    const entries = consoleOutput.children;
    if (entries.length > maxEntries) {
      for (let i = 0; i < entries.length - maxEntries; i++) {
        entries[0].remove();
      }
    }
  }

  clearConsole(): void {
    const consoleOutput = document.getElementById('consoleOutput');
    if (consoleOutput) {
      consoleOutput.innerHTML = '';
    }
  }

  addInlineLog(lineNumber: number, message: string): void {
    // Store the log message for the inlay hints provider
    if (!(window as any).inlineLogsData) {
      (window as any).inlineLogsData = new Map();
    }
    (window as any).inlineLogsData.set(lineNumber, message);

    // Trigger inlay hints refresh
    this.refreshInlayHints();
  }

  clearInlineLogsForLine(lineNumber: number): void {
    const logsData = (window as any).inlineLogsData;
    if (logsData && logsData.has(lineNumber)) {
      logsData.delete(lineNumber);
      this.refreshInlayHints();
    }
  }

  clearAllInlineLogs(): void {
    const logsData = (window as any).inlineLogsData;
    if (logsData) {
      logsData.clear();
      this.refreshInlayHints();
    }
  }

  private refreshInlayHints(): void {
    const editor = (window as any).monacoEditor;
    if (editor && window.monaco) {
      // Trigger inlay hints refresh by calling the refresh method
      if (editor.getContribution && editor.getContribution('editor.contrib.inlayHints')) {
        const inlayHintsController = editor.getContribution('editor.contrib.inlayHints');
        if (inlayHintsController && inlayHintsController.refresh) {
          inlayHintsController.refresh();
        }
      }
    }
  }

  private escapeHtml(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}
