/* eslint-disable no-inner-declarations */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-var */

// This plugin will open a window to prompt the user to enter a number, and
// it will then create that many rectangles on the screen.

// This file holds the main code for plugins. Code in this file has access to
// the *figma document* via the figma global object.
// You can access browser APIs in the <script> tag inside "ui.html" which has a
// full browser environment (See https://www.figma.com/plugin-docs/how-plugins-run).

// This shows the HTML page in "ui.html".
figma.showUI(__html__);
figma.ui.resize(600, 1000);
/*
figma.ui.onmessage =  async (msg: any) => {
  console.log(msg);
}*/
let timer: any;
function test() {
                console.log("test");
}

// State variables for toolbar functionality
let lockedFrame: any = null;
let autoRefreshEnabled = false;

function debounce(callback: () => void, timeout: number) {
  return function(this: any, ...args: []) {
    clearTimeout(timer);
    timer = setTimeout(() => {
      callback.apply(this, args);
    }, timeout);
  };
}

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

// Helper functions for toolbar
function getFramesWithFigmataData() {
  const frames: Array<{id: string, name: string}> = [];
  
  function searchForFrames(node: any) {
    if (node.type === 'FRAME' && node.getPluginData('code')) {
      frames.push({
        id: node.id,
        name: `${node.name} (${node.id.substring(0, 8)}...)`
      });
    }
    
    if ('children' in node) {
      for (const child of node.children) {
        searchForFrames(child);
      }
    }
  }
  
  // Search all pages
  for (const page of figma.root.children) {
    searchForFrames(page);
  }
  
  return frames;
}

function getAllFrames() {
  const frames: Array<{id: string, name: string}> = [];
  
  function searchForFrames(node: any) {
    if (node.type === 'FRAME' && node.getPluginData('code')) {
      frames.push({
        id: node.id,
        name: `${node.name} (${node.id.substring(0, 8)}...)`
      });
    }
    
    if ('children' in node) {
      for (const child of node.children) {
        searchForFrames(child);
      }
    }
  }
  
  //Search only in the current page
  const currentPage = figma.currentPage;
  searchForFrames(currentPage);
  console.log("All Frames", frames);
  return frames;
}

function getCurrentSelectedFrame() {
  const selection = figma.currentPage.selection[0];
  if (selection && selection.type === 'FRAME') {
    return {
      id: selection.id,
      name: `${selection.name} (${selection.id.substring(0, 8)}...)`
    };
  }
  return null;
}

figma.ui.onmessage = async (msg: any) => {
  try {
    // Handle different message types
    switch (msg.type) {
      case 'run':
        await handleRunCode(msg.code);
        break;
        
      case 'frameSelected':
        await handleFrameSelected(msg.frame);
        break;
        
      case 'lockToggled':
        await handleLockToggled(msg.locked, msg.frame);
        break;
        
      case 'autoRefreshToggled':
        handleAutoRefreshToggled(msg.enabled);
        break;
        
      case 'promptSubmitted':
        await handlePromptSubmitted(msg.prompt);
        break;
        
      case 'requestFrameList':
        console.log("Requesting frame list");
        await handleRequestFrameList();
        break;
        
      default:
        // Handle legacy code execution (backward compatibility)
        if (msg.code) {
          await handleRunCode(msg.code);
        }
        break;
    }
  } catch (error) {
    figma.ui.postMessage({
      type: 'error',
      error: String(error),
      line: 0
    });
  }
}

async function handleRunCode(code: string) {
  let targetFrame;
  
  if (lockedFrame) {
    // Use the locked frame
    targetFrame = lockedFrame;
  } else {
    // Use the current selection
    const selection = figma.currentPage.selection[0];
    if (!selection || selection.type !== 'FRAME') {
      figma.ui.postMessage({
        type: 'error',
        error: 'Please select a frame or lock to a specific frame',
        line: 0
      });
      return;
    }
    targetFrame = selection;
  }
  
  targetFrame.setPluginData('code', code);
  figma.ui.postMessage({
    type: 'clearErrors'
  });
  
  const debouncedFunction = debounce(() => {
      var errors = false;
      // Create dynamic prependCode with the target frame
      const dynamicPrependCode = `
      /*
    console.log = function(...args) {
      figma.ui.postMessage({
        type: 'log',
    message: args.map(arg => (typeof arg === 'object' ? JSON.stringify(arg) : arg)).join(' '),
    line: 0,
    });
};*/

// D3.js v7 - Data visualization library
// Minimal D3 implementation for Figma plugin use
const d3 = (function() {
  // Basic selection functionality
  function select(selector) {
    return {
      data: function(data) {
        return {
          enter: function() {
            return {
              append: function(type) {
                return this;
              }
            };
          },
          exit: function() {
            return {
              remove: function() {
                return this;
              }
            };
          }
        };
      },
      attr: function(name, value) {
        return this;
      },
      style: function(name, value) {
        return this;
      },
      text: function(value) {
        return this;
      }
    };
  }

  // Scale functions
  function scaleLinear() {
    let domain = [0, 1];
    let range = [0, 1];
    
    function scale(value) {
      const domainSpan = domain[1] - domain[0];
      const rangeSpan = range[1] - range[0];
      return range[0] + (value - domain[0]) * rangeSpan / domainSpan;
    }
    
    scale.domain = function(d) {
      if (!arguments.length) return domain;
      domain = d;
      return scale;
    };
    
    scale.range = function(r) {
      if (!arguments.length) return range;
      range = r;
      return scale;
    };
    
    return scale;
  }

  function scaleOrdinal() {
    let domain = [];
    let range = [];
    
    function scale(value) {
      const index = domain.indexOf(value);
      return index >= 0 ? range[index % range.length] : range[0];
    }
    
    scale.domain = function(d) {
      if (!arguments.length) return domain;
      domain = d;
      return scale;
    };
    
    scale.range = function(r) {
      if (!arguments.length) return range;
      range = r;
      return scale;
    };
    
    return scale;
  }

  // Color schemes
  const schemeCategory10 = [
    "#1f77b4", "#ff7f0e", "#2ca02c", "#d62728", "#9467bd",
    "#8c564b", "#e377c2", "#7f7f7f", "#bcbd22", "#17becf"
  ];

  // Array utility functions
  function extent(array, accessor) {
    if (!array || array.length === 0) return [undefined, undefined];
    let min = Infinity;
    let max = -Infinity;
    
    for (let i = 0; i < array.length; i++) {
      const value = accessor ? accessor(array[i], i, array) : array[i];
      if (value != null && !isNaN(value)) {
        if (value < min) min = value;
        if (value > max) max = value;
      }
    }
    
    return min === Infinity ? [undefined, undefined] : [min, max];
  }

  function max(array, accessor) {
    if (!array || array.length === 0) return undefined;
    let max = -Infinity;
    
    for (let i = 0; i < array.length; i++) {
      const value = accessor ? accessor(array[i], i, array) : array[i];
      if (value != null && !isNaN(value) && value > max) {
        max = value;
      }
    }
    
    return max === -Infinity ? undefined : max;
  }

  function min(array, accessor) {
    if (!array || array.length === 0) return undefined;
    let min = Infinity;
    
    for (let i = 0; i < array.length; i++) {
      const value = accessor ? accessor(array[i], i, array) : array[i];
      if (value != null && !isNaN(value) && value < min) {
        min = value;
      }
    }
    
    return min === Infinity ? undefined : min;
  }

  return {
    select: select,
    scaleLinear: scaleLinear,
    scaleOrdinal: scaleOrdinal,
    schemeCategory10: schemeCategory10,
    extent: extent,
    max: max,
    min: min
  };
})();

// Example D3 usage for data visualization in Figma
// const sampleData = [10, 20, 30, 40, 50];
// const scale = d3.scaleLinear().domain([0, 50]).range([0, 200]);
// const colors = d3.scaleOrdinal().domain(['A', 'B', 'C']).range(d3.schemeCategory10);

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
      figma.ui.postMessage({
        type: 'log',
        message: args.map(arg => (typeof arg === 'object' ? JSON.stringify(arg)
          : arg)).join(' '),
        line: Number(getUpperLineNumberFromStack(new Error()))- Number(dynamicPrependCode.split('\\n').length + 1),
      });
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
    let FigmaFrame = await figma.getNodeByIdAsync('${targetFrame.id}')
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
    originalChildren.slice(1).forEach(child => {
        child.remove();
      });
      `;
      
      const postCode = `
      originalChildren.slice(0,1).forEach(child => {
        console.log(child)
        child.remove();
      });
      
          })()`
      console.log(dynamicPrependCode + code + postCode)
      
      // Execute the code and handle success/error properly
      const codeToExecute = dynamicPrependCode + code + postCode;
      const context = {
        figma,
        console,
        Promise,
        setTimeout,
        clearTimeout,
        getLineNumberFromStack,
        getUpperLineNumberFromStack,
        dynamicPrependCode
      };
      const paramNames = Object.keys(context);
      const paramValues = Object.values(context);

      const executeCode = new Function(...paramNames , codeToExecute);
      
      executeCode(...paramValues).catch((error: any) => {
        errors = true;
        console.log("SYNTAX",error);
        console.log(dynamicPrependCode)
        console.log(dynamicPrependCode.split('\n').length + 1)
        console.log(`Number(${getLineNumberFromStack(error)}) - Number(Number(${dynamicPrependCode.split('\n').length}) + 1)`)
        figma.ui.postMessage({
          type: 'error',
          error: String(error),
          line: Number(getLineNumberFromStack(error)) - Number(Number(dynamicPrependCode.split('\n').length) + 1),
        })
        
      }).then(() => {
        if (!errors) {
        // check if no errors were thrown          
        figma.ui.postMessage({
          type: 'success',
          message: 'Code executed successfully',
        });
        }
      });
  }, 100);

  debouncedFunction();
}

async function handleFrameSelected(frameId: string) {
  if (!frameId) return;
  
  // Find the frame by ID
  const frame = await figma.getNodeByIdAsync(frameId);
  if (frame && frame.type === 'FRAME') {
    // Focus on the selected frame
    figma.viewport.scrollAndZoomIntoView([frame]);
    figma.currentPage.selection = [frame as any];
    
    // Load existing code if available
    const existingCode = frame.getPluginData('code');
    if (existingCode) {
      figma.ui.postMessage({
        type: 'updateCode',
        code: existingCode
      });
    }
  }
}

async function handleLockToggled(locked: boolean, frameId: string) {
  if (locked && frameId) {
    const frame = await figma.getNodeByIdAsync(frameId);
    if (frame && frame.type === 'FRAME') {
      lockedFrame = frame;
    }
  } else {
    lockedFrame = null;
  }
}

function handleAutoRefreshToggled(enabled: boolean) {
  autoRefreshEnabled = enabled;
}

// Helper function to get frame structure information
function getFrameStructure(frame: any): string {
  const frameInfo = {
    name: frame.name,
    type: frame.type,
    width: frame.width,
    height: frame.height,
    children: []
  };

  if (frame.children && frame.children.length > 0) {
    frameInfo.children = frame.children.map((child: any) => {
      const childInfo: any = {
        name: child.name,
        type: child.type,
        width: child.width,
        height: child.height
      };

      if (child.type === 'TEXT') {
        childInfo.characters = child.characters;
        childInfo.fontName = child.fontName;
        childInfo.fontSize = child.fontSize;
      }

      if (child.type === 'INSTANCE' && child.componentProperties) {
        childInfo.componentProperties = Object.keys(child.componentProperties);
      }

      if (child.children && child.children.length > 0) {
        childInfo.children = child.children.map((grandChild: any) => ({
          name: grandChild.name,
          type: grandChild.type,
          characters: grandChild.type === 'TEXT' ? grandChild.characters : undefined
        }));
      }

      return childInfo;
    });
  }

  return JSON.stringify(frameInfo, null, 2);
}

// Function to call the local Deepseek API using Figma's fetch
async function callDeepseekAPI(prompt: string, currentCode: string, frameStructure: string): Promise<string> {
  const systemPrompt = `You are a Figma plugin code generator. You generate JavaScript code that manipulates Figma frames and their children.

Available variables and functions:
- FigmaFrame: The current frame being worked on
- FirstChild: The first child of the frame (usually the template)
- originalChildren: Array of current children in the frame
- parseTSV(tsvText): Function to parse tab-separated values
- delay(ms): Function to create delays

Common patterns:
- Clone the first child: FirstChild.clone()
- Resize elements: element.resize(width, height)
- Set text content: element.findChild(x => x.name === 'TextLayerName').characters = "new text"
- Set component properties: element.setProperties({"PropertyName": "value"})
- Add to frame: FigmaFrame.appendChild(element)

Current frame structure:
${frameStructure}

Current code:
${currentCode}

Generate only executable JavaScript code that follows these patterns. Do not include explanations or markdown formatting.`;

  const requestBody = {
    model: "deepseek-r1-distill-qwen-32b",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: prompt }
    ],
    temperature: 0.7,
    max_tokens: -1,
    stream: false
  };

  try {
    const response = await fetch('http://localhost:1234/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    if (data.choices && data.choices[0] && data.choices[0].message) {
      return data.choices[0].message.content.trim();
    } else {
      throw new Error('Invalid response format from API');
    }
  } catch (error) {
    console.error('Deepseek API Error:', error);
    throw error;
  }
}

async function handlePromptSubmitted(prompt: string) {
  try {
    // Get the target frame (locked frame or current selection)
    const targetFrame = lockedFrame || figma.currentPage.selection[0];
    
    if (!targetFrame || targetFrame.type !== 'FRAME') {
      figma.ui.postMessage({
        type: 'error',
        error: 'Please select a frame or lock to a specific frame before using prompts',
        line: 0
      });
      return;
    }

    // Show loading state
    figma.ui.postMessage({
      type: 'log',
      message: 'Generating code with AI...',
      line: 0
    });

    // Get current code and frame structure
    const currentCode = targetFrame.getPluginData('code') || '';
    const frameStructure = getFrameStructure(targetFrame);

    // Call Deepseek API directly
    const generatedCode = await callDeepseekAPI(prompt, currentCode, frameStructure);

    // Update the UI with the generated code
    figma.ui.postMessage({
      type: 'updateCode',
      code: generatedCode
    });

    // Save the generated code to the frame
    targetFrame.setPluginData('code', generatedCode);

    // Show success message
    figma.ui.postMessage({
      type: 'log',
      message: 'Code generated successfully!',
      line: 0
    });

    // Notify user
    figma.notify('Code generated with AI!');

  } catch (error) {
    console.error('Error in handlePromptSubmitted:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    figma.ui.postMessage({
      type: 'error',
      error: `AI Generation failed: ${errorMessage}`,
      line: 0
    });
    figma.notify('AI generation failed. Check if Deepseek is running on localhost:1234');
  }
}

async function handleRequestFrameList() {
  const allFrames = getAllFrames();
  const currentFrame = getCurrentSelectedFrame();
  console.log("Current Frame", currentFrame);
  console.log("All Frames", allFrames);
  // Mark frames that have data
  const enrichedFrames = allFrames.map(frame => ({
    ...frame,
    hasData: true//framesWithData.some(dataFrame => dataFrame.id === frame.id)
  }));
  
  figma.ui.postMessage({
    type: 'updateFrameList',
    frames: enrichedFrames
  });
  
  if (currentFrame && !lockedFrame) {
    figma.ui.postMessage({
      type: 'setCurrentFrame',
      frame: currentFrame
    });
  }
}

// Listen for selection changes to update frame dropdown
figma.on('selectionchange', () => {
  if (!lockedFrame) {
    const currentFrame = getCurrentSelectedFrame();
    if (currentFrame) {
      figma.ui.postMessage({
        type: 'setCurrentFrame',
        frame: currentFrame
      });
    }
  }
});
/*
figma.ui.onmessage =  async (msg: {type: string, count: number}) => {
  
  //Copy the elements

  let figmata = {init,clone,add}


  /*figmata.init()
  let data = [
    { "Quantity": 10, "Price": 100 },
    { "Quantity": 20, "Price": 200 },
    { "Quantity": 40, "Price": 300 },
    { "Quantity": 65, "Price": 600 },
    { "Quantity": 15, "Price": 150 }
  ]
  data.forEach((row) => {
      let element = figmata.clone()
      element.resize(row.Quantity,row.Price)                            //Add current size of main unit
      element.property["Type"] = "ScatterDefault"                       //Options: [Default, Property2, Property3]
      element.child['xVal'].characters = String(row.Quantity)           //Add current text of main unit
      element.child['yVal'].characters = "€" + String(row.Price)        //Add current text of main unit
      //element.child['xTick']
      //element.child['yTick']
      //element.child['Point']
      figmata.add()
  })*/
  
/*
  figmata.init()
  let data = [
    {}
  ]
  data.forEach((row) => {
      let element = figmata.clone()
      element.resize(100,100)                            
      element.property["Type"] = "ScatterDefault"  
      //Options: [ScatterDefault, SimpleBar, VerticalStackedBar]
      element.child['xVal'].characters = 'xVal'          
      element.child['yVal'].characters = 'yval'       
      //element.child['xTick']
      //element.child['yTick']
      //element.child['Point']
      figmata.add()
  })



    console.log("Frame")
    let FigmaFrame = figma.currentPage.selection[0]
    console.log(figma.currentPage.selection[0])    //the first child of the selection 
    console.log("Instance")
    console.log(figma.currentPage.selection[0].children[0]) 
    let FigmaMaster = figma.currentPage.selection[0].children[0];
    //the first child of the selection

    //load all the fonts used in the FigmaMaster element
    let fonts = [...new Set(FigmaMaster.findAll(node => node.type === "TEXT").map(node => node.fontName.family + '***' + node.fontName.style))].map(font => {
      const [family, style] = font.split('***');
      console.log(family, style);
      return figma.loadFontAsync({ family, style }).catch(e => console.error(e));
    })
    await Promise.all(fonts)
    
    //await Promise.all([figma.loadFontAsync({family: "Roboto", style: "Regular"}),figma.loadFontAsync({ family: "Inter", style: "Regular" })]);
    //make a list of all the current children of the FigmaFrame
    let originalChildren = FigmaFrame.children
    //So that they can be removed later

    
    for (let i = 0; i < 5; i++) {
      let FigmaInstance = FigmaMaster.clone();
      let newHeight = FigmaInstance.absoluteBoundingBox.height;
    if (msg.count >= 2){
    newHeight = Math.max(Math.round(Math.random()*200),0.01); //Number must be greater than or equal to 0.01
    if (FigmaInstance.constraints.vertical === "MAX"){
    let height = FigmaInstance.absoluteBoundingBox.height;
    let addedHeight = newHeight - height;
      FigmaInstance.y = FigmaInstance.y - addedHeight
    }
    }
    if (msg.count >= 4){
      FigmaInstance.findOne(node => node.name.toLowerCase() === "yval").characters = newHeight.toString();
    }
    let newWidth = FigmaInstance.absoluteBoundingBox.width;
    if (msg.count >= 1){
    newWidth = Math.max(Math.round(Math.random()*200),0.01); //Number must be greater than or equal to 0.01
    if (FigmaInstance.constraints.horizontal === "MAX"){
    let width = FigmaInstance.absoluteBoundingBox.width;
    let addedWidth = newWidth - width;
      FigmaInstance.x = FigmaInstance.x - addedWidth
    }
  }
    if (msg.count >= 3){
      FigmaInstance.findOne(node => node.name.toLowerCase() === "xval").characters = newWidth.toString();
    }
    FigmaInstance.resize(newWidth,newHeight)
    console.log(FigmaInstance.findOne(node => node.name.toLowerCase() === "point"))
    //FigmaInstance.findOne(node => node.name.toLowerCase() === "point").fills = [{type: 'SOLID', color: {r: 1, g: 0, b: 0}}]
    figma.currentPage.selection[0].appendChild(FigmaInstance)
  }
  originalChildren.forEach(child => {
    child.remove();
  });
  }

  // Make sure to close the plugin when you're done. Otherwise the plugin will
  // keep running, which shows the cancel button at the bottom of the screen.
  //figma.closePlugin();
*/


  const makeFigmata = async () => {
    //get the button that was clicked
    const selection: any = figma.currentPage.selection[0];
    selection.setRelaunchData({'edit': 'test', 'reset': 'yes'})
    console.log(selection.type)
    if (selection.type === 'FRAME'){
      
      console.log(figma.command)
      if (figma.command === 'reset'){
        selection.setPluginData('code','')
      }
    if (selection.getPluginData('code') !== ''){
      figma.ui.postMessage({
        test:selection.getPluginData('code'),
      });
      return;
    }
    

    
    const firstElement:any = selection.children[0]

    var propertiesString = ''
    /*
    for (const [key, property] of Object.entries(firstElement.componentProperties)) {
      const mainComponent = await firstElement.getMainComponentAsync()
      const options = mainComponent.parent.componentPropertyDefinitions[key].variantOptions.join(",")
      propertiesString += `\telement.setProperties({"${key}":"${property.value}"}) \n\t//${options}\n`
    }*/
    var childrenString = ''
    var elements = firstElement.children.slice()
    elements.reverse().forEach((child:any) => {
      switch(child.type){
        case 'TEXT':
          childrenString += `\t_setText(element,"${child.name}", "${child.characters}")\n`
        break;
        default:
          childrenString += `\t//element.findChild(x => x.name === '${child.name}')`
      }

      if (child.componentProperties !== undefined){
        childrenString += `//prop`
      }
      childrenString += "\n"
    })
    const code = `
let data = [
    { "Quantity": 10, "Price": 100 },
    { "Quantity": 20, "Price": 200 },
    { "Quantity": 40, "Price": 300 },
    { "Quantity": 65, "Price": 600 },
    { "Quantity": 15, "Price": 150 }
  ]
data.forEach((row) => {
\tlet element = FirstChild.clone(); //${firstElement.name}
\t_resize(element,${firstElement.absoluteBoundingBox.width},${firstElement.absoluteBoundingBox.height})
${propertiesString}${childrenString}
FigmaFrame.appendChild(element)
})
`
      figma.ui.postMessage({
        test:code,
      });
    }
  }

  figma.on("run",makeFigmata)
  figma.on("selectionchange",makeFigmata)