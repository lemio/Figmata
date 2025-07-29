import { FigmaManager } from './services/figma-manager';
import { CodeExecutor } from './services/code-executor';
import { FrameManager } from './services/frame-manager';
import { AIService } from './services/ai-service';
import { Logger } from './utils/logger';
import { ErrorHandler } from './utils/error-handler';
import { PluginMessage, UIMessage } from '../shared/types/messages';
import { MESSAGE_TYPES } from '../shared/constants/message-types';
import * as Examples from './Examples';

class PluginController {
  private figmaManager: FigmaManager;
  private codeExecutor: CodeExecutor;
  private frameManager: FrameManager;
  private aiService: AIService;
  private logger: Logger;
  private errorHandler: ErrorHandler;
  private autoRefreshEnabled = false;

  constructor() {
    this.figmaManager = new FigmaManager();
    this.codeExecutor = new CodeExecutor();
    this.frameManager = new FrameManager();
    this.aiService = new AIService();
    this.logger = new Logger();
    this.errorHandler = new ErrorHandler();
    
    this.initializePlugin();
  }

  private initializePlugin(): void {
    // Show UI
    figma.showUI(__html__, { width: 800, height: 600 });
    
    // Set up message handling
    figma.ui.onmessage = this.handleMessage.bind(this);
    
    // Set up event listeners
    figma.on('run', this.handleRun.bind(this));
    figma.on('selectionchange', this.handleSelectionChange.bind(this));
    
    // Send initial data to UI
    this.sendInitialData();
    
    this.logger.log('Plugin initialized successfully');
  }

  private async sendInitialData(): Promise<void> {
    const frames = this.frameManager.getAvailableFrames();
    const initialCode = this.figmaManager.generateTemplateCode();
    const currentFrame = this.frameManager.getCurrentFrame();
    
    this.sendToUI({
      type: MESSAGE_TYPES.PLUGIN_READY,
      frames,
      initialCode,
      timestamp: Date.now()
    });

    // Send frame list
    this.sendToUI({
      type: 'updateFrameList',
      frames,
      timestamp: Date.now()
    } as any);

    // Send current frame if one is selected
    if (currentFrame && !this.frameManager.isFrameLocked()) {
      this.sendToUI({
        type: 'setCurrentFrame',
        frame: {
          id: currentFrame.id,
          name: currentFrame.name,
          hasCode: currentFrame.getPluginData('code') !== ''
        },
        timestamp: Date.now()
      } as any);
    }
  }

  private async handleMessage(message: PluginMessage): Promise<void> {
    try {
      this.logger.log(`Received message: ${message.type}`);
      
      switch (message.type) {
        case MESSAGE_TYPES.RUN_CODE:
          await this.executeCode(message.code);
          break;
          
        case MESSAGE_TYPES.FRAME_SELECTED:
          await this.selectFrame(message.frameId);
          break;
          
        case MESSAGE_TYPES.AI_PROMPT:
          await this.processAIPrompt(message.prompt);
          break;
          
        case MESSAGE_TYPES.GET_FRAMES:
          await this.refreshFrames();
          break;
          
        case MESSAGE_TYPES.TOGGLE_LOCK:
          await this.toggleLock(message.frameId);
          break;
          
        case MESSAGE_TYPES.TOGGLE_AUTO_REFRESH:
          this.toggleAutoRefresh();
          break;
          
        case MESSAGE_TYPES.RUN_EXAMPLE:
          await this.runExample(message.exampleName);
          break;
          
        default:
          this.logger.warn('Unknown message type received');
      }
    } catch (error) {
      this.errorHandler.handleGeneralError(error as Error, 'message handling');
      this.sendError(error as Error);
    }
  }

  private async executeCode(code: string): Promise<void> {
    // Get the target frame (locked frame or current selection)
    const targetFrame = this.frameManager.getCurrentFrame();
    
    if (!targetFrame) {
      this.sendToUI({
        type: MESSAGE_TYPES.EXECUTION_RESULT,
        success: false,
        error: 'Please select a frame or lock to a specific frame',
        timestamp: Date.now()
      });
      return;
    }

    const result = await this.codeExecutor.executeCode(code, targetFrame.id);
    
    this.sendToUI({
      type: MESSAGE_TYPES.EXECUTION_RESULT,
      success: result.success,
      logs: result.logs,
      error: result.error,
      timestamp: Date.now()
    });

    // Save code to current frame if execution was successful
    if (result.success) {
      await this.frameManager.setFrameCode(targetFrame.id, code);
    }
  }

  private async runExample(exampleName: string): Promise<void> {
    try {
      this.logger.log(`Running example: ${exampleName}`);
      
      // Check if the example function exists
      if (!(exampleName in Examples)) {
        this.sendToUI({
          type: MESSAGE_TYPES.EXECUTION_RESULT,
          success: false,
          error: `Example '${exampleName}' not found`,
          timestamp: Date.now()
        });
        return;
      }

      // Execute the example function
      const exampleFunction = (Examples as Record<string, () => Promise<void>>)[exampleName];
      await exampleFunction();
      
      this.sendToUI({
        type: MESSAGE_TYPES.EXECUTION_RESULT,
        success: true,
        logs: [{
          message: `Example '${exampleName}' executed successfully`,
          type: 'success',
          timestamp: Date.now()
        }],
        timestamp: Date.now()
      });
    } catch (error) {
      this.errorHandler.handleGeneralError(error as Error, `example execution: ${exampleName}`);
      this.sendToUI({
        type: MESSAGE_TYPES.EXECUTION_RESULT,
        success: false,
        error: `Error running example '${exampleName}': ${(error as Error).message}`,
        timestamp: Date.now()
      });
    }
  }

  private async selectFrame(frameId: string): Promise<void> {
    const frame = await this.frameManager.selectFrame(frameId);
    if (frame) {
      // If we're locked to a different frame, don't load code from the selected frame
      if (this.frameManager.isFrameLocked()) {
        const lockedFrame = this.frameManager.getLockedFrame();
        if (lockedFrame && lockedFrame.id !== frameId) {
          // Keep the locked frame active
          return;
        }
      }

      const code = await this.frameManager.getFrameCode(frameId);
      const finalCode = code || this.figmaManager.generateTemplateCode();
      
      // Send combined message with frame selection and code
      this.sendToUI({
        type: MESSAGE_TYPES.PLUGIN_READY,
        frames: this.frameManager.getAvailableFrames(),
        initialCode: finalCode,
        selectedFrameId: frameId,
        timestamp: Date.now()
      });
    }
  }

  private async processAIPrompt(prompt: string): Promise<void> {
    try {
      const generatedCode = await this.aiService.processPrompt(prompt);
      
      // Send generated code back to UI
      this.sendToUI({
        type: MESSAGE_TYPES.PLUGIN_READY,
        frames: this.frameManager.getAvailableFrames(),
        initialCode: generatedCode,
        timestamp: Date.now()
      });
      
    } catch (error) {
      this.sendError(error as Error);
    }
  }

  private async refreshFrames(): Promise<void> {
    const frames = this.frameManager.getAvailableFrames();
    
    this.sendToUI({
      type: MESSAGE_TYPES.FRAMES_UPDATED,
      frames,
      timestamp: Date.now()
    });

    // Also send the updateFrameList message for compatibility
    this.sendToUI({
      type: 'updateFrameList',
      frames,
      timestamp: Date.now()
    } as any);
  }

  private async toggleLock(frameId?: string): Promise<void> {
    const wasLocked = this.frameManager.isFrameLocked();
    const previousLockedFrame = this.frameManager.getLockedFrame();
    
    await this.frameManager.lockFrame(frameId);
    const isNowLocked = this.frameManager.isFrameLocked();
    
    this.sendToUI({
      type: MESSAGE_TYPES.LOCK_STATE_UPDATED,
      isLocked: isNowLocked,
      frameId: frameId,
      timestamp: Date.now()
    });

    // If we just locked to a frame, load code for the locked frame
    if (!wasLocked && isNowLocked && frameId) {
      const lockedFrame = this.frameManager.getLockedFrame();
      if (lockedFrame) {
        const code = await this.frameManager.getFrameCode(lockedFrame.id);
        const finalCode = code || this.figmaManager.generateTemplateCode();
        
        this.sendToUI({
          type: MESSAGE_TYPES.PLUGIN_READY,
          frames: this.frameManager.getAvailableFrames(),
          initialCode: finalCode,
          selectedFrameId: lockedFrame.id,
          timestamp: Date.now()
        });
      }
    }
    
    // If we just unlocked, update UI with the previously locked frame (now selected)
    if (wasLocked && !isNowLocked && previousLockedFrame) {
      const code = await this.frameManager.getFrameCode(previousLockedFrame.id);
      const finalCode = code || this.figmaManager.generateTemplateCode();
      
      this.sendToUI({
        type: MESSAGE_TYPES.PLUGIN_READY,
        frames: this.frameManager.getAvailableFrames(),
        initialCode: finalCode,
        selectedFrameId: previousLockedFrame.id,
        timestamp: Date.now()
      });
    }
  }

  private toggleAutoRefresh(): void {
    this.autoRefreshEnabled = !this.autoRefreshEnabled;
    
    this.sendToUI({
      type: MESSAGE_TYPES.AUTO_REFRESH_STATE_UPDATED,
      isEnabled: this.autoRefreshEnabled,
      timestamp: Date.now()
    });
    
    this.logger.log(`Auto-refresh ${this.autoRefreshEnabled ? 'enabled' : 'disabled'}`);
  }

  private async handleRun(): Promise<void> {
    // Handle relaunch commands
    if (figma.command === 'reset') {
      const selection = figma.currentPage.selection[0];
      if (selection && selection.type === 'FRAME') {
        await this.frameManager.setFrameCode(selection.id, '');
        this.logger.log('Frame code reset');
      }
    } else {
      // Generate initial template and show UI
      await this.sendInitialData();
    }
  }

  private async handleSelectionChange(): Promise<void> {
    // Don't update if frame is locked
    if (this.frameManager.isFrameLocked()) {
      return;
    }

    const currentFrame = this.frameManager.getCurrentFrame();
    
    if (currentFrame) {
      // Always load existing code for this frame (regardless of autorefresh state)
      const code = await this.frameManager.getFrameCode(currentFrame.id);
      const finalCode = code || this.figmaManager.generateTemplateCode();
      
      // Send a combined message with frame info and code
      this.sendToUI({
        type: MESSAGE_TYPES.PLUGIN_READY,
        frames: this.frameManager.getAvailableFrames(),
        initialCode: finalCode,
        selectedFrameId: currentFrame.id,
        timestamp: Date.now()
      });
    } else {
      // No frame selected, just update the frames list
      await this.refreshFrames();
    }
  }

  private sendToUI(message: UIMessage): void {
    figma.ui.postMessage(message);
  }

  private sendError(error: Error): void {
    const errorInfo = this.errorHandler.handleExecutionError(error);
    
    this.sendToUI({
      type: MESSAGE_TYPES.EXECUTION_RESULT,
      success: false,
      logs: [{
        type: 'error',
        message: errorInfo.message,
        line: errorInfo.line,
        timestamp: Date.now()
      }],
      error: errorInfo.message,
      timestamp: Date.now()
    });
  }
}

// Initialize the plugin
new PluginController();
