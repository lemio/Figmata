import { StateManager } from '../services/state-manager';
import { MessageSender } from '../services/message-sender';
import { UIUpdater } from '../services/ui-updater';

export class Toolbar {
  private stateManager: StateManager;
  private messageSender: MessageSender;
  private uiUpdater: UIUpdater;
  private elements!: {
    runButton: HTMLButtonElement;
    barChartButton: HTMLButtonElement;
    frameDropdown: HTMLSelectElement;
    lockButton: HTMLButtonElement;
    autoRefreshButton: HTMLButtonElement;
    promptInput: HTMLInputElement;
  };

  constructor(stateManager: StateManager, messageSender: MessageSender, uiUpdater: UIUpdater) {
    this.stateManager = stateManager;
    this.messageSender = messageSender;
    this.uiUpdater = uiUpdater;
    this.initializeElements();
    this.setupEventListeners();
  }

  private initializeElements(): void {
    this.elements = {
      runButton: document.getElementById('runButton') as HTMLButtonElement,
      barChartButton: document.getElementById('barChartButton') as HTMLButtonElement,
      frameDropdown: document.getElementById('frameDropdown') as HTMLSelectElement,
      lockButton: document.getElementById('lockButton') as HTMLButtonElement,
      autoRefreshButton: document.getElementById('autoRefreshButton') as HTMLButtonElement,
      promptInput: document.getElementById('promptInput') as HTMLInputElement
    };

    // Check for missing elements
    for (const [key, element] of Object.entries(this.elements)) {
      if (!element) {
        console.error(`Toolbar element not found: ${key}`);
      }
    }
  }

  private setupEventListeners(): void {
    // Run button
    if (this.elements.runButton) {
      this.elements.runButton.addEventListener('click', () => {
        this.handleRunCode();
      });
    }

    // Bar Chart example button
    if (this.elements.barChartButton) {
      this.elements.barChartButton.addEventListener('click', () => {
        this.handleRunBarChart();
      });
    }

    // Frame dropdown
    if (this.elements.frameDropdown) {
      this.elements.frameDropdown.addEventListener('change', (e) => {
        const frameId = (e.target as HTMLSelectElement).value;
        if (frameId) {
          this.handleFrameSelection(frameId);
        }
      });
    }

    // Lock button
    if (this.elements.lockButton) {
      this.elements.lockButton.addEventListener('click', () => {
        this.handleToggleLock();
      });
    }

    // Auto-refresh button
    if (this.elements.autoRefreshButton) {
      this.elements.autoRefreshButton.addEventListener('click', () => {
        this.handleToggleAutoRefresh();
      });
    }
  }

  private handleRunCode(): void {
    const code = this.stateManager.getCurrentCode();
    if (!code.trim()) {
      console.warn('No code to run');
      return;
    }

    // Clear inline logs from previous execution
    this.uiUpdater.clearAllInlineLogs();
    
    this.stateManager.setExecutionState('running');
    this.messageSender.runCode(code);
  }

  private handleRunBarChart(): void {
    console.log('Running bar chart example...');
    this.messageSender.runExample('barChart');
  }

  private handleFrameSelection(frameId: string): void {
    this.stateManager.setSelectedFrame(frameId);
    this.messageSender.selectFrame(frameId);
    
    // Update dropdown immediately to prevent showing "Select Frame..."
    const dropdown = this.elements.frameDropdown;
    if (dropdown && frameId) {
      dropdown.value = frameId;
    }
  }

  private handleToggleLock(): void {
    const isCurrentlyLocked = this.stateManager.isFrameLocked();
    const effectiveFrameId = this.stateManager.getEffectiveFrameId();
    
    if (isCurrentlyLocked) {
      // Unlock
      this.stateManager.setLockState(false);
      this.messageSender.toggleLock();
    } else if (effectiveFrameId) {
      // Lock to currently effective frame (selected frame)
      this.stateManager.setLockState(true, effectiveFrameId);
      this.messageSender.toggleLock(effectiveFrameId);
    } else {
      console.warn('No frame selected to lock');
    }
  }

  private handleToggleAutoRefresh(): void {
    const currentState = this.stateManager.isAutoRefreshEnabled();
    const newState = !currentState;
    
    // Update local state immediately for responsive UI
    this.stateManager.setAutoRefreshState(newState);
    
    // Send message to plugin
    this.messageSender.toggleAutoRefresh();
    
    console.log(`Auto-refresh ${newState ? 'enabled' : 'disabled'}`);
  }
}
