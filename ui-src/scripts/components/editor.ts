import { StateManager } from '../services/state-manager';
import { TypeDefinitionsService } from '../services/type-definitions';

declare global {
  interface Window {
    monaco: any;
    monacoEditor: any;
    inlineLogsData: Map<number, string>;
  }
}

export class Editor {
  private stateManager: StateManager;
  private editor: any;
  private isInitialized = false;
  private autoRefreshTimer: number | null = null;
  private readonly autoRefreshDelay = 500; // 1 second debounce

  constructor(stateManager: StateManager) {
    this.stateManager = stateManager;
    this.initializeMonaco();
  }

  private async initializeMonaco(): Promise<void> {
    try {
      // Wait for Monaco to load
      if (typeof window.monaco === 'undefined') {
        await this.loadMonaco();
      }

      const container = document.getElementById('editor');
      if (!container) {
        throw new Error('Editor container not found');
      }

      // Create Monaco editor
      this.editor = window.monaco.editor.create(container, {
        value: '',
        language: 'javascript',
        theme: 'vs',
        fontSize: 13,
        lineHeight: 20,
        automaticLayout: true,
        minimap: { enabled: false },
        scrollBeyondLastLine: false,
        wordWrap: 'on',
        renderWhitespace: 'boundary',
        bracketPairColorization: { enabled: true },
        suggest: {
          showKeywords: true,
          showSnippets: true,
          showFunctions: true,
          showVariables: true
        },
        quickSuggestions: {
          other: true,
          comments: false,
          strings: false
        }
      });

      // Set up event listeners
      this.setupEventListeners();

      // Add custom completions
      this.setupCompletions();

      // Add extra type definitions for better IntelliSense
      this.setupTypeDefinitions();

      // Setup inlay hints for inline logs
      this.setupInlayHints();

      // Store reference globally for other components
      window.monacoEditor = this.editor;
      
      this.isInitialized = true;
      console.log('Monaco editor initialized successfully');

    } catch (error) {
      console.error('Failed to initialize Monaco editor:', error);
    }
  }

  private loadMonaco(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (window.monaco) {
        resolve();
        return;
      }

      // Monaco loader should already be loaded via script tag
      if (typeof (window as any).require === 'undefined') {
        reject(new Error('Monaco loader not found'));
        return;
      }

      (window as any).require.config({
        paths: {
          'vs': 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.52.2/min/vs'
        }
      });

      (window as any).require(['vs/editor/editor.main'], () => {
        resolve();
      }, reject);
    });
  }

  private setupEventListeners(): void {
    if (!this.editor) return;

    // Listen for content changes
    this.editor.onDidChangeModelContent(() => {
      const code = this.editor.getValue();
      this.stateManager.setCurrentCode(code);
      
      // Trigger autorefresh if enabled
      this.scheduleAutoRefresh();
    });

    // Listen for key combinations
    this.editor.addCommand(window.monaco.KeyMod.CtrlCmd | window.monaco.KeyCode.Enter, () => {
      // Trigger code execution on Ctrl/Cmd + Enter
      const runButton = document.getElementById('runButton') as HTMLButtonElement;
      if (runButton && !runButton.disabled) {
        runButton.click();
      }
    });
  }

  private setupCompletions(): void {
    if (!window.monaco) return;

    // Register custom completion provider for Figma API
    window.monaco.languages.registerCompletionItemProvider('javascript', {
      provideCompletionItems: (model: unknown, position: unknown) => {
        const word = (model as any).getWordUntilPosition(position);
        const range = {
          startLineNumber: (position as any).lineNumber,
          endLineNumber: (position as any).lineNumber,
          startColumn: word.startColumn,
          endColumn: word.endColumn
        };

        return {
          suggestions: [
            {
              label: 'FigmaFrame',
              kind: window.monaco.languages.CompletionItemKind.Variable,
              insertText: 'FigmaFrame',
              documentation: 'The currently selected frame',
              range: range
            },
            {
              label: 'FirstChild',
              kind: window.monaco.languages.CompletionItemKind.Variable,
              insertText: 'FirstChild',
              documentation: 'The first child of the selected frame',
              range: range
            },
            {
              label: '_setText',
              kind: window.monaco.languages.CompletionItemKind.Function,
              insertText: '_setText(${1:element}, "${2:childName}", "${3:text}")',
              insertTextRules: window.monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
              documentation: 'Set text content of a named child element',
              range: range
            },
            {
              label: '_resize',
              kind: window.monaco.languages.CompletionItemKind.Function,
              insertText: '_resize(${1:element}, ${2:width}, ${3:height})',
              insertTextRules: window.monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
              documentation: 'Resize an element to specified dimensions',
              range: range
            },
            {
              label: 'forEach loop',
              kind: window.monaco.languages.CompletionItemKind.Snippet,
              insertText: [
                'data.forEach((${1:item}, ${2:index}) => {',
                '\tlet element = FirstChild.clone();',
                '\t$0',
                '\tFigmaFrame.appendChild(element);',
                '});'
              ].join('\n'),
              insertTextRules: window.monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
              documentation: 'Create a forEach loop for data processing',
              range: range
            }
          ]
        };
      }
    });
  }

  private setupTypeDefinitions(): void {
    if (!window.monaco) return;

    try {
      // Add Figma API types, D3 types, and custom helper types
      const allTypes = TypeDefinitionsService.getAllTypeDefinitions();
      
      window.monaco.languages.typescript.javascriptDefaults.addExtraLib(
        allTypes,
        'ts:figmata-types.d.ts'
      );

      // Also add types to TypeScript if available
      window.monaco.languages.typescript.typescriptDefaults.addExtraLib(
        allTypes,
        'ts:figmata-types.d.ts'
      );

      console.log('Monaco editor type definitions loaded successfully');
    } catch (error) {
      console.warn('Failed to load type definitions:', error);
    }
  }

  private setupInlayHints(): void {
    if (!window.monaco) return;

    // Register inlay hints provider for inline logs
    window.monaco.languages.registerInlayHintsProvider('javascript', {
      provideInlayHints: (model: any, range: any, _token: any) => {
        const logsData = window.inlineLogsData;
        if (!logsData) {
          console.log('No inline logs data available');
          return { hints: [] };
        }

        console.log('Providing inlay hints for range:', range, 'with data:', logsData);
        const hints: any[] = [];
        const lineCount = model.getLineCount();

        // Iterate through all lines in the current range
        for (let lineNumber = range.startLineNumber; lineNumber <= Math.min(range.endLineNumber, lineCount); lineNumber++) {
          if (logsData.has(lineNumber)) {
            const message = logsData.get(lineNumber);
            const lineLength = model.getLineLength(lineNumber);
            
            console.log(`Adding hint for line ${lineNumber}: ${message}`);
            hints.push({
              position: {
                lineNumber: lineNumber,
                column: lineLength + 1
              },
              label: ` ➤ ${(message ?? '').split('\n').join(';')}`,
              kind: window.monaco.languages.InlayHintKind.Other,
              tooltip: `${message}`,
              paddingLeft: true,
              // Custom styling for the hint
              textEdits: undefined
            });
          }
        }

        console.log(`Returning ${hints.length} hints`);
        return { hints };
      }
    });

    console.log('Monaco inlay hints provider registered');
  }

  private scheduleAutoRefresh(): void {
    // Clear existing timer
    if (this.autoRefreshTimer) {
      clearTimeout(this.autoRefreshTimer);
    }

    // Only schedule if autorefresh is enabled
    if (!this.stateManager.isAutoRefreshEnabled()) {
      return;
    }

    // Debounce the execution
    this.autoRefreshTimer = window.setTimeout(() => {
      this.triggerAutoRefresh();
    }, this.autoRefreshDelay);
  }

  private triggerAutoRefresh(): void {
    const code = this.getValue();
    if (!code.trim()) {
      return;
    }

    // Don't trigger autorefresh if code is currently running
    if (this.stateManager.getExecutionState() === 'running') {
      return;
    }

    // Trigger the run button
    const runButton = document.getElementById('runButton') as HTMLButtonElement;
    if (runButton && !runButton.disabled) {
      console.log('Auto-refresh triggered');
      runButton.click();
    }
  }

  setValue(code: string): void {
    if (this.editor && this.isInitialized) {
      this.editor.setValue(code);
    }
  }

  getValue(): string {
    if (this.editor && this.isInitialized) {
      return this.editor.getValue();
    }
    return '';
  }

  focus(): void {
    if (this.editor && this.isInitialized) {
      this.editor.focus();
    }
  }

  layout(): void {
    if (this.editor && this.isInitialized) {
      this.editor.layout();
    }
  }

  clearAutoRefreshTimer(): void {
    if (this.autoRefreshTimer) {
      clearTimeout(this.autoRefreshTimer);
      this.autoRefreshTimer = null;
    }
  }
}
