import { UIMessage } from '../../../shared/types/messages';
import { StateManager } from './state-manager';
import { UIUpdater } from './ui-updater';

declare global {
  interface Window {
    monaco: any;
    monacoEditor: any;
    inlineLogsData: Map<number, string>;
  }
}

export class MessageHandler {
  private stateManager: StateManager;
  private uiUpdater: UIUpdater;

  constructor(stateManager: StateManager, uiUpdater: UIUpdater) {
    this.stateManager = stateManager;
    this.uiUpdater = uiUpdater;
  }

  handleMessage(message: UIMessage): void {
    console.log('Received message from plugin:', message);

    switch (message.type) {
      case 'PLUGIN_READY':
        this.handlePluginReady(message);
        break;
        
      case 'EXECUTION_RESULT':
        this.handleExecutionResult(message);
        break;
        
      case 'FRAMES_UPDATED':
        this.handleFramesUpdated(message);
        break;
        
      case 'LOCK_STATE_UPDATED':
        this.handleLockStateUpdated(message);
        break;
        
      case 'AUTO_REFRESH_STATE_UPDATED':
        this.handleAutoRefreshStateUpdated(message);
        break;
        
      case 'updateFrameList':
        this.handleUpdateFrameList(message);
        break;
        
      case 'setCurrentFrame':
        this.handleSetCurrentFrame(message);
        break;
        
      case 'log':
        this.handleLogMessage(message);
        break;
        
      default:
        console.warn('Unknown message type:', message);
    }
  }

  private handlePluginReady(message: any): void {
    this.stateManager.setFrames(message.frames);
    
    // If a specific frame is selected (e.g., from canvas selection), update state
    if (message.selectedFrameId && !this.stateManager.isFrameLocked()) {
      this.stateManager.setSelectedFrame(message.selectedFrameId);
      
      // Update dropdown to reflect the selected frame
      const frameDropdown = document.getElementById('frameDropdown') as HTMLSelectElement;
      if (frameDropdown) {
        frameDropdown.value = message.selectedFrameId;
      }
    }
    
    if (message.initialCode) {
      this.stateManager.setCurrentCode(message.initialCode);
      this.uiUpdater.updateEditor(message.initialCode);
      console.log('Editor updated with code from frame:', message.selectedFrameId || 'current');
    }
    
    this.uiUpdater.updateFrameDropdown(message.frames);
  }

  private handleExecutionResult(message: any): void {
    // Don't clear inline logs immediately - let them persist for viewing
    // this.uiUpdater.clearAllInlineLogs();
    
    this.stateManager.setExecutionState(message.success ? 'success' : 'error');
    
    if (message.logs) {
      message.logs.forEach((log: any) => {
        this.uiUpdater.addConsoleLog(log);
      });
    }
    
    // If there's an error message but no logs, display the error in console
    if (!message.success && message.error && (!message.logs || message.logs.length === 0)) {
      this.uiUpdater.addConsoleLog({
        type: 'error',
        message: message.error,
        timestamp: Date.now()
      });
    }
    
    // Force refresh inlay hints after execution completes
    this.forceRefreshInlayHints();
  }

  private handleFramesUpdated(message: any): void {
    this.stateManager.setFrames(message.frames);
    this.uiUpdater.updateFrameDropdown(message.frames);
  }

  private handleLockStateUpdated(message: any): void {
    this.stateManager.setLockState(message.isLocked, message.frameId);
    this.uiUpdater.updateLockButton(message.isLocked);
    
    // If locking to a frame, update the selected frame
    if (message.isLocked && message.frameId) {
      this.stateManager.setSelectedFrame(message.frameId);
      
      // Update dropdown to show the locked frame
      const frameDropdown = document.getElementById('frameDropdown') as HTMLSelectElement;
      if (frameDropdown) {
        frameDropdown.value = message.frameId;
      }
    }
  }

  private handleAutoRefreshStateUpdated(message: any): void {
    this.stateManager.setAutoRefreshState(message.isEnabled);
    this.uiUpdater.updateAutoRefreshButton(message.isEnabled);
  }

  private handleUpdateFrameList(message: any): void {
    this.stateManager.setFrames(message.frames);
    this.uiUpdater.updateFrameDropdown(message.frames);
  }

  private handleSetCurrentFrame(message: any): void {
    if (message.frame) {
      // If we're locked, keep the selected frame as the locked frame
      if (!this.stateManager.isFrameLocked()) {
        this.stateManager.setSelectedFrame(message.frame.id);
      }
      
      // Update the dropdown to show the effective frame (locked frame or selected frame)
      const frameDropdown = document.getElementById('frameDropdown') as HTMLSelectElement;
      if (frameDropdown) {
        const effectiveFrameId = this.stateManager.isFrameLocked() 
          ? this.stateManager.getState().lockedFrameId 
          : message.frame.id;
        
        if (effectiveFrameId) {
          frameDropdown.value = effectiveFrameId;
        }
      }
    }
  }

  private handleLogMessage(message: any): void {
    // Handle inline log messages like Quokka.js
    console.log('Received log message:', message);
    this.uiUpdater.addConsoleLog({
        type: 'log',
        message: message.message,
        timestamp: Date.now()
      });
    if (message.line && message.message) {
      const lineNumber = Number(message.line);
      if (!isNaN(lineNumber)) {
        console.log(`Adding inline log for line ${lineNumber}: ${message.message}`);
        this.uiUpdater.addInlineLog(lineNumber, message.message);
      } else {
        console.log('Invalid line number:', message.line, typeof message.line);
      }
    } else {
      console.log('Log message missing line or message:', { line: message.line, message: message.message });
    }
  }

  private forceRefreshInlayHints(): void {
    console.log('Forcing inlay hints refresh after execution');
    const editor = window.monacoEditor;
    if (editor && window.monaco) {
      // Multiple strategies to force refresh
      setTimeout(() => {
        try {
          // Force a viewport change to trigger inlay hints
          const scrollTop = editor.getScrollTop();
          editor.setScrollTop(scrollTop + 1);
          editor.setScrollTop(scrollTop);
          
          // Also trigger the refresh action
          const action = editor.getAction('editor.action.inlayHints.refresh');
          if (action) {
            action.run();
          }
          
          editor.render(true);
        } catch (error) {
          console.log('Error in force refresh:', error);
        }
      }, 200);
    }
  }
}
