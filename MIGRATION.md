# Migration Guide: From Old to New Architecture

This document explains how the original Figmata plugin code has been restructured for better maintainability and scalability.

## What Changed

### File Structure Migration

**Before:**
```
plugin-src/code.ts          # All plugin logic in one file
ui-src/ui.html             # UI with inline scripts
```

**After:**
```
src/                       # Structured backend code
├── main.ts               # Plugin entry point  
├── services/             # Business logic
├── utils/                # Utilities
ui-src/                   # Structured frontend code
├── index.html            # Clean HTML structure
├── scripts/              # Organized TypeScript
├── styles/               # Separated CSS
shared/                   # Common code
├── types/                # Shared interfaces
├── constants/            # Shared constants
```

### Code Organization

#### Original `plugin-src/code.ts` Split Into:

1. **`src/main.ts`** - Main plugin controller
   - Plugin initialization
   - Message handling coordination
   - Event listeners

2. **`src/services/frame-manager.ts`** - Frame operations
   - `getFramesWithFigmataData()` → `getAvailableFrames()`
   - `lockedFrame` management
   - Frame selection logic

3. **`src/services/code-executor.ts`** - Code execution
   - Safe code execution with error handling
   - Console logging capture
   - Line number error detection

4. **`src/services/figma-manager.ts`** - Figma API interactions
   - Template code generation
   - UI management
   - Selection handling

5. **`src/services/ai-service.ts`** - AI integration
   - Prompt processing
   - Code generation from prompts

6. **`src/utils/`** - Utility functions
   - `logger.ts` - Centralized logging
   - `error-handler.ts` - Error processing
   - `validators.ts` - Input validation

### UI Improvements

#### Original UI Issues:
- HTML with inline SVG and scripts
- No proper styling structure
- Basic functionality

#### New UI Benefits:
- **Monaco Editor**: Professional code editing experience
- **Modular Components**: Toolbar, Editor components
- **CSS Organization**: Separated styles for maintainability
- **State Management**: Reactive UI updates
- **Type Safety**: TypeScript throughout

### Message System Enhancement

#### Before:
```javascript
figma.ui.onmessage = async (msg) => {
  console.log(msg);
}
```

#### After:
```typescript
// Typed message interfaces
interface RunCodeMessage extends BaseMessage {
  type: 'RUN_CODE';
  code: string;
}

// Structured message handling
private async handleMessage(message: PluginMessage): Promise<void> {
  switch (message.type) {
    case MESSAGE_TYPES.RUN_CODE:
      await this.executeCode(message.code);
      break;
    // ... other cases
  }
}
```

## Key Benefits of Restructuring

### 1. **Maintainability**
- **Before**: 984 lines in one file
- **After**: Logical separation across multiple focused files

### 2. **Type Safety**
- **Before**: Minimal typing, prone to runtime errors
- **After**: Full TypeScript with shared interfaces

### 3. **Error Handling**
- **Before**: Basic error catching
- **After**: Centralized error handling with context

### 4. **Testing**
- **Before**: Difficult to test individual functions
- **After**: Services can be tested independently

### 5. **Feature Addition**
- **Before**: Add to monolithic file
- **After**: Create new service or extend existing

## Preserved Functionality

All original features are preserved:

- ✅ Frame selection and management
- ✅ Code execution with error handling
- ✅ Template code generation
- ✅ Plugin data storage
- ✅ Relaunch commands
- ✅ Auto-refresh functionality
- ✅ Frame locking

## New Features Added

- 🆕 Monaco editor with autocomplete
- 🆕 AI prompt integration
- 🆕 Better console with timestamps
- 🆕 Improved error reporting
- 🆕 Modular UI components
- 🆕 Type-safe message system

## Development Workflow

### Before:
```bash
npm run build    # Build single file
```

### After:
```bash
npm run build    # Build optimized production bundle
npm run dev      # Development build
npm run watch    # Watch mode for development
```

## Breaking Changes

### For Plugin Developers:
- Entry point changed from `plugin-src/code.ts` to `src/main.ts`
- Webpack configuration updated for new structure
- TypeScript configuration includes new paths

### For End Users:
- **No breaking changes** - All functionality preserved
- Enhanced user experience with better editor
- Improved error messages and logging

## Migration Benefits Summary

1. **Code Quality**: Better organized, more maintainable
2. **Developer Experience**: Better tooling, debugging, testing
3. **User Experience**: Professional editor, better error handling
4. **Extensibility**: Easy to add new features
5. **Performance**: Optimized builds with code splitting
6. **Type Safety**: Fewer runtime errors, better IntelliSense

The restructured architecture provides a solid foundation for future development while preserving all existing functionality.
