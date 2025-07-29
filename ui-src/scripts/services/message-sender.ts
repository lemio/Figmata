import { PluginMessage } from '../../../shared/types/messages';

export class MessageSender {
  sendToPlugin(message: PluginMessage): void {
    parent.postMessage({ pluginMessage: message }, '*');
  }

  runCode(code: string): void {
    this.sendToPlugin({
      type: 'RUN_CODE',
      code,
      timestamp: Date.now()
    });
  }

  selectFrame(frameId: string): void {
    this.sendToPlugin({
      type: 'FRAME_SELECTED',
      frameId,
      timestamp: Date.now()
    });
  }

  sendAIPrompt(prompt: string): void {
    this.sendToPlugin({
      type: 'AI_PROMPT',
      prompt,
      timestamp: Date.now()
    });
  }

  getFrames(): void {
    this.sendToPlugin({
      type: 'GET_FRAMES',
      timestamp: Date.now()
    });
  }

  toggleLock(frameId?: string): void {
    this.sendToPlugin({
      type: 'TOGGLE_LOCK',
      frameId,
      timestamp: Date.now()
    });
  }

  toggleAutoRefresh(): void {
    this.sendToPlugin({
      type: 'TOGGLE_AUTO_REFRESH',
      timestamp: Date.now()
    });
  }

  runExample(exampleName: string): void {
    this.sendToPlugin({
      type: 'RUN_EXAMPLE',
      exampleName,
      timestamp: Date.now()
    });
  }
}
