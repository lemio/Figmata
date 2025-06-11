/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-case-declarations */
/* eslint-disable @typescript-eslint/no-explicit-any */
// This plugin will open a window to prompt the user to enter a number, and
// it will then create that many rectangles on the screen.

// This file holds the main code for plugins. Code in this file has access to
// the *figma document* via the figma global object.
// You can access browser APIs in the <script> tag inside "ui.html" which has a
// full browser environment (See https://www.figma.com/plugin-docs/how-plugins-run).

import {parseTSV} from './helperFunctions';
// This shows the HTML page in "ui.html".
figma.showUI(__html__);
figma.ui.resize(600, 1000);

let timer:any | null = null;
function debounce(callback: () => void, timeout: number) {
  return () => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      callback();
    }, timeout);
  };
}

figma.ui.onmessage = async (msg: {code: string}) => {
  const selection = figma.currentPage.selection[0] as FrameNode;
  selection.setPluginData('code', msg.code);
  figma.ui.postMessage({
    type: 'error',
    error: '',
  });
  
  const debouncedFunction = debounce(() => {
    try {
      eval(`
        (async () => {
          function delay(ms) {
            return new Promise(resolve => setTimeout(resolve, ms));
          }
          
          let FigmaFrame = figma.currentPage.selection[0];
          let FirstChild = FigmaFrame.children[0];
          
          let fonts = [...new Set(FigmaFrame.findAll(node => node.type === "TEXT").map(node => node.fontName.family + '***' + node.fontName.style))].map(font => {
            const [family, style] = font.split('***');
            console.log(family, style);
            return { family, style };
          });
          
          console.log("Fonts", fonts);
          
          try {
            for (const font of fonts) {
              await figma.loadFontAsync({ family: font.family, style: font.style });
            }
            console.log("Fonts loaded");
          } catch (e) {
            console.error("font error", e);
          }
          
          let originalChildren = FigmaFrame.children;
          originalChildren.slice(1).forEach(child => {
            child.remove();
          });
          
          ${msg.code}
          
          originalChildren.slice(0,1).forEach(child => {
            console.log(child);
            child.remove();
          });
        })();
      `);
    } catch(error: any) {
      figma.ui.postMessage({
        type: 'error',
        error: String(error),
        line: error.lineNumber ? error.lineNumber - 27 : undefined,
      });
      console.log("SYNTAX ERROR", error);
    }
  }, 100);
  
  debouncedFunction();
};

const makeFigmata = async () => {
  const selection = figma.currentPage.selection[0] as FrameNode;
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
      });
      return;
    }
    
    const firstElement = selection.children[0] as ComponentNode | InstanceNode;
    
    let propertiesString = '';
    if (firstElement.type === 'INSTANCE' && firstElement.componentProperties) {
      for (const [key, value] of Object.entries(firstElement.componentProperties)) {
        const mainComponent = await firstElement.getMainComponentAsync();
        
        if (mainComponent && mainComponent.parent && 'componentPropertyDefinitions' in mainComponent.parent) {
          const optionsList = (mainComponent.parent as ComponentSetNode).componentPropertyDefinitions;
          const options = optionsList[key]?.variantOptions?.join(",") || "";
          propertiesString += `\telement.setProperties({"${key}":"${value.value}"}) \n\t//${options}\n`;
        }
      }
    }
    
    let childrenString = '';
    const elements = firstElement.children.slice();
    elements.reverse().forEach((child: SceneNode) => {
      switch(child.type) {
        case 'TEXT':
          const textNode = child as TextNode;
          childrenString += `\telement.findChild(x => x.name === '${child.name}').characters = "${textNode.characters}"`;
          break;
        default:
          childrenString += `\t//element.findChild(x => x.name === '${child.name}')`;
      }

      if ('componentProperties' in child && child.componentProperties !== undefined) {
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
\telement.resize(${firstElement.absoluteBoundingBox?.width || 100},${firstElement.absoluteBoundingBox?.height || 100})
${propertiesString}${childrenString}
FigmaFrame.appendChild(element)
})
`;
    figma.ui.postMessage({
      test: code,
    });
  }
};

figma.on("run", makeFigmata);
figma.on("selectionchange", makeFigmata);