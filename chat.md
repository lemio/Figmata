lemio: Give the Type definition for this function

GitHub Copilot: Here's the type definition for the `parseTSV` function:

````typescript
type ParseTSVFunction = (tsvString: string) => Record<string, string>[];
```

This type definition indicates that:
- The function takes one parameter `tsvString` of type `string`
- It returns an array of objects where each object has string keys and string values (`Record<string, string>[]`)

If you want to be more specific about the return type, you could also define it as:

````typescript
type TSVRow = Record<string, string>;
type ParseTSVFunction = (tsvString: string) => TSVRow[];
```

This makes it clearer that each element in the returned array represents a row from the TSV data.

lemio: What would be the best way to do this:

* Evaluating code given by the user
* Adding libraries functions to this editor 
* Allowing the user to interact with the Figma API without having the risk of breaking it

GitHub Copilot: Based on your code, here are the best approaches for safely evaluating user code while providing library functions and Figma API access:

## 1. Replace `eval()` with a Safe Code Execution Strategy

````typescript
// Replace the eval() call with Function constructor for better control
function executeUserCode(userCode: string, context: any) {
  try {
    // Create a new function with controlled scope
    const wrappedCode = `
      return (async function() {
        ${userCode}
      })();
    `;
    
    const executorFunction = new Function(...Object.keys(context), wrappedCode);
    return executorFunction(...Object.values(context));
  } catch (error) {
    throw error;
  }
}
```

## 2. Create a Safe API Wrapper

````typescript
class SafeFigmaAPI {
  private frame: FrameNode;
  private originalChild: SceneNode;

  constructor(frame: FrameNode) {
    this.frame = frame;
    this.originalChild = frame.children[0];
  }

  // Safe methods that can't break the plugin
  clone() {
    return this.originalChild.clone();
  }

  appendChild(node: SceneNode) {
    this.frame.appendChild(node);
  }

  // Prevent direct access to dangerous methods
  loadFont(font: FontName) {
    return figma.loadFontAsync(font);
  }

  // Add logging that goes through your UI
  log(...args: any[]) {
    figma.ui.postMessage({
      type: 'log',
      message: args.map(arg => (typeof arg === 'object' ? JSON.stringify(arg) : arg)).join(' '),
    });
  }
}
```

## 3. Enhanced Library Functions

````typescript
const createSafeContext = (frame: FrameNode) => {
  const safeAPI = new SafeFigmaAPI(frame);
  
  return {
    // Your existing functions
    parseTSV: (tsvText: string) => {
      const lines = tsvText.trim().split('\n');
      if (lines.length === 0) return [];

      const headers = lines[0].split('\t');
      const data: Record<string, Record<string, string>> = {};

      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split('\t');
        const row: Record<string, string> = {};

        for (let j = 0; j < headers.length; j++) {
          row[headers[j]] = values[j] || "";
        }
        data[values[0]] = row;
      }

      return data;
    },

    delay: (ms: number) => new Promise(resolve => setTimeout(resolve, ms)),

    // Safe Figma API methods
    FigmaFrame: frame,
    FirstChild: frame.children[0],
    
    // Controlled API methods
    clone: () => safeAPI.clone(),
    appendChild: (node: SceneNode) => safeAPI.appendChild(node),
    loadFont: (font: FontName) => safeAPI.loadFont(font),
    console: { log: (...args: any[]) => safeAPI.log(...args) },

    // Utility functions
    Math,
    String,
    Number,
    Array,
    Object,
  };
};
```

## 4. Updated Message Handler with Safe Execution

````typescript
figma.ui.onmessage = async (msg: {code: string}) => {
  const selection: any = figma.currentPage.selection[0];
  selection.setPluginData('code', msg.code);
  
  figma.ui.postMessage({
    type: 'error',
    error: '',
  });

  const debouncedFunction = debounce(async () => {
    try {
      // Load fonts first
      const fonts = [...new Set(selection.findAll((node: any) => node.type === "TEXT")
        .map((node: any) => node.fontName.family + '***' + node.fontName.style))]
        .map(font => {
          const [family, style] = font.split('***');
          return { family, style };
        });

      for (const font of fonts) {
        await figma.loadFontAsync({ family: font.family, style: font.style });
      }

      // Create safe execution context
      const context = createSafeContext(selection);
      
      // Clean up existing children (except first)
      const originalChildren = selection.children;
      originalChildren.slice(1).forEach((child: any) => {
        child.remove();
      });

      // Execute user code safely
      await executeUserCode(msg.code, context);

    } catch (error: any) {
      figma.ui.postMessage({
        type: 'error',
        error: String(error),
        line: error.lineNumber || 0,
      });
    }
  }, 100);

  debouncedFunction();
};
```

## 5. Additional Safety Measures

````typescript
// Add timeout protection
function executeWithTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) => 
      setTimeout(() => reject(new Error('Code execution timeout')), timeoutMs)
    )
  ]);
}

// Usage in your debounced function:
await executeWithTimeout(executeUserCode(msg.code, context), 5000);
```

## Key Benefits:

1. **Safety**: No direct `eval()`, controlled API access
2. **Error Handling**: Better error reporting with line numbers
3. **API Control**: Users can't access dangerous Figma methods
4. **Performance**: Timeout protection prevents infinite loops
5. **Extensibility**: Easy to add new library functions to the context

This approach gives users powerful capabilities while maintaining plugin stability and security.


Make use of the local Deepseek model for the prompt text: 

The API for using it is this:
curl http://localhost:1234/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "model": "deepseek-r1-distill-qwen-32b",
    "messages": [
      { "role": "system", "content": "Always answer in rhymes. Today is Thursday" },
      { "role": "user", "content": "What day is it today?" }
    ],
    "temperature": 0.7,
    "max_tokens": -1,
    "stream": false
}'

Make sure to add the nessecary prompts to get runnable JS output also include the current code and the structure of the current selection when running the prompt. 

```js

element._resize(width,height)


//Text based functions:
element._setText(child,text)

element.setFill()

element.setFillColor(color)
element.setStrokeColor(color)
element.setStrokeWidth(width)


element.setProperty(name,value)
element.getProperty(name)

element.child(name)

element.rotate(angle)

element.move(x,y)

function _resize(width, height) {
  self = this;
  this._width = width;
  this._height = height;
  this._updateSize();
}


```
