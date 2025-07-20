import { FrameInfo, LogEntry } from '../../../shared/types/messages';
import { StateManager } from './state-manager';

declare global {
  interface Window {
    monaco: any;
    monacoEditor: any;
    inlineLogsData: Map<number, string>;
  }
}

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
    const editor = window.monacoEditor;
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
    console.log(`Adding inline log for line ${lineNumber}: ${message}`);
    // Store the log message for the inlay hints provider
    if (!window.inlineLogsData) {
      console.log('Initializing inlineLogsData');
      window.inlineLogsData = new Map();
    }
    console.log('inlineLogsData before adding:', window.inlineLogsData.size, 'entries');
    
    const adjustedLineNumber = lineNumber - 29;
    
    // Check if this line already has logs - if so, accumulate them
    if (window.inlineLogsData.has(adjustedLineNumber)) {
      const existingMessage = window.inlineLogsData.get(adjustedLineNumber);
      const combinedMessage = `${existingMessage} ${message}`;
      window.inlineLogsData.set(adjustedLineNumber, combinedMessage);
      console.log(`Accumulated log for line ${adjustedLineNumber}: ${combinedMessage}`);
    } else {
      window.inlineLogsData.set(adjustedLineNumber, message);
      console.log(`New log for line ${adjustedLineNumber}: ${message}`);
    }
    
    console.log('inlineLogsData after adding:', window.inlineLogsData.size, 'entries');
    console.log('All inline logs:', Array.from(window.inlineLogsData.entries()));

    // Trigger inlay hints refresh
    this.refreshInlayHints();
  }

  clearInlineLogsForLine(lineNumber: number): void {
    const logsData = window.inlineLogsData;
    if (logsData && logsData.has(lineNumber)) {
      logsData.delete(lineNumber);
      this.refreshInlayHints();
    }
  }

  clearAllInlineLogs(): void {
    console.log('Clearing all inline logs');
    const logsData = window.inlineLogsData;
    if (logsData) {
      console.log('Found inline logs data to clear:', logsData.size, 'entries');
      logsData.clear();
      this.refreshInlayHints();
    } else {
      console.log('No inline logs data to clear');
    }
  }

  private refreshInlayHints(): void {
    console.log('Refreshing inlay hints');
    console.log('Current inline logs data:', window.inlineLogsData);
    const editor = window.monacoEditor;
    if (editor && window.monaco) {
        console.log('Editor and monaco available, triggering refresh');
        
        // Force multiple refresh strategies to ensure hints are updated
        setTimeout(() => {
            try {
                // Strategy 1: Layout refresh
                editor.layout();
                
                // Strategy 2: Trigger inlay hints refresh action
                const action = editor.getAction('editor.action.inlayHints.refresh');
                if (action) {
                    action.run();
                }
                
                // Strategy 3: Force a model content change to trigger refresh
                /*const model = editor.getModel();
                if (model) {
                    const position = editor.getPosition();
                    // Trigger a tiny change and then revert it to force refresh
                    model.pushEditOperations([], [{
                        range: new window.monaco.Range(1, 1, 1, 1),
                        text: ' '
                    }], () => null);
                    model.pushEditOperations([], [{
                        range: new window.monaco.Range(1, 1, 1, 2),
                        text: ''
                    }], () => null);
                    
                    // Restore cursor position
                    if (position) {
                        editor.setPosition(position);
                    }
                }*/
                
                // Strategy 4: Force render
                editor.render(true);
                
            } catch (error) {
                console.log('Error refreshing inlay hints:', error);
            }
        }, 10);
        
        // Also try a second refresh slightly later
        setTimeout(() => {
            try {
                editor.render(true);
                const action = editor.getAction('editor.action.inlayHints.refresh');
                if (action) {
                    action.run();
                }
            } catch (error) {
                console.log('Error in delayed refresh:', error);
            }
        }, 100);
    }
  }

  private escapeHtml(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}
