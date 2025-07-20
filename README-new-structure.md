# Figmata - Restructured Architecture

A Figma plugin for dynamic code-driven design generation with improved architecture and separation of concerns.

## Project Structure

```
/
├── src/                          # Backend Plugin Code
│   ├── main.ts                   # Main plugin entry point
│   ├── services/                 # Business logic services
│   │   ├── figma-manager.ts      # Figma API interactions
│   │   ├── code-executor.ts      # Code execution logic
│   │   ├── frame-manager.ts      # Frame selection/management
│   │   └── ai-service.ts         # AI prompt processing
│   └── utils/                    # Utility functions
│       ├── logger.ts             # Logging utilities
│       ├── error-handler.ts      # Error handling
│       └── validators.ts         # Input validation
│
├── ui-src/                       # Frontend UI Code
│   ├── index.html                # Main UI file
│   ├── styles/                   # CSS organization
│   │   ├── main.css             # Main styles
│   │   ├── toolbar.css          # Toolbar styles
│   │   └── editor.css           # Monaco editor styles
│   └── scripts/                  # TypeScript organization
│       ├── main.ts              # Main UI controller
│       ├── components/          # UI components
│       │   ├── toolbar.ts       # Toolbar functionality
│       │   └── editor.ts        # Monaco editor wrapper
│       └── services/            # Frontend services
│           ├── message-handler.ts  # Plugin message handling
│           ├── message-sender.ts   # Send messages to plugin
│           ├── state-manager.ts    # UI state management
│           └── ui-updater.ts       # UI update logic
│
├── shared/                       # Shared Code
│   ├── types/                    # Common type definitions
│   │   └── messages.ts           # Message interfaces
│   └── constants/                # Shared constants
│       └── message-types.ts      # Message type constants
│
└── dist/                         # Build Output
    ├── code.js                   # Built plugin code
    ├── ui.js                     # Built UI JavaScript
    └── ui.html                   # Built UI HTML
```

## Key Features

### Backend (Plugin)
- **Modular Services**: Separate concerns for Figma API, code execution, frame management, and AI
- **Error Handling**: Centralized error handling with line number detection
- **Type Safety**: Full TypeScript support with shared interfaces
- **Async Operations**: Proper async/await patterns for Figma API calls

### Frontend (UI)
- **Monaco Editor**: Full-featured code editor with syntax highlighting and autocomplete
- **State Management**: Centralized state management with reactive updates
- **Component Architecture**: Modular UI components (Toolbar, Editor)
- **Message System**: Type-safe communication between UI and plugin

### Shared
- **Type Definitions**: Shared interfaces for plugin-UI communication
- **Constants**: Centralized message type constants
- **Path Aliases**: Clean import paths with TypeScript path mapping

## Development

### Build Commands
```bash
npm run build    # Production build
npm run dev      # Development build
npm run watch    # Development build with file watching
```

### Key Responsibilities

#### Plugin (Backend)
- Figma API interactions
- Code execution and safety
- Frame selection and locking
- Data persistence
- AI prompt processing

#### UI (Frontend)
- User interface and interactions
- Code editing experience
- Console output display
- State visualization
- Message routing

## Architecture Benefits

1. **Separation of Concerns**: Clear boundaries between backend logic and UI
2. **Type Safety**: Shared types ensure consistent communication
3. **Modularity**: Easy to add new features without affecting existing code
4. **Testability**: Services can be tested independently
5. **Maintainability**: Well-organized code structure
6. **Scalability**: Easy to extend with new features

## Message Flow

```
UI Component → MessageSender → Plugin Controller → Service → Figma API
                    ↓
UI Component ← MessageHandler ← Plugin Controller ← Service Response
```

This architecture provides a solid foundation for building complex Figma plugins with maintainable, scalable code.
