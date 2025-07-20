import { FrameInfo } from '../../shared/types/messages';
import { Logger } from '../utils/logger';

export class FrameManager {
  private logger: Logger;
  private lockedFrame: FrameNode | null = null;

  constructor() {
    this.logger = new Logger();
  }

  getAvailableFrames(): FrameInfo[] {
    const frames: FrameInfo[] = [];
    
    const searchForFrames = (node: SceneNode) => {
      if (node.type === 'FRAME') {
        const frameNode = node as FrameNode;
        const hasCode = frameNode.getPluginData('code') !== '';
        
        frames.push({
          id: frameNode.id,
          name: frameNode.name,
          hasCode
        });
      }
      
      if ('children' in node) {
        node.children.forEach(searchForFrames);
      }
    };

    figma.currentPage.children.forEach(searchForFrames);
    
    this.logger.log(`Found ${frames.length} frames`);
    return frames;
  }

  async selectFrame(frameId: string): Promise<FrameNode | null> {
    const frame = await figma.getNodeByIdAsync(frameId) as FrameNode;
    
    if (frame && frame.type === 'FRAME') {
      figma.currentPage.selection = [frame];
      this.logger.log(`Selected frame: ${frame.name}`);
      return frame;
    }
    
    this.logger.error(`Frame with ID ${frameId} not found or is not a frame`);
    return null;
  }

  async lockFrame(frameId?: string): Promise<boolean> {
    if (frameId) {
      const frame = await figma.getNodeByIdAsync(frameId) as FrameNode;
      if (frame && frame.type === 'FRAME') {
        this.lockedFrame = frame;
        this.logger.log(`Locked frame: ${frame.name}`);
        return true;
      }
    } else {
      this.lockedFrame = null;
      this.logger.log('Unlocked frame');
      return true;
    }
    
    return false;
  }

  getLockedFrame(): FrameNode | null {
    return this.lockedFrame;
  }

  isFrameLocked(): boolean {
    return this.lockedFrame !== null;
  }

  getCurrentFrame(): FrameNode | null {
    if (this.lockedFrame) {
      return this.lockedFrame;
    }
    
    const selection = figma.currentPage.selection;
    if (selection.length > 0 && selection[0].type === 'FRAME') {
      return selection[0] as FrameNode;
    }
    
    return null;
  }

  async getFrameCode(frameId: string): Promise<string> {
    const frame = await figma.getNodeByIdAsync(frameId) as FrameNode;
    if (frame && frame.type === 'FRAME') {
      return frame.getPluginData('code') || '';
    }
    return '';
  }

  async setFrameCode(frameId: string, code: string): Promise<boolean> {
    const frame = await figma.getNodeByIdAsync(frameId) as FrameNode;
    if (frame && frame.type === 'FRAME') {
      frame.setPluginData('code', code);
      frame.setRelaunchData({'edit': 'Edit code', 'reset': 'Reset code'});
      this.logger.log(`Saved code to frame: ${frame.name}`);
      return true;
    }
    return false;
  }
}
