
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
      <Text
        name="Name"
        x={-41}
        y={{
          type: "top-bottom",
          topOffset: 1,
          bottomOffset: 1,
        }}
        fill="#000"
        verticalAlignText="center"
        horizontalAlignText="right"
        fontFamily="Inter"
        fontSize={12}
      >
        Name
      </Text>
      <Text
        name="Value"
        x={{
          type: "right",
          offset: -39,
        }}
        y={{
          type: "top-bottom",
          topOffset: 1,
          bottomOffset: 1,
        }}
        fill="#000"
        verticalAlignText="center"
        fontFamily="Inter"
        fontSize={12}
      >
        Value
      </Text>

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
      y={300}
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
  node.appendChild(InstanceOfElement.createInstance());
}

figma.currentPage.appendChild(node);
figma.currentPage.selection = [node];
node.setPluginData('code', `
// Bar Chart Example
// 
// This code generates a bar chart using Figma's widget API.
// 
// You can customize the chart by modifying the FigmaElementBar component.

let data = d3.tsvParse
(\`name	value
Category 1	120
Category 2	230
Category 3	360
Category 4	400\`)

print(data)
data.forEach((item, index) => {
	var element = updateOrEnter(item.name)		//Select or clone an element (if the name does not exist)
	element.setSize(item.value,17)				//Resize the element, while taking into account the Position constraints
	element.child("Value").setText(item.value)	//Set the text of the text element named "Value"
	element.child("Name").setText(item.name)	//Set the text of the text element named "Name"
	FigmaFrame.appendChild(element)				//Add this element to the end of the selected frame
})
removeOldElements()	//Remove any elements that were created by Figmata in the past but are not updated
`);
figma.viewport.scrollAndZoomIntoView([node]);
figma.notify('Element added successfully!');
}
export async function lineChart() {
  figma.notify('Line Chart Example is not implemented yet.');
}