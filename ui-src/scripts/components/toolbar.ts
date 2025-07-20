import { StateManager } from '../services/state-manager';
import { MessageSender } from '../services/message-sender';

export class Toolbar {
  private stateManager: StateManager;
  private messageSender: MessageSender;
  private elements!: {
    runButton: HTMLButtonElement;
    frameDropdown: HTMLSelectElement;
    lockButton: HTMLButtonElement;
    autoRefreshButton: HTMLButtonElement;
    promptInput: HTMLInputElement;
    generateButton: HTMLButtonElement;
    clearConsole: HTMLButtonElement;
  };

  constructor(stateManager: StateManager, messageSender: MessageSender) {
    this.stateManager = stateManager;
    this.messageSender = messageSender;
    this.initializeElements();
    this.setupEventListeners();
  }

  private initializeElements(): void {
    this.elements = {
      runButton: document.getElementById('runButton') as HTMLButtonElement,
      frameDropdown: document.getElementById('frameDropdown') as HTMLSelectElement,
      lockButton: document.getElementById('lockButton') as HTMLButtonElement,
      autoRefreshButton: document.getElementById('autoRefreshButton') as HTMLButtonElement,
      promptInput: document.getElementById('promptInput') as HTMLInputElement,
      generateButton: document.getElementById('generateButton') as HTMLButtonElement,
      clearConsole: document.getElementById('clearConsole') as HTMLButtonElement
    };
  }

  private setupEventListeners(): void {
    // Run button
    this.elements.runButton.addEventListener('click', () => {
      this.handleRunCode();
    });

    // Frame dropdown
    this.elements.frameDropdown.addEventListener('change', (e) => {
      const frameId = (e.target as HTMLSelectElement).value;
      if (frameId) {
        this.handleFrameSelection(frameId);
      }
    });

    // Lock button
    this.elements.lockButton.addEventListener('click', () => {
      this.handleToggleLock();
    });

    // Auto-refresh button
    this.elements.autoRefreshButton.addEventListener('click', () => {
      this.handleToggleAutoRefresh();
    });

    // Generate button
    this.elements.generateButton.addEventListener('click', () => {
      this.handleGenerateCode();
    });

    // Prompt input - enter key
    this.elements.promptInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        this.handleGenerateCode();
      }
    });

    // Clear console button
    this.elements.clearConsole.addEventListener('click', () => {
      this.handleClearConsole();
    });
  }

  private handleRunCode(): void {
    const code = this.stateManager.getCurrentCode();
    if (!code.trim()) {
      console.warn('No code to run');
      return;
    }

    this.stateManager.setExecutionState('running');
    this.messageSender.runCode(code);
  }

  private handleFrameSelection(frameId: string): void {
    this.stateManager.setSelectedFrame(frameId);
    this.messageSender.selectFrame(frameId);
  }

  private handleToggleLock(): void {
    const selectedFrameId = this.stateManager.getSelectedFrameId();
    const isCurrentlyLocked = this.stateManager.isFrameLocked();
    
    if (isCurrentlyLocked) {
      // Unlock
      this.messageSender.toggleLock();
    } else if (selectedFrameId) {
      // Lock to selected frame
      this.messageSender.toggleLock(selectedFrameId);
    } else {
      console.warn('No frame selected to lock');
    }
  }

  private handleToggleAutoRefresh(): void {
    this.messageSender.toggleAutoRefresh();
  }

  private handleGenerateCode(): void {
    const prompt = this.elements.promptInput.value.trim();
    if (!prompt) {
      console.warn('No prompt provided');
      return;
    }

    this.messageSender.sendAIPrompt(prompt);
    this.elements.promptInput.value = ''; // Clear input after sending
  }

  private handleClearConsole(): void {
    const consoleOutput = document.getElementById('consoleOutput');
    if (consoleOutput) {
      consoleOutput.innerHTML = '';
    }
  }
}
