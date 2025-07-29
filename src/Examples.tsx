
const {AutoLayout, Frame, Text} = figma.widget;
export async function barChart() {
    function BarChartElement(
  props: Partial<FrameProps>
) {
  return (
    <Frame
      name="FigmaElementBar"
      fill="#F00"
      overflow="visible"
      width={653}
      height={17}
      {...props}
    >
      <Text
        name="Name"
        x={-639}
        y={{
          type: "top-bottom",
          topOffset: 0,
          bottomOffset: 1,
        }}
        fill="#000"
        width={632}
        height={16}
        verticalAlignText="center"
        horizontalAlignText="right"
        fontFamily="Inter"
        fontSize={12}
      >
        CatName
      </Text>
      <Text
        name="Value"
        x={{
          type: "right",
          offset: -98,
        }}
        y={{
          type: "top-bottom",
          topOffset: 0,
          bottomOffset: 1,
        }}
        fill="#000"
        width={91}
        height={16}
        verticalAlignText="center"
        fontFamily="Inter"
        fontSize={12}
      >
        Value
      </Text>
    </Frame>
  
    )
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
      <BarChartElement></BarChartElement>
    </AutoLayout>
)

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
	_resize(element,item.value,17)
	_setText(element,"Value", item.value.toString())
	_setText(element,"Name", item.name)
    FigmaFrame.appendChild(element)
})`);
figma.viewport.scrollAndZoomIntoView([node]);
figma.notify('Element added successfully!');
}
export async function lineChart() {
  figma.notify('Line Chart Example is not implemented yet.');
}