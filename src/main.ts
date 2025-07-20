import { FigmaManager } from './services/figma-manager';
import { CodeExecutor } from './services/code-executor';
import { FrameManager } from './services/frame-manager';
import { AIService } from './services/ai-service';
import { Logger } from './utils/logger';
import { ErrorHandler } from './utils/error-handler';
import { PluginMessage, UIMessage } from '../shared/types/messages';
import { MESSAGE_TYPES } from '../shared/constants/message-types';

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
    
    this.sendToUI({
      type: MESSAGE_TYPES.PLUGIN_READY,
      frames,
      initialCode,
      timestamp: Date.now()
    });
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
          
        default:
          this.logger.warn('Unknown message type received');
      }
    } catch (error) {
      this.errorHandler.handleGeneralError(error as Error, 'message handling');
      this.sendError(error as Error);
    }
  }

  private async executeCode(code: string): Promise<void> {
    const result = await this.codeExecutor.executeCode(code);
    
    this.sendToUI({
      type: MESSAGE_TYPES.EXECUTION_RESULT,
      success: result.success,
      logs: result.logs,
      error: result.error,
      timestamp: Date.now()
    });

    // Save code to current frame if execution was successful
    if (result.success) {
      const currentFrame = this.frameManager.getCurrentFrame();
      if (currentFrame) {
        await this.frameManager.setFrameCode(currentFrame.id, code);
      }
    }
  }

  private async selectFrame(frameId: string): Promise<void> {
    const frame = await this.frameManager.selectFrame(frameId);
    if (frame) {
      const code = await this.frameManager.getFrameCode(frameId);
      
      // Send the code back to UI if frame has saved code
      if (code) {
        this.sendToUI({
          type: MESSAGE_TYPES.PLUGIN_READY,
          frames: this.frameManager.getAvailableFrames(),
          initialCode: code,
          timestamp: Date.now()
        });
      }
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
  }

  private async toggleLock(frameId?: string): Promise<void> {
    await this.frameManager.lockFrame(frameId);
    
    this.sendToUI({
      type: MESSAGE_TYPES.LOCK_STATE_UPDATED,
      isLocked: this.frameManager.isFrameLocked(),
      frameId: frameId,
      timestamp: Date.now()
    });
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
    if (this.autoRefreshEnabled) {
      await this.sendInitialData();
    }
    
    // Update frames list
    await this.refreshFrames();
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
