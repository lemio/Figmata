// @ts-ignore
// This plugin will open a window to prompt the user to enter a number, and
// it will then create that many rectangles on the screen.

// This file holds the main code for plugins. Code in this file has access to
// the *figma document* via the figma global object.
// You can access browser APIs in the <script> tag inside "ui.html" which has a
// full browser environment (See https://www.figma.com/plugin-docs/how-plugins-run).

// This shows the HTML page in "ui.html".
figma.showUI(__html__);
figma.ui.resize(329, 324);


figma.ui.onmessage =  async (msg: {type: string, count: number}) => {
  const inputData = /*[
    { "Width": 1300, "Height": 500, "Text": "" },
    { "Width": 1333, "Height": 0, "Text": "Lo mal any primer. Mala collita. Inici de la crisi demográfica" },
    { "Width": 1347, "Height": 480, "Text": "Epidèmia de pesta" },
    { "Width": 1351, "Height": 0, "Text": "Epidèmia de pesta" },
    { "Width": 1356, "Height": 0, "Text": "Guerra contra Castella" },
    { "Width": 1357, "Height": 0, "Text": "Plaga de llagosta" },
    { "Width": 1360, "Height": 375, "Text": "" },
    { "Width": 1363, "Height": 0, "Text": "Epidèmia de pesta \"la mortaldat dels mitjans\" i mala collita" },
    { "Width": 1366, "Height": 330, "Text": "" },
    { "Width": 1369, "Height": 0, "Text": "Guerra contra Castella" },
    { "Width": 1373, "Height": 0, "Text": "Terratrèmols" },
    { "Width": 1374, "Height": 0, "Text": "Mala collita i pesta" },
    { "Width": 1381, "Height": 0, "Text": "Epidèmia de pesta" },
    { "Width": 1381, "Height": 280, "Text": "" },
    { "Width": 1396, "Height": 0, "Text": "Epidèmia de pesta" },
    { "Width": 1410, "Height": 0, "Text": "Epidèmia de pesta" },
    { "Width": 1427, "Height": 0, "Text": "Terratrèmols" },
    { "Width": 1428, "Height": 0, "Text": "Terratrèmols" },
    { "Width": 1429, "Height": 0, "Text": "Epidèmia de pesta" },
    { "Width": 1439, "Height": 0, "Text": "Epidemia de pesta" },
    { "Width": 1440, "Height": 0, "Text": "Crisi comercial" },
    { "Width": 1448, "Height": 0, "Text": "Terratrèmols i epidèmia de pesta" },
    { "Width": 1455, "Height": 0, "Text": "Crisi económica general" },
    { "Width": 1457, "Height": 0, "Text": "Crisi económica general" },
    { "Width": 1462, "Height": 0, "Text": "Guerra civil i primera guerra remença" },
    { "Width": 1472, "Height": 0, "Text": "Guerra civil i primera guerra remença" },
    { "Width": 1485, "Height": 0, "Text": "Segona guerra remença" },
    { "Width": 1486, "Height": 0, "Text": "Segona guerra remença" },
    { "Width": 1497, "Height": 215, "Text": "" }
  ]*/
  [
    { "Width": 10, "Height": 100 },
    { "Width": 20, "Height": 200 },
    { "Width": 40, "Height": 300 },
    { "Width": 65, "Height": 600 },
    { "Width": 15, "Height": 150 },
    /*
    { "Width": 30, "Height": 200 },
    { "Width": 20, "Height": 200 },
    { "Width": 100, "Height": 800 },
    { "Width": 90, "Height": 900 },
    { "Width": 75, "Height": 600 }*/
  ]
  //Copy the elements

    
    let FigmaFrame = figma.currentPage.selection[0] as FrameNode;
    console.log(FigmaFrame);    //the first child of the selection 
    
    
    let FigmaMaster = FigmaFrame.children[0] as FrameNode;

    //the first child of the selection

    //load all the fonts used in the FigmaMaster element
    /*
    let fonts = [...new Set(FigmaMaster.findAll((node: any) => node.type === "TEXT").map((node: any) => node.fontName.family + '***' + node.fontName.style))].map((font: any) => {
      const [family, style] = (font as string).split('***');
      console.log(family, style);
      return figma.loadFontAsync({ family, style }).catch(e => console.error(e));
    })
    await Promise.all(fonts)*/
    
    await Promise.all([figma.loadFontAsync({family: "Roboto", style: "Regular"}),figma.loadFontAsync({ family: "Inter", style: "Regular" })]);
    //make a list of all the current children of the FigmaFrame
    let originalChildren = FigmaFrame.children
    //So that they can be removed later

    
    for (let i = 0; i < inputData.length; i++) {
      let FigmaInstance = FigmaMaster.clone();
      let newHeight = Math.max(0.01,(FigmaInstance.absoluteBoundingBox?.height ?? 10));
    if (msg.count >= 2){
    newHeight = Math.max(0.01,inputData[i].Height); //Number must be greater than or equal to 0.01
    if (FigmaInstance.constraints.vertical === "MAX"){
    let height = FigmaInstance.absoluteBoundingBox?.height ?? 0;
    let addedHeight = newHeight - height;
      FigmaInstance.y = FigmaInstance.y - addedHeight
    }
    }
    if (msg.count >= 4){
      (FigmaInstance.findOne((node: any) => node.name.toLowerCase() === "yval") as TextNode).characters = newHeight.toString();
    }
    let newWidth = Math.max(0.01,FigmaInstance.absoluteBoundingBox?.width ?? 10)
    if (msg.count >= 1){
    newWidth = Math.max(0.01,inputData[i].Width); //Number must be greater than or equal to 0.01
    if (FigmaInstance.constraints.horizontal === "MAX"){
    let width = FigmaInstance.absoluteBoundingBox?.width ?? 0;
    let addedWidth = newWidth - width;
      FigmaInstance.x = FigmaInstance.x - addedWidth
    }
  }
    if (msg.count >= 3){
      (FigmaInstance.findOne((node: any) => node.name.toLowerCase() === "xval") as TextNode).characters = newWidth.toString();
    }
    if (msg.count >= 5){
      (FigmaInstance.findOne((node: any) => node.name.toLowerCase() === "text") as TextNode).characters = inputData[i].Text;
    }
    FigmaInstance.resize(newWidth,newHeight)
    console.log(FigmaInstance.findOne((node: any) => node.name.toLowerCase() === "point"))
    //FigmaInstance.findOne(node => node.name.toLowerCase() === "point").fills = [{type: 'SOLID', color: {r: 1, g: 0, b: 0}}]
    FigmaFrame.appendChild(FigmaInstance)
  }
  originalChildren.forEach((child: any) => {
    child.remove();
  });
  }

  // Make sure to close the plugin when you're done. Otherwise the plugin will
  // keep running, which shows the cancel button at the bottom of the screen.
  //figma.closePlugin();

  figma.on("selectionchange", () => {
    const selection = figma.currentPage.selection[0] as FrameNode;
    if (selection && selection.children && selection.children[0]) {
      const element = selection.children[0] as FrameNode;
      figma.ui.postMessage({
        parent: selection.name,
        master: selection.children[0].name,
        element: element.children.map((child: any) => child.name)
      });
    }
    
  })