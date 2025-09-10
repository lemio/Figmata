import { Logger } from '../utils/logger';

export class FigmaManager {
  private logger: Logger;

  constructor() {
    this.logger = new Logger();
    figma.loadFontAsync({ family: "Inter", style: "Medium" })
    figma.loadFontAsync({ family: "Inter", style: "Bold" })
  }

  generateTemplateCode(): string {
    const selection = figma.currentPage.selection[0];
    
    if (!selection || selection.type !== 'FRAME') {
      return this.getDefaultTemplate();
    }

    const frame = selection as FrameNode;
    const existingCode = frame.getPluginData('code');
    
    if (existingCode) {
      return existingCode;
    }

    return this.generateCodeFromFrame(frame);
  }

  private generateCodeFromFrame(frame: FrameNode): string {
    if (frame.children.length === 0) {
      return this.getDefaultTemplate();
    }

    const firstElement = frame.children[0];
    let childrenString = '';
    
    // Generate code for text elements if firstElement has children
    if ('children' in firstElement && firstElement.children) {
      const elements = [...firstElement.children].reverse();
      elements.forEach((child: SceneNode) => {
        switch (child.type) {
          case 'TEXT':
            childrenString += `\telement.child("${child.name}").setText("${(child as TextNode).characters}")`;
            break;
          case 'RECTANGLE':
            // eslint-disable-next-line no-case-declarations
            const fill = (child as RectangleNode).fills[0];
            // eslint-disable-next-line no-case-declarations
            const { r, g, b } = fill.color;
            // eslint-disable-next-line no-case-declarations
            const hex = `#${((1 << 24) + (Math.round(r * 255) << 16) + (Math.round(g * 255) << 8) + Math.round(b * 255)).toString(16).slice(1)}`;
            childrenString += `\telement.child("${child.name}").setFill("${hex}", ${fill.opacity})`;
          break;
          case 'VECTOR':
            childrenString += `\telement.child("${child.name}").setVector("${(child as VectorNode).vectorPaths[0]}")`;
          break;
          default:
            childrenString += `\t//element.child('${child.name}')`;
        }
        childrenString += '\n';
      });
    }

    const bounds = firstElement.absoluteBoundingBox;
    const width = bounds ? bounds.width : 100;
    const height = bounds ? bounds.height : 100;

    return `
// Generated code based on the selected frame "${frame.name}"
// 
// This code creates elements based on the first child of the selected frame.
// You can customize the data and element properties as needed.

let data = d3.tsvParse
(\`name	value
Category 1	120
Category 2	230
Category 3	360
Category 4	400\`)
data.forEach((row,index) => {
	var element = updateOrEnter("${firstElement.name}"+String(index))		//${firstElement.name}
	element.setSize(${width}, ${height});
${childrenString}
	FigmaFrame.appendChild(element)
})
removeOldElements()	//Remove any elements that were created by Figmata in the past but are not updated
`;
  }

  private getDefaultTemplate(): string {
    return `
// Default template code

//You can select a frame and adjust it's code or run "Generate Template Code" to get started
//Select the bar chart example in the top bar to see how it works

let data = d3.tsvParse
(\`name	value
Category 1	120
Category 2	230
Category 3	360
Category 4	400\`)

data.forEach((row, index) => {
    var element = updateOrEnter("Element" + index);
    // Manipulate your elements here
    console.log(\`Processing row \${index + 1}:\`, row);
});
removeOldElements()	//Remove any elements that were created by Figmata in the past but are not updated
`;
  }

  getCurrentSelection(): readonly SceneNode[] {
    return figma.currentPage.selection;
  }

  resizeUI(width: number, height: number): void {
    figma.ui.resize(width, height);
  }
}
