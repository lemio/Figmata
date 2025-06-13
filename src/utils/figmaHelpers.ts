/* eslint-disable @typescript-eslint/no-explicit-any */
// Figma-specific utility functions

export interface FontInfo {
  family: string;
  style: string;
}

export async function loadFontsFromNode(node: FrameNode | ComponentNode | InstanceNode | GroupNode): Promise<void> {
  const textNodes = node.findAll((n: any) => n.type === "TEXT") as TextNode[];
  const uniqueFonts = new Set<string>();

  textNodes.forEach(textNode => {
    if (textNode.fontName !== figma.mixed) {
      const fontKey = `${textNode.fontName.family}***${textNode.fontName.style}`;
      uniqueFonts.add(fontKey);
    }
  });

  const fonts: FontInfo[] = Array.from(uniqueFonts).map(fontKey => {
    const [family, style] = fontKey.split('***');
    return { family, style };
  });

  console.log("Loading fonts:", fonts);

  try {
    for (const font of fonts) {
      await figma.loadFontAsync({ family: font.family, style: font.style });
    }
    console.log("All fonts loaded successfully");
  } catch (e) {
    console.error("Font loading error:", e);
    throw e;
  }
}

export function cloneNodeSafely(node: any): any {
  // Most nodes support cloning, but let's be safe
  if (typeof node.clone !== 'function') {
    throw new Error(`Node type ${node.type} does not support cloning`);
  }
  
  const clone = node.clone();
  
  // Ensure the clone has a unique name if needed
  if (node.parent && node.parent.type === 'FRAME') {
    const siblings = node.parent.children;
    const baseName = clone.name;
    let counter = 1;
    
    while (siblings.some((child: any) => child.name === clone.name && child !== clone)) {
      clone.name = `${baseName} ${counter}`;
      counter++;
    }
  }
  
  return clone;
}

/**
 * Resizes a Figma node to the specified width and height while ensuring minimum size constraints
 * and handling constraint-based positioning adjustments.
 *
 * @param node - The Figma node to resize. This can be any object that supports resizing and has constraints.
 * @param width - The desired width for the node. If the width is less than the minimum size, it will be adjusted to the minimum size.
 * @param height - The desired height for the node. If the height is less than the minimum size, it will be adjusted to the minimum size.
 *
 * @remarks
 * - The function ensures that the width and height are at least `0.01` to avoid invalid sizes.
 * - If the node has constraints (`horizontal` or `vertical` set to `"MAX"`), the position (`x` or `y`) of the node is adjusted
 *   to maintain the constraints relative to the new size.
 * - The `absoluteBoundingBox` property of the node is used to calculate the size difference for constraint adjustments.
 *
 * @example
 * ```typescript
 * resize(element, 150, 150);
 * ```
 */
export function resize(node: any, width: number, height: number): void {
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

export function findChildByName(node: any, name: string, caseSensitive: boolean = false): any {
  const searchName = caseSensitive ? name : name.toLowerCase();
  
  if (node.children) {
    for (const child of node.children) {
      const childName = caseSensitive ? child.name : child.name.toLowerCase();
      if (childName === searchName) {
        return child;
      }
    }
  }
  
  return null;
}

export function updateTextSafely(textNode: any, newText: string): void {
  if (textNode.type === 'TEXT') {
    textNode.characters = newText;
  }
}
