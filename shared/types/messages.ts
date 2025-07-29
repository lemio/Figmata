export interface BaseMessage {
  type: string;
  timestamp?: number;
}

export interface RunCodeMessage extends BaseMessage {
  type: 'RUN_CODE';
  code: string;
}

export interface FrameSelectedMessage extends BaseMessage {
  type: 'FRAME_SELECTED';
  frameId: string;
}

export interface AIPromptMessage extends BaseMessage {
  type: 'AI_PROMPT';
  prompt: string;
}

export interface GetFramesMessage extends BaseMessage {
  type: 'GET_FRAMES';
}

export interface ToggleLockMessage extends BaseMessage {
  type: 'TOGGLE_LOCK';
  frameId?: string;
}

export interface ToggleAutoRefreshMessage extends BaseMessage {
  type: 'TOGGLE_AUTO_REFRESH';
}

export interface RunExampleMessage extends BaseMessage {
  type: 'RUN_EXAMPLE';
  exampleName: string;
}

export interface ExecutionResultMessage extends BaseMessage {
  type: 'EXECUTION_RESULT';
  success: boolean;
  logs?: LogEntry[];
  error?: string;
}

export interface FramesUpdatedMessage extends BaseMessage {
  type: 'FRAMES_UPDATED';
  frames: FrameInfo[];
}

export interface PluginReadyMessage extends BaseMessage {
  type: 'PLUGIN_READY';
  frames: FrameInfo[];
  initialCode?: string;
  selectedFrameId?: string;
}

export interface LockStateUpdatedMessage extends BaseMessage {
  type: 'LOCK_STATE_UPDATED';
  isLocked: boolean;
  frameId?: string;
}

export interface AutoRefreshStateUpdatedMessage extends BaseMessage {
  type: 'AUTO_REFRESH_STATE_UPDATED';
  isEnabled: boolean;
}

export interface UpdateFrameListMessage extends BaseMessage {
  type: 'updateFrameList';
  frames: FrameInfo[];
}

export interface SetCurrentFrameMessage extends BaseMessage {
  type: 'setCurrentFrame';
  frame: FrameInfo;
}

export interface LogEntry {
  message: string;
  line?: number;
  type: 'log' | 'error' | 'timing' | 'success';
  timestamp?: number;
}

export interface FrameInfo {
  id: string;
  name: string;
  hasCode: boolean;
}

export type PluginMessage = 
  | RunCodeMessage 
  | FrameSelectedMessage 
  | AIPromptMessage
  | GetFramesMessage
  | ToggleLockMessage
  | ToggleAutoRefreshMessage
  | RunExampleMessage;

export type UIMessage = 
  | ExecutionResultMessage 
  | FramesUpdatedMessage
  | PluginReadyMessage
  | LockStateUpdatedMessage
  | AutoRefreshStateUpdatedMessage
  | UpdateFrameListMessage
  | SetCurrentFrameMessage
  | LogEntry;
