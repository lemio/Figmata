import { UIMessage } from '../../../shared/types/messages';
import { StateManager } from './state-manager';
import { UIUpdater } from './ui-updater';

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
        
      case 'log':
        this.handleLogMessage(message);
        break;
        
      default:
        console.warn('Unknown message type:', message);
    }
  }

  private handlePluginReady(message: any): void {
    this.stateManager.setFrames(message.frames);
    
    if (message.initialCode) {
      this.stateManager.setCurrentCode(message.initialCode);
      this.uiUpdater.updateEditor(message.initialCode);
    }
    
    this.uiUpdater.updateFrameDropdown(message.frames);
  }

  private handleExecutionResult(message: any): void {
    // Clear all previous inline logs before showing new results
    this.uiUpdater.clearAllInlineLogs();
    
    this.stateManager.setExecutionState(message.success ? 'success' : 'error');
    
    if (message.logs) {
      message.logs.forEach((log: any) => {
        this.uiUpdater.addConsoleLog(log);
      });
    }
    
    // Reset button state after a delay
    setTimeout(() => {
      this.stateManager.setExecutionState('normal');
      this.uiUpdater.updateRunButton('normal');
    }, 2000);
  }

  private handleFramesUpdated(message: any): void {
    this.stateManager.setFrames(message.frames);
    this.uiUpdater.updateFrameDropdown(message.frames);
  }

  private handleLockStateUpdated(message: any): void {
    this.stateManager.setLockState(message.isLocked, message.frameId);
    this.uiUpdater.updateLockButton(message.isLocked);
  }

  private handleAutoRefreshStateUpdated(message: any): void {
    this.stateManager.setAutoRefreshState(message.isEnabled);
    this.uiUpdater.updateAutoRefreshButton(message.isEnabled);
  }

  private handleLogMessage(message: any): void {
    // Handle inline log messages like Quokka.js
    if (message.line && message.message) {
      this.uiUpdater.addInlineLog(message.line, message.message);
    }
  }
}
