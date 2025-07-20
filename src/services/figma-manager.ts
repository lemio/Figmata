import { Logger } from '../utils/logger';

export class FigmaManager {
  private logger: Logger;

  constructor() {
    this.logger = new Logger();
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
            childrenString += `\t_setText(element,"${child.name}", "${(child as TextNode).characters}")\n`;
            break;
          default:
            childrenString += `\t//element.findChild(x => x.name === '${child.name}')\n`;
        }
        childrenString += '\n';
      });
    }

    const bounds = firstElement.absoluteBoundingBox;
    const width = bounds ? bounds.width : 100;
    const height = bounds ? bounds.height : 100;

    return `
let data = [
    { "Quantity": 10, "Price": 100 },
    { "Quantity": 20, "Price": 200 },
    { "Quantity": 40, "Price": 300 },
    { "Quantity": 65, "Price": 600 },
    { "Quantity": 15, "Price": 150 }
  ]
data.forEach((row) => {
\tlet element = FirstChild.clone(); //${firstElement.name}
\t_resize(element,${width},${height})
${childrenString}
FigmaFrame.appendChild(element)
})
`;
  }

  private getDefaultTemplate(): string {
    return `
let data = [
    { "Quantity": 10, "Price": 100 },
    { "Quantity": 20, "Price": 200 },
    { "Quantity": 40, "Price": 300 },
    { "Quantity": 65, "Price": 600 },
    { "Quantity": 15, "Price": 150 }
];

data.forEach((row, index) => {
    // Create your elements here
    console.log(\`Processing row \${index + 1}:\`, row);
});
`;
  }

  getCurrentSelection(): readonly SceneNode[] {
    return figma.currentPage.selection;
  }

  resizeUI(width: number, height: number): void {
    figma.ui.resize(width, height);
  }
}
