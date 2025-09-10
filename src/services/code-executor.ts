/* eslint-disable no-inner-declarations */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-var */

import { Logger } from '../utils/logger';
import { ErrorHandler } from '../utils/error-handler';
import { InputValidator } from '../utils/validators';
import { LogEntry } from '../../shared/types/messages';
import * as d3 from '../../node_modules/d3';
import {convertArcsToCubics} from '../utils/SVGUtils';
//import d3-sankey
import * as d3Sankey from 'd3-sankey';
// Attach sankey to d3 so you can use d3.sankey syntax
// Map all exported members of d3Sankey to d3 under their own names
Object.keys(d3Sankey).forEach(key => {
  (d3 as any)[key] = (d3Sankey as any)[key];
});


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

uuid = String(Math.round(Math.random()*10000))


function updateOrEnter(name,masterElement=null){
    //If the element already exists on the frame take it
    var element = FigmaFrame.child(name)
    if (!element){
        if (masterElement != null){
            element = masterElement.clone()
        }else{
            //Find a generated element to clone
            element = FigmaFrame.findChild(x => x.getPluginData('gen')!=='')
            
            //If not as a backup find the first element
            if (!element){
                element = FirstChild.clone()
                FirstChild.remove()
            }else{
                element = element.clone()
                }
        }
        element.name = name
    }
    //Update the random UUID to the current one
    element.setPluginData("gen",uuid)
    return element;
}

function removeOldElements(action=(elt)=>elt.remove()){
    FigmaFrame.findAllWithCriteria({
    pluginData: {
        keys: ["gen"]
    }
    }).forEach((elt) => {
        if (elt.getPluginData("gen") != uuid){
            action(elt)
        }
    }
    )
}
    function dataTableToObject(DATA_TABLE_NAME) {
    const dataTable = figma.currentPage.findChild(x => x.name === DATA_TABLE_NAME);
    if (!dataTable) {
      console.error(\`Table "\${DATA_TABLE_NAME}" not found on current page\`);
      throw new Error(\`Table "\${DATA_TABLE_NAME}" not found\`);
    }
  if (dataTable.type !== 'TABLE') return false;
  
  const keys = [];
  for (let x = 0; x < dataTable.numColumns; x++) {
    keys.push(dataTable.cellAt(0, x).text.characters.trim());
  }
  
  const rows = [];
  for (let y = 1; y < dataTable.numRows; y++) {
    const row = {};
    for (let x = 0; x < dataTable.numColumns; x++) {
      row[keys[x]] = dataTable.cellAt(y, x).text.characters.trim();
    }
    rows.push(row);
  }
  return rows;
}
function enhanceFigmaAPI() {
  // Define the methods to add
  const strokeMethod = function(color, opacity = 1, weight = 1) {
    this.strokeWeight = weight;
    this.strokes = [{
      "type": "SOLID",
      "visible": true,
      "opacity": opacity,
      "blendMode": "NORMAL",
      "color": figma.util.rgb(color),
      "boundVariables": {}
    }];
    return this;
  };
  
  const fillMethod = function(color, opacity = 1) {
    this.fills = [{
      "type": "SOLID",
      "visible": true,
      "opacity": opacity,
      "blendMode": "NORMAL",
      "color": figma.util.rgb(color),
      "boundVariables": {}
    }];
    return this;
  };

  const child = function(name) {
    if (!this.children) {
      return null;
        }
    return this.findChild(child => child.name === name) || null;
};

  const setVector = function(vector) {
    if (this.type !== 'VECTOR') {
      throw new Error('setVector can only be called on VECTOR nodes');
    }
    this.vectorPaths = [{"windingRule": "NONE", "data": convertArcsToCubics(vector.replaceAll("M","M ").replaceAll(","," ").replaceAll("L"," L ").replaceAll("C"," C ").replaceAll("A"," A "))}];
  };

  const setText = function(text) {
  if (this.type !== 'TEXT') {
    const textNode = this.findChild(child => child.type === 'TEXT');
    if (textNode) {
      textNode.characters = String(text);
    }
  } else {
    this.characters = String(text);
  }
};

const setSize = function(width, height) {
// Ensure minimum size constraints
  const minSize = 0.01;
  const safeWidth = Math.max(width, minSize);
  const safeHeight = Math.max(height, minSize);
  
  // Handle constraint-based positioning
  if (this.constraints) {
    const oldBounds = this.absoluteBoundingBox;

    if (oldBounds) {
      if (this.constraints.horizontal === "MAX") {
        const widthDiff = safeWidth - oldBounds.width;
        this.x = this.x - widthDiff;
      }

      if (this.constraints.vertical === "MAX") {
        const heightDiff = safeHeight - oldBounds.height;
        this.y = this.y - heightDiff;
      }
    }
  }
  this.resize(safeWidth, safeHeight);
};
  // Get prototypes from different node types and enhance them all
  component = figma.createComponent();
  const nodeCreators = [
    () => component.createInstance(),
    () => figma.createFrame(),
    () => figma.createRectangle(), 
    () => figma.createEllipse(),
    () => figma.createVector(),
    () => figma.createText(),
    () => figma.createLine(),
    () => figma.createPolygon(),
    () => figma.createStar()
  ];
  
  const prototypesEnhanced = new Set();
  
  nodeCreators.forEach((creator,i) => {
    try {
      const tempNode = creator();
      const prototype = Object.getPrototypeOf(tempNode);
      
      // Only enhance each unique prototype once
      if (!prototypesEnhanced.has(prototype)) {
        if (!prototype.setStroke) {
          Object.defineProperty(prototype, 'setStroke', {
            value: strokeMethod,
            writable: false,
            enumerable: false
          });
        }
        
        if (!prototype.setFill) {
          Object.defineProperty(prototype, 'setFill', {
            value: fillMethod,
            writable: false,
            enumerable: false
          });
        }

        if (!prototype.setVector) {
          Object.defineProperty(prototype, 'setVector', {
            value: setVector,
            writable: false,
            enumerable: false
          });
        }
        if (!prototype.child) {
          Object.defineProperty(prototype, 'child', {
            value: child,
            writable: false,
            enumerable: false
          });
        }
        if (!prototype.setText) {
          Object.defineProperty(prototype, 'setText', {
            value: setText,
            writable: false,
            enumerable: false
          });
        }
        if (!prototype.setSize) {
          Object.defineProperty(prototype, 'setSize', {
            value: setSize,
            writable: false,
            enumerable: false
          });
        }

        prototypesEnhanced.add(prototype);
      }
      tempNode.remove();
    } catch (e) {
      // Some node types might not be available in all contexts
      console.log('Could not enhance:', creator.name);
    }
      
  });
  component.remove();
}

// Initialize API enhancements
enhanceFigmaAPI();
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
    function parseTSVTable(tsvText) {
  const lines = tsvText.trim().split('\\n');
  if (lines.length === 0) return [];
  
  const headers = lines[0].split('\\t');
  const data = [];
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split('\\t');
    const row = {};
    for (let j = 0; j < headers.length; j++) {
      row[headers[j]] = values[j] || "";
    }
    data.push(row);
  }
  return data;
  }
        function parseTSVMatrix(tsvText) {
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
      `
export class CodeExecutor {
  private logger: Logger;
  private errorHandler: ErrorHandler;

  constructor() {
    this.logger = new Logger();
    this.errorHandler = new ErrorHandler();
  }

  async executeCode(code: string, frameId?: string): Promise<{ success: boolean; logs: LogEntry[]; error?: string }> {
    const logs: LogEntry[] = [];
    
    try {
      // Validate input
      if (!InputValidator.isValidCode(code)) {
        throw new Error('Invalid code provided');
      }

      // Sanitize code
      const sanitizedCode = InputValidator.sanitizeCode(code);
      
      // Add execution context and logging
      const wrappedCode = this.wrapCodeWithContext(sanitizedCode, logs, frameId);
      console.log('Wrapped code:', wrappedCode);
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

  private wrapCodeWithContext(code: string, _logs: LogEntry[], frameId?: string): string {
    // Generate frame lookup code based on whether frameId is provided
    const frameSetupCode = frameId 
      ? `let FigmaFrame = await figma.getNodeByIdAsync('${frameId}');
         if (!FigmaFrame || FigmaFrame.type !== 'FRAME') {
           throw new Error('Selected frame not found or is not a valid frame');
         }`
      : `let FigmaFrame = figma.currentPage.selection[0];
         if (!FigmaFrame || FigmaFrame.type !== 'FRAME') {
           throw new Error('Please select a frame or lock to a specific frame');
         }`;

    return `
    return (async () =>  {
      ${frameSetupCode}
      let FirstChild = FigmaFrame.children[0];
      ${dynamicPrependCode}
      //TODO needs to check for mixed fonts within one text node
      let fonts = [...new Set(FigmaFrame.findAllWithCriteria({
  types: ['TEXT']
}).map(node => node.fontName.family + '***' + node.fontName.style))].map(font => {
            const [family, style] = font.split('***');
            console.log(family, style);
            return { family, style }
          })
            console.log("Fonts", fonts)
      try {
        for (const font of fonts) {
          if (font.family === "undefined" || font.style === "undefined") continue;
          await figma.loadFontAsync({ family: font.family, style: font.style });
        }
        console.log("Fonts loaded");
      } catch (e) {
        console.error("font error", e);
      }
        let originalChildren = FigmaFrame.children
        
      
      ${code}

    
      
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
        d3,
        d3Sankey,
        convertArcsToCubics
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
