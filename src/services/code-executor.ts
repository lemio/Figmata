/* eslint-disable no-inner-declarations */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-var */

import { Logger } from '../utils/logger';
import { ErrorHandler } from '../utils/error-handler';
import { InputValidator } from '../utils/validators';
import { LogEntry } from '../../shared/types/messages';
import * as d3 from '../../node_modules/d3';

function getLineNumberFromStack(err: Error): number {
  var stack = err.stack?.toString().split(/\r\n|\n/);
	// Regex to match line and column numbers in the stack trace
	var frameRE = /([0-9]+)\)*$/;
	let lineNumber = null;
  if (stack){
      
	while (stack.length > 1) {
		// Check if the frame matches the pattern
		//var frame1 = stack.shift();
		var frame = stack.shift() || '';
		const match = frameRE.exec(frame);
		if (match) {
			lineNumber = match[1]; // Extract line number
			break; // Exit after finding the second frame
		}
	}
	if (lineNumber) {
		return Number(lineNumber); // Print the extracted line number
	} else {
		console.log("No matching frame found.");
	}
}
return 0;
}

function getUpperLineNumberFromStack(err: Error): number {
  var stack = err.stack?.toString().split(/\r\n|\n/);
	// Regex to match line and column numbers in the stack trace
	var frameRE = /([0-9]+)\)*$/;
	let lineNumber = null;
  if (stack){
      stack.shift(); // Remove the first line which is the error message
	while (stack.length > 1) {
		// Check if the frame matches the pattern
		//var frame1 = stack.shift();
		var frame = stack.shift() || '';
		const match = frameRE.exec(frame);
		if (match) {
			lineNumber = match[1]; // Extract line number
			break; // Exit after finding the second frame
		}
	}
	if (lineNumber) {
		return Number(lineNumber); // Print the extracted line number
	} else {
		console.log("No matching frame found.");
	}
}
return 0;
}

    const dynamicPrependCode = `

/**
 * Resizes a Figma node to the specified width and height while ensuring minimum size constraints
 * and handling constraint-based positioning adjustments.
 *
 * @param node - The Figma node to resize. This can be any object that supports resizing and has constraints.
 * @param width - The desired width for the node. If the width is less than the minimum size, it will be adjusted to the minimum size.
 * @param height - The desired height for the node. If the height is less than the minimum size, it will be adjusted to the minimum size.
 *
 * @remarks
 * - The function ensures that the width and height are at least \`0.01\` to avoid invalid sizes.
 * - If the node has constraints (\`horizontal\` or \`vertical\` set to \`"MAX"\`), the position (\`x\` or \`y\`) of the node is adjusted
 *   to maintain the constraints relative to the new size.
 * - The \`absoluteBoundingBox\` property of the node is used to calculate the size difference for constraint adjustments.
 *
 * @example
 * \`\`\`typescript
 * resize(element, 150, 150);
 * \`\`\`
 */
function _resize(node, width, height) {
  // Ensure minimum size constraints
  const minSize = 0.01;
  const safeWidth = Math.max(width, minSize);
  const safeHeight = Math.max(height, minSize);
  
  // Handle constraint-based positioning
  if (node.constraints) {
    const oldBounds = node.absoluteBoundingBox;
    
    if (oldBounds) {
      if (node.constraints.horizontal === "MAX") {
        const widthDiff = safeWidth - oldBounds.width;
        node.x = node.x - widthDiff;
      }
      
      if (node.constraints.vertical === "MAX") {
        const heightDiff = safeHeight - oldBounds.height;
        node.y = node.y - heightDiff;
      }
    }
  }
  node.resize(safeWidth, safeHeight);
}

function _setText(node, name, text){
  const textNode = node.findChild(x => x.name === name);
  if (textNode && textNode.type === 'TEXT') {
    textNode.characters = String(text);
  } else {
    console.error(\`Text node with name "\${name}" not found or is not a TEXT node.\`);
  }
}
    function print(...args) {
    try {
      figma.ui.postMessage({
        type: 'log',
        message: args.map(arg => (typeof arg === 'object' ? JSON.stringify(arg)
          : arg)).join(' '),
        line: Number(getUpperLineNumberFromStack(new Error()))- Number(dynamicPrependCode.split('\\n').length + 1),
      });
  } catch (error) {
      console.error('Error in print function:', error);
      
    }
  }
        function parseTSV(tsvText) {
  const lines = tsvText.trim().split('\\n');
  if (lines.length === 0) return [];

  const headers = lines[0].split('\\t');
  const data = {};

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split('\\t');
    const row = {};

    for (let j = 1; j<= headers.length; j++) {
      row[headers[j-1]] = values[j]||"";
    }
    data[values[0]] = row;
  }

  return data;
}
        //figmata.init()
    function delay(ms){
      return new Promise(resolve => setTimeout(resolve, ms));
    }
      return (async () =>  {
      let FigmaFrame = figma.currentPage.selection[0];
    //let FigmaFrame = await figma.getNodeByIdAsync('targetFrame.id')
    let FirstChild = FigmaFrame.children[0];
    let fonts = [...new Set(FigmaFrame.findAll(node => node.type === "TEXT").map(node => node.fontName.family + '***' + node.fontName.style))].map(font => {
          const [family, style] = font.split('***');
          console.log(family, style);
          return { family, style }
        })
          console.log("Fonts", fonts)
    try {
      for (const font of fonts) {
        await figma.loadFontAsync({ family: font.family, style: font.style });
      }
      console.log("Fonts loaded");
    } catch (e) {
      console.error("font error", e);
    }
      let originalChildren = FigmaFrame.children
      if (typeof preProcess === 'function') {
        preProcess();
    }else{
    
    originalChildren.slice(1).forEach(child => {
        child.remove();
      });
    }`
export class CodeExecutor {
  private logger: Logger;
  private errorHandler: ErrorHandler;

  constructor() {
    this.logger = new Logger();
    this.errorHandler = new ErrorHandler();
  }

  async executeCode(code: string): Promise<{ success: boolean; logs: LogEntry[]; error?: string }> {
    const logs: LogEntry[] = [];
    
    try {
      // Validate input
      if (!InputValidator.isValidCode(code)) {
        throw new Error('Invalid code provided');
      }

      // Sanitize code
      const sanitizedCode = InputValidator.sanitizeCode(code);
      
      // Add execution context and logging
      const wrappedCode = this.wrapCodeWithContext(sanitizedCode, logs);
      
      this.logger.log('Executing code...');
      const startTime = Date.now();
      
      // Execute the code
      await this.safeExecute(wrappedCode);
      
      const executionTime = Date.now() - startTime;
      
      logs.push({
        type: 'timing',
        message: `Code executed in ${executionTime}ms`,
        timestamp: Date.now()
      });

      logs.push({
        type: 'success',
        message: 'Code execution completed successfully',
        timestamp: Date.now()
      });

      this.logger.success(`Code executed successfully in ${executionTime}ms`);
      
      return { success: true, logs };
      
    } catch (error) {
      const errorInfo = this.errorHandler.handleExecutionError(error as Error);
      
      logs.push({
        type: 'error',
        message: errorInfo.message,
        line: errorInfo.line,
        timestamp: Date.now()
      });
      
      return { 
        success: false, 
        logs, 
        error: errorInfo.message 
      };
    }
  }

  private wrapCodeWithContext(code: string, _logs: LogEntry[]): string {


    return `${dynamicPrependCode}
      ${code}
      if (typeof postProcess === 'function') {
      postProcess();
  }else{
      originalChildren.slice(0,1).forEach(child => {
        console.log(child)
        child.remove();
      });
    }
      preProcess = null;
      postProcess = null;
      
          })()
          

    `;
  }

  private async safeExecute(wrappedCode: string): Promise<void> {
    // Use Function constructor for safer execution than eval
    const context = {
        figma,
        console,
        Promise,
        setTimeout,
        clearTimeout,
        getLineNumberFromStack,
        getUpperLineNumberFromStack,
        dynamicPrependCode,
        d3
      };
      const paramNames = Object.keys(context);
      const paramValues = Object.values(context);

      const executeCode = new Function(...paramNames , wrappedCode);
      console.log('Executing wrapped code with context:', paramNames);
      //executeCode(...paramValues)
    //const executeFunction = new Function(wrappedCode);
    await executeCode(...paramValues);
  }
}
