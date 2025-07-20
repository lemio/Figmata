import { FrameInfo } from '../../../shared/types/messages';

export interface UIState {
  frames: FrameInfo[];
  currentCode: string;
  selectedFrameId: string | null;
  isLocked: boolean;
  lockedFrameId: string | null;
  autoRefreshEnabled: boolean;
  executionState: 'normal' | 'running' | 'success' | 'error';
}

export class StateManager {
  private state: UIState = {
    frames: [],
    currentCode: '',
    selectedFrameId: null,
    isLocked: false,
    lockedFrameId: null,
    autoRefreshEnabled: false,
    executionState: 'normal'
  };

  private listeners: Array<(state: UIState) => void> = [];

  getState(): UIState {
    return { ...this.state };
  }

  setState(newState: Partial<UIState>): void {
    this.state = { ...this.state, ...newState };
    this.notifyListeners();
  }

  subscribe(listener: (state: UIState) => void): () => void {
    this.listeners.push(listener);
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => listener(this.state));
  }

  // Convenience methods
  setFrames(frames: FrameInfo[]): void {
    this.setState({ frames });
  }

  setCurrentCode(code: string): void {
    this.setState({ currentCode: code });
  }

  getCurrentCode(): string {
    return this.state.currentCode;
  }

  setSelectedFrame(frameId: string | null): void {
    this.setState({ selectedFrameId: frameId });
  }

  getSelectedFrameId(): string | null {
    return this.state.selectedFrameId;
  }

  setLockState(isLocked: boolean, frameId?: string): void {
    this.setState({ 
      isLocked, 
      lockedFrameId: isLocked ? frameId || null : null 
    });
  }

  isFrameLocked(): boolean {
    return this.state.isLocked;
  }

  setAutoRefreshState(enabled: boolean): void {
    this.setState({ autoRefreshEnabled: enabled });
  }

  isAutoRefreshEnabled(): boolean {
    return this.state.autoRefreshEnabled;
  }

  setExecutionState(state: 'normal' | 'running' | 'success' | 'error'): void {
    this.setState({ executionState: state });
  }

  getExecutionState(): 'normal' | 'running' | 'success' | 'error' {
    return this.state.executionState;
  }
}
