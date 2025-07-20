// Import CSS files to bundle them
import '../styles/main.css';
import '../styles/toolbar.css';
import '../styles/editor.css';

// Import CSS files so they get bundled and inlined
import '../styles/main.css';
import '../styles/toolbar.css';
import '../styles/editor.css';

import { Toolbar } from './components/toolbar';
import { Editor } from './components/editor';
import { MessageHandler } from './services/message-handler';
import { MessageSender } from './services/message-sender';
import { StateManager } from './services/state-manager';
import { UIUpdater } from './services/ui-updater';

class UIController {
  private toolbar!: Toolbar;
  private editor!: Editor;
  private messageHandler: MessageHandler;
  private messageSender: MessageSender;
  private stateManager: StateManager;
  private uiUpdater: UIUpdater;

  constructor() {
    this.stateManager = new StateManager();
    this.messageSender = new MessageSender();
    this.uiUpdater = new UIUpdater(this.stateManager);
    this.messageHandler = new MessageHandler(this.stateManager, this.uiUpdater);
    
    this.initializeComponents();
    this.setupMessageHandling();
    this.setupStateSubscriptions();
    
    console.log('UI Controller initialized');
  }

  private initializeComponents(): void {
    this.toolbar = new Toolbar(this.stateManager, this.messageSender);
    this.editor = new Editor(this.stateManager);
    
    // Handle window resize for editor layout
    window.addEventListener('resize', () => {
      this.editor.layout();
    });
  }

  private setupMessageHandling(): void {
    // Listen for messages from the plugin
    window.addEventListener('message', (event) => {
      if (event.data.pluginMessage) {
        this.messageHandler.handleMessage(event.data.pluginMessage);
      }
    });
    
    // Request initial data from plugin
    this.messageSender.getFrames();
  }

  private setupStateSubscriptions(): void {
    // Subscribe to state changes
    this.stateManager.subscribe((state) => {
      // Update UI components based on state changes
      this.uiUpdater.updateRunButton(state.executionState);
      this.uiUpdater.updateLockButton(state.isLocked);
      this.uiUpdater.updateAutoRefreshButton(state.autoRefreshEnabled);
      
      // Update dropdown to show effective frame (locked or selected)
      const effectiveFrameId = this.stateManager.getEffectiveFrameId();
      const dropdown = document.getElementById('frameDropdown') as HTMLSelectElement;
      if (dropdown && effectiveFrameId) {
        dropdown.value = effectiveFrameId;
      }
      
      // Update editor if code changed externally
      if (this.editor.getValue() !== state.currentCode) {
        this.editor.setValue(state.currentCode);
      }
    });
  }
}

// Initialize the UI when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    new UIController();
  });
} else {
  new UIController();
}
