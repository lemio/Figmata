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
let data = [
    { "Quantity": 10, "Price": 100 },
    { "Quantity": 20, "Price": 200 },
    { "Quantity": 40, "Price": 300 },
    { "Quantity": 65, "Price": 600 },
    { "Quantity": 15, "Price": 150 }
  ]
data.forEach((row) => {
\tlet element = FirstChild.clone(); //${firstElement.name}
\telement.setSize(${width}, ${height});
${childrenString}
\tFigmaFrame.appendChild(element)
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
