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
      
      // Load existing code for this frame if available
      // This will be handled by requesting code from the plugin
    }
  }

  private handleLogMessage(message: any): void {
    // Handle inline log messages like Quokka.js
    if (message.line && message.message) {
      this.uiUpdater.addInlineLog(message.line, message.message);
    }
  }
}
