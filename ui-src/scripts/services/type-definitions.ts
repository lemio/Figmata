import { getExtractedTypes } from './extracted-types';

export class TypeDefinitionsService {
  static getFigmaTypes(): string {
    const extractedTypes = getExtractedTypes();
    return extractedTypes.figma || this.getFallbackFigmaTypes();
  }

  static getD3Types(): string {
    const extractedTypes = getExtractedTypes();
    return extractedTypes.d3 || this.getFallbackD3Types();
  }

  static getFallbackFigmaTypes(): string {
    const extractedTypes = getExtractedTypes();
    if (extractedTypes.figma && extractedTypes.figma.trim() !== '// Figma types not available') {
      return extractedTypes.figma;
    }
    
    // Fallback to basic types if extraction failed
    return `
// Figma API Types (Fallback)
declare global {
  const figma: PluginAPI;
}

interface PluginAPI {
  readonly currentPage: PageNode;
  readonly root: DocumentNode;
  readonly command: string;
  readonly ui: UIAPI;
  
  showUI(html: string, options?: ShowUIOptions): void;
  closePlugin(message?: string): void;
  notify(message: string, options?: NotificationOptions): void;
  on(type: 'run', callback: () => void): void;
  on(type: 'selectionchange', callback: () => void): void;
  getNodeByIdAsync(id: string): Promise<BaseNode | null>;
}

interface UIAPI {
  postMessage(message: any): void;
  onmessage: ((message: any) => void) | undefined;
  resize(width: number, height: number): void;
}

interface BaseNode {
  readonly id: string;
  readonly type: NodeType;
  name: string;
  readonly parent: (BaseNode & ChildrenMixin) | null;
  remove(): void;
  setPluginData(key: string, value: string): void;
  getPluginData(key: string): string;
  setRelaunchData(data: { [command: string]: string }): void;
}

interface SceneNode extends BaseNode {
  visible: boolean;
  locked: boolean;
  readonly absoluteBoundingBox: Rect | null;
  readonly absoluteTransform: Transform;
  x: number;
  y: number;
  rotation: number;
  resize(width: number, height: number): void;
}

interface FrameNode extends SceneNode, ChildrenMixin, ContainerMixin {
  readonly type: 'FRAME';
  clone(): FrameNode;
  appendChild(child: SceneNode): void;
  insertChild(index: number, child: SceneNode): void;
  findChild(callback: (node: SceneNode) => boolean): SceneNode | null;
  findChildren(callback: (node: SceneNode) => boolean): SceneNode[];
}

interface TextNode extends SceneNode {
  readonly type: 'TEXT';
  characters: string;
  fontSize: number | symbol;
  fontName: FontName | symbol;
  textCase: TextCase | symbol;
  fills: readonly Paint[];
}

interface ComponentNode extends SceneNode, ChildrenMixin {
  readonly type: 'COMPONENT';
  clone(): ComponentNode;
}

interface InstanceNode extends SceneNode, ChildrenMixin {
  readonly type: 'INSTANCE';
  readonly mainComponent: ComponentNode | null;
  clone(): InstanceNode;
  detachInstance(): FrameNode;
  swapComponent(componentNode: ComponentNode): void;
}

interface PageNode extends BaseNode, ChildrenMixin {
  readonly type: 'PAGE';
  selection: readonly SceneNode[];
  backgrounds: readonly Paint[];
}

interface ChildrenMixin {
  readonly children: readonly SceneNode[];
  appendChild(child: SceneNode): void;
  insertChild(index: number, child: SceneNode): void;
  findChild(callback: (node: SceneNode) => boolean): SceneNode | null;
  findChildren(callback: (node: SceneNode) => boolean): SceneNode[];
}

interface ContainerMixin {
  expanded: boolean;
}

type NodeType = 
  | 'DOCUMENT' 
  | 'PAGE' 
  | 'FRAME' 
  | 'GROUP' 
  | 'COMPONENT' 
  | 'COMPONENT_SET' 
  | 'INSTANCE' 
  | 'TEXT' 
  | 'VECTOR' 
  | 'STAR' 
  | 'LINE' 
  | 'ELLIPSE' 
  | 'POLYGON' 
  | 'RECTANGLE' 
  | 'SLICE';

interface Rect {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
}

interface Transform {
  readonly 0: readonly [number, number, number];
  readonly 1: readonly [number, number, number];
}

interface Paint {
  readonly type: PaintType;
  readonly visible?: boolean;
  readonly opacity?: number;
  readonly color?: RGB;
  readonly gradientStops?: readonly ColorStop[];
}

type PaintType = 'SOLID' | 'GRADIENT_LINEAR' | 'GRADIENT_RADIAL' | 'GRADIENT_ANGULAR' | 'GRADIENT_DIAMOND' | 'IMAGE' | 'EMOJI';

interface RGB {
  readonly r: number;
  readonly g: number;
  readonly b: number;
}

interface ColorStop {
  readonly position: number;
  readonly color: RGBA;
}

interface RGBA extends RGB {
  readonly a: number;
}

interface FontName {
  readonly family: string;
  readonly style: string;
}

type TextCase = 'ORIGINAL' | 'UPPER' | 'LOWER' | 'TITLE';

interface ShowUIOptions {
  visible?: boolean;
  width?: number;
  height?: number;
  position?: 'center' | { x: number; y: number };
  title?: string;
}

interface NotificationOptions {
  timeout?: number;
  error?: boolean;
}
`;
  }

  static getFallbackD3Types(): string {
    return `
// D3 Types (Basic subset)
declare module 'd3' {
  // Selection
  interface Selection<GElement extends BaseType, Datum, PElement extends BaseType, PDatum> {
    select(selector: string): Selection<HTMLElement, Datum, PElement, PDatum>;
    selectAll(selector: string): Selection<HTMLElement, any, GElement, Datum>;
    append(type: string): Selection<HTMLElement, Datum, PElement, PDatum>;
    attr(name: string, value: string | number | boolean | null): this;
    attr(name: string): string;
    style(name: string, value: string | number | boolean | null): this;
    style(name: string): string;
    text(value: string | number | boolean | null): this;
    text(): string;
    html(value: string): this;
    html(): string;
    data(data: Datum[]): Selection<GElement, Datum, PElement, PDatum>;
    enter(): Selection<EnterElement, Datum, PElement, PDatum>;
    exit(): Selection<GElement, Datum, PElement, PDatum>;
    remove(): this;
    on(typenames: string, listener: (event: Event, d: Datum) => void): this;
  }

  type BaseType = Element | EnterElement | Document | Window | null;
  interface EnterElement {
    ownerDocument: Document;
    namespaceURI: string;
    appendChild(newChild: Node): Node;
    insertBefore(newChild: Node, refChild: Node): Node;
    querySelector(selectors: string): Element;
    querySelectorAll(selectors: string): NodeListOf<Element>;
  }

  // Scale functions
  interface ScaleLinear<Range, Output> {
    (value: number): Output;
    domain(): number[];
    domain(domain: number[]): this;
    range(): Range[];
    range(range: Range[]): this;
    nice(): this;
    ticks(count?: number): number[];
    tickFormat(count?: number, specifier?: string): (d: number) => string;
  }

  interface ScaleOrdinal<Domain extends { toString(): string }, Range> {
    (value: Domain): Range;
    domain(): Domain[];
    domain(domain: Domain[]): this;
    range(): Range[];
    range(range: Range[]): this;
  }

  // D3 Functions
  function select(selector: string): Selection<HTMLElement, unknown, null, undefined>;
  function selectAll(selector: string): Selection<HTMLElement, unknown, null, undefined>;
  function scaleLinear(): ScaleLinear<number, number>;
  function scaleOrdinal<Range>(range?: Range[]): ScaleOrdinal<string, Range>;
  function schemeCategory10: string[];
  function max<T>(array: T[], accessor?: (d: T) => number): number | undefined;
  function min<T>(array: T[], accessor?: (d: T) => number): number | undefined;
  function extent<T>(array: T[], accessor?: (d: T) => number): [number, number] | [undefined, undefined];
}
`;
  }

  static getFigmataCustomTypes(): string {
    return `

interface BaseNodeMixin extends PluginDataMixin, DevResourcesMixin {
  readonly id: string
  readonly parent: (BaseNode & ChildrenMixin) | null
  name: string
  readonly removed: boolean
  toString(): string
  remove(): void
  setRelaunchData(data: { [command: string]: string }): void
  getRelaunchData(): {
    [command: string]: string
  }
  readonly isAsset: boolean
  getCSSAsync(): Promise<{
    [key: string]: string
  }>
  /**
   * Finds the first child node matching the given name.
   * @param name - The name of the child node to find
   * @returns The first matching child node, or null if not found
   */
  child(name: string): SceneNode | null;
  /**
   * Sets the text content of a TEXT node.
   * @param text - The text content to set
   */
  setText(text: string): void;
  /**
   * Sets the fill of the node.
   * @param color - The fill color in hex format (e.g., '#FF0000')
   * @param opacity - The fill opacity (0 to 1), default is 1
   */
  setFill(color: string, opacity?: number): void;
  /**
   * Sets the stroke (border) of the node.
   * @param color - The stroke color in hex format (e.g., '#FF0000')
   * @param opacity - The stroke opacity (0 to 1), default is 1
   * @param width - The stroke width in pixels, default is 1
   */
  setStroke(color: string, opacity?: number, width?: number): void;
  /** Sets the vector path data for VECTOR nodes.
  * @param vector - The SVG path data string to set
  * @returns void
  */
  setVector(vector: string): void;
  /**
  * Sets the size of the node and resized based on the current layout constraints.
  * @param width - The width to set
  * @param height - The height to set
  * @returns void
  */
  setSize(width: number, height: number): void;
  clone(): SceneNode;
}

// Figmata Custom Types and Helper Functions
declare global {

/**
 * Parses TSV table (Tab-Separated Values) text into an array of objects.
 * Each object represents a row, with keys as column headers.
 * \`\`\`
 * let data = parseTSV(
 * \`Name\tAge
 * Alice\t30
 * Bob\t25\`);
 * print(data);
 * // Output: [{ "Name": "Alice", "Age": "30" }, { "Name": "Bob", "Age": "25" }]
 * \`\`\`
 * @param tsvText - The TSV formatted string
 * @returns An array of objects representing the parsed data
 */
function parseTSVTable(tsvText: string): any[];


/**
 * Parses a TSV matrix (Tab-Separated Values) text into an object with keys as the first column.
 * Each object represents a row, with keys as column headers.
 * \`\`\`
 * let data = parseTSV(
 * \` \tCost\tSize\tPrice
 * Product1\t100\t20\t200
 * Product2\t150\t30\t300\`);
 * print(data);
 * // Output: { "Product1": { "Cost": 100, "Size": 20, "Price": 200 }, "Product2": { "Cost": 150, "Size": 30, "Price": 300 } }
 * \`\`\`
 * @param tsvText - The TSV formatted string
 * @returns An array of objects representing the parsed data
 */
function parseTSVMatrix(tsvText: string): any[];

  // Global variables available in code execution context
  /**
   * The main frame selected or locked to in the Figma document.
   * Where this code is connected to.
   */
  const FigmaFrame: FrameNode;
  const FirstChild: SceneNode;
  let element: SceneNode;
  // Helper functions available in code execution context

  /**
  * Converts a data table in the Figma document to an array of objects.
  * Each object represents a row in the table, with keys as column headers.
  * \`\`\`
  * let data = dataTableToObject('tableNodeId');
  * print(data);
  * // Output: [{ "Name": "Alice", "Age": 30 }, { "Name": "Bob", "Age": 25 }]
  * \`\`\`
  * @param tableId - The ID of the Figma node containing the data table
  * @returns An arra y of objects representing the table data
  */
  function dataTableToObject(tableId: string): any[];
  
  /**
  * Updates an existing element with the given name or creates a new one if it doesn't exist.
  * @param name - The name of the element to update or create
  * @param masterElement - An optional master element to clone if creating a new element, by default uses the first child of FigmaFrame
  * @returns The updated or newly created SceneNode
  */
  function updateOrEnter(name: string, masterElement: SceneNode | null = null): SceneNode;
  
  /**
 * Removes old elements from the FigmaFrame that were not updated in the current run.
 * Elements are identified by a custom plugin data key 'gen'.
 * @param callback - An optional callback function to execute instead of removing elements
 * @returns void
 */
  function removeOldElements(callback: (elt: SceneNode) => void = (elt) => elt.remove()): void;
  // Extended console for better logging
  interface Console {
    log(...data: any[]): void;
    warn(...data: any[]): void;
    error(...data: any[]): void;
    time(label: string): void;
    timeEnd(label: string): void;
  }

  /**
   * Converts an ArrayBuffer to a Base64 encoded string.
   * @param arrayBuffer - The ArrayBuffer to convert
   * @returns The Base64 encoded string
   */
  function base64ArrayBuffer(arrayBuffer: ArrayBuffer): string;

  /**
   * Asks an AI model for a response based on the provided messages.
   * The response is expected to contain JSON data.
   * @param messages - An array of message objects to send to the AI model
   * @returns A promise that resolves to the extracted JSON string from the AI response
   */
  function getAiResponse(messages: { role: 'user' | 'system' | 'assistant'; content: any }[]): Promise<string>;
}

// Common data structures for examples
interface DataPoint {
  label: string;
  value: number;
  category?: string;
  color?: string;
}

interface ChartData {
  name: string;
  value: number;
  [key: string]: any;
}

interface PersonData {
  name: string;
  role: string;
  avatar?: string;
  email?: string;
  department?: string;
}

interface TaskData {
  title: string;
  status: 'Todo' | 'In Progress' | 'Complete';
  priority: 'Low' | 'Medium' | 'High';
  assignee?: string;
  dueDate?: string;
}

interface ProductData {
  name: string;
  price: number;
  category: string;
  inStock: boolean;
  rating?: number;
  image?: string;
}

// Layout helpers
interface GridLayout {
  columns: number;
  rows?: number;
  gap?: number;
  itemWidth?: number;
  itemHeight?: number;
}

interface StackLayout {
  direction: 'horizontal' | 'vertical';
  gap?: number;
  alignment?: 'start' | 'center' | 'end';
}

// Color helpers
interface ColorPalette {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  text: string;
}

// Common utility functions available in execution context
declare function clamp(value: number, min: number, max: number): number;
declare function lerp(a: number, b: number, t: number): number;
declare function randomBetween(min: number, max: number): number;
declare function hexToRgb(hex: string): { r: number; g: number; b: number } | null;

// Animation helpers (for future use)
interface AnimationConfig {
  duration: number;
  easing?: 'linear' | 'ease-in' | 'ease-out' | 'ease-in-out';
  delay?: number;
}

// Sample data generators
declare const sampleData: {
  people: PersonData[];
  tasks: TaskData[];
  products: ProductData[];
  chartData: ChartData[];
  colors: ColorPalette;
};
`;
  }

  static getAllTypeDefinitions(): string {
    return [
      this.getD3Types(), 
      this.getFigmataCustomTypes(),
      this.getFigmaTypes(),
    ].join('\n\n');
  }
}
