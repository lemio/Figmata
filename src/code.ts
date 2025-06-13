/* eslint-disable no-inner-declarations */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-var */

import { utilityFunctions } from './utils';
import type { MessageData, UIMessage, ExecutionContext } from './types';

// This plugin will open a window to prompt the user to enter a number, and
// it will then create that many rectangles on the screen.

// This file holds the main code for plugins. Code in this file has access to
// the *figma document* via the figma global object.
// You can access browser APIs in the <script> tag inside "ui.html" which has a
// full browser environment (See https://www.figma.com/plugin-docs/how-plugins-run).

// This shows the HTML page in "ui.html".
figma.showUI(__html__);
figma.ui.resize(600, 1000);

let timer: any;

function test() {
  console.log("test");
}

const contextSetup = `
/*
console.log = function(...args) {
  figma.ui.postMessage({
    type: 'log',
    message: args.map(arg => (typeof arg === 'object' ? JSON.stringify(arg) : arg)).join(' '),
    line: 0,
  });
};*/
//figmata.init()
return (async () =>  {
  let FigmaFrame = figma.currentPage.selection[0]
  let FirstChild = FigmaFrame.children[0];
  //await Promise.all([figma.loadFontAsync({family: "Roboto", style: "Regular"}),figma.loadFontAsync({ family: "Inter", style: "Regular" })]);
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

function debounce(callback: () => void, timeout: number) {
  return function(this: any, ...args: []) {
    clearTimeout(timer);
    timer = setTimeout(() => {
      callback.apply(this, args);
    }, timeout);
  };
}

figma.ui.onmessage = async (msg: MessageData) => {
  const selection: any = figma.currentPage.selection[0];
  selection.setPluginData('code', msg.code);
  
  figma.ui.postMessage({
    type: 'error',
    error: '',
  } as UIMessage);

  const debouncedFunction = debounce(() => {
    try {
      const postCode = `
      originalChildren.slice(0,1).forEach(child => {
        console.log(child)
        child.remove();
      });
      })();`;
      
      // Create context with utility functions and figma globals
      const context: ExecutionContext = {
        ...utilityFunctions,
        figma,
        console,
        Promise,
        setTimeout,
        clearTimeout
      };
      
      // Create parameter names and values from context
      const paramNames = Object.keys(context);
      const paramValues = Object.values(context);
      
      // Create and execute function with context
      const executeCode = new Function(...paramNames, contextSetup + msg.code + postCode);
      executeCode(...paramValues).catch((error: any) => {
        figma.ui.postMessage({
          type: 'error',
          error: String(error),
          line: error.lineNumber - contextSetup.split('\n').length + 1, // Adjust line number based on contextSetup
        } as UIMessage);
      });
    } catch(error: any) {
      figma.ui.postMessage({
        type: 'error',
        error: String(error),
        line: error.lineNumber - contextSetup.split('\n').length + 1,
      } as UIMessage);
      console.log("SYNTAX ERROR", error);
    }
  }, 100);
  
  debouncedFunction();
};

const makeFigmata = async () => {
  //get the button that was clicked
  const selection: any = figma.currentPage.selection[0];
  selection.setRelaunchData({'edit': 'test', 'reset': 'yes'});
  console.log(selection.type);
  
  if (selection.type === 'FRAME') {
    console.log(figma.command);
    if (figma.command === 'reset') {
      selection.setPluginData('code', '');
    }
    
    if (selection.getPluginData('code') !== '') {
      figma.ui.postMessage({
        test: selection.getPluginData('code'),
      } as UIMessage);
      return;
    }

    const firstElement: any = selection.children[0];

    var propertiesString = '';
    /*
    for (const [key, property] of Object.entries(firstElement.componentProperties)) {
      const mainComponent = await firstElement.getMainComponentAsync()
      const options = mainComponent.parent.componentPropertyDefinitions[key].variantOptions.join(",")
      propertiesString += `\telement.setProperties({"${key}":"${property.value}"}) \n\t//${options}\n`
    }*/
    
    var childrenString = '';
    var elements = firstElement.children.slice();
    elements.reverse().forEach((child: any) => {
      switch(child.type) {
        case 'TEXT':
          childrenString += `\telement.findChild(x => x.name === '${child.name}').characters = "${child.characters}"`;
          break;
        default:
          childrenString += `\t//element.findChild(x => x.name === '${child.name}')`;
      }

      if (child.componentProperties !== undefined) {
        childrenString += `//prop`;
      }
      childrenString += "\n";
    });
    
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
\telement.resize(${firstElement.absoluteBoundingBox.width},${firstElement.absoluteBoundingBox.height})
${propertiesString}${childrenString}
FigmaFrame.appendChild(element)
})
`;
    figma.ui.postMessage({
      test: code,
    } as UIMessage);
  }
};

figma.on("run", makeFigmata);
figma.on("selectionchange", makeFigmata);
