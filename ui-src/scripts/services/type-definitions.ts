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
// Figmata Custom Types and Helper Functions
declare global {
  // Global variables available in code execution context
  const FigmaFrame: FrameNode;
  const FirstChild: SceneNode;

  // Helper functions available in code execution context
  function _setText(element: SceneNode, childName: string, text: string): void;
  function _resize(element: SceneNode, width: number, height: number): void;
  function _setFill(element: SceneNode, color: { r: number; g: number; b: number }): void;
  function _setStroke(element: SceneNode, color: { r: number; g: number; b: number }, width?: number): void;
  function _position(element: SceneNode, x: number, y: number): void;
  function _rotate(element: SceneNode, degrees: number): void;
  function _scale(element: SceneNode, factor: number): void;
  function _opacity(element: SceneNode, value: number): void;

  // Extended console for better logging
  interface Console {
    log(...data: any[]): void;
    warn(...data: any[]): void;
    error(...data: any[]): void;
    time(label: string): void;
    timeEnd(label: string): void;
  }
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
      this.getFigmaTypes(),
      this.getD3Types(), 
      this.getFigmataCustomTypes()
    ].join('\n\n');
  }
}
