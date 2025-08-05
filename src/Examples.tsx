
const {AutoLayout, Frame, Text} = figma.widget;
export async function barChart() {
    let InstanceOfElement = null;
    const existingElement = figma.currentPage.findOne(node => node.name === 'FigmaElementBar');
    if (existingElement) {
      figma.notify('Element already exists, so this will be used instead of creating a new one.');
      InstanceOfElement = existingElement;
      //console.log('Element found:', InstanceOfElement());
    } else {
      const element = await figma.createNodeFromJSXAsync(<Frame
        name="FigmaElementBar"
        fill="#F00"
        overflow="visible"
        width={653}
      height={17}
    >
    </Frame>);
    console.log('Element created:', element);
    figma.currentPage.appendChild(element);
    InstanceOfElement = figma.createComponentFromNode(element);
    figma.currentPage.appendChild(InstanceOfElement);
      }
      

const node = await figma.createNodeFromJSXAsync(
 <AutoLayout
      name="HorizontalBarChart"
      fill="#FFF"
      direction="vertical"
      spacing={30}
      padding={{
        top: 79,
        right: 110,
        bottom: 61,
        left: 110,
      }}
      width={810}
    >
      
    </AutoLayout>
);

// Ensure node is a FrameNode or AutoLayoutNode before appending children
if ("appendChild" in node && typeof node.appendChild === "function") {
  node.appendChild(InstanceOfElement.clone());
}

figma.currentPage.appendChild(node);
figma.currentPage.selection = [node];
node.setPluginData('code', `
// Bar Chart Example
// 
// This code generates a bar chart using Figma's widget API.
// 
// You can customize the chart by modifying the BarChartElement component.

let data = [
  { name: "Category 1", value: 100 },
  { name: "Category 2", value: 200 },
  { name: "Category 3", value: 300 },
  { name: "Category 4", value: 400 }
];
data.forEach((item, index) => {
    let element = FirstChild.clone(); //FigmaElementBar
    element.setSize(item.value,17)
    element.child("Value").setText(item.value)
    element.child("Name").setText(item.name)
    FigmaFrame.appendChild(element)
})`);
figma.viewport.scrollAndZoomIntoView([node]);
figma.notify('Element added successfully!');
}
export async function lineChart() {
  figma.notify('Line Chart Example is not implemented yet.');
}