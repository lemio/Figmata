// This plugin will open a window to prompt the user to enter a number, and
// it will then create that many rectangles on the screen.

// This file holds the main code for plugins. Code in this file has access to
// the *figma document* via the figma global object.
// You can access browser APIs in the <script> tag inside "ui.html" which has a
// full browser environment (See https://www.figma.com/plugin-docs/how-plugins-run).

// This shows the HTML page in "ui.html".
figma.showUI(__html__);
figma.ui.resize(329, 324);

figma.on("selectionchange", () => {
  const selection = figma.currentPage.selection[0];
  if (selection && selection.children && selection.children[0] && selection.children[0].children) {
    figma.ui.postMessage({
      parent: selection.name,
      master: selection.children[0].name,
      element: selection.children[0].children.map(child => child.name)
    });
  }

figma.ui.onmessage =  async (msg: {type: string, count: number}) => {
  
  //Copy the elements



  if (msg.type === 'update-datavis') {
    console.log("Frame")
    let FigmaFrame = figma.currentPage.selection[0]
    console.log(figma.currentPage.selection[0])    //the first child of the selection 
    console.log("Instance")
    console.log(figma.currentPage.selection[0].children[0]) 
    let FigmaMaster = figma.currentPage.selection[0].children[0];
    //the first child of the selection

    //load all the fonts used in the FigmaMaster element
    let fonts = [...new Set(FigmaMaster.findAll(node => node.type === "TEXT").map(node => node.fontName.family + '***' + node.fontName.style))].map(font => {
      const [family, style] = font.split('***');
      console.log(family, style);
      return figma.loadFontAsync({ family, style }).catch(e => console.error(e));
    })
    await Promise.all(fonts)
    
    //await Promise.all([figma.loadFontAsync({family: "Roboto", style: "Regular"}),figma.loadFontAsync({ family: "Inter", style: "Regular" })]);
    //make a list of all the current children of the FigmaFrame
    let originalChildren = FigmaFrame.children
    //So that they can be removed later

    
    for (let i = 0; i < msg.count; i++) {
      let FigmaInstance = FigmaMaster.clone();
    let newHeight = Math.max(Math.round(Math.random()*200),0.01); //Number must be greater than or equal to 0.01
    if (FigmaInstance.constraints.vertical === "MAX"){
    let height = FigmaInstance.absoluteBoundingBox.height;
    let addedHeight = newHeight - height;
      FigmaInstance.y = FigmaInstance.y - addedHeight
    }
    FigmaInstance.findOne(node => node.name.toLowerCase() === "yval").characters = newHeight.toString();

    let newWidth = Math.max(Math.round(Math.random()*200),0.01); //Number must be greater than or equal to 0.01
    if (FigmaInstance.constraints.horizontal === "MAX"){
    let width = FigmaInstance.absoluteBoundingBox.height;
    let addedWidth = newWidth - width;
      FigmaInstance.x = FigmaInstance.x - addedWidth
    }
    
    FigmaInstance.findOne(node => node.name.toLowerCase() === "xval").characters = newWidth.toString();

    FigmaInstance.resize(newWidth,newHeight)
    console.log(FigmaInstance.findOne(node => node.name.toLowerCase() === "point"))
    //FigmaInstance.findOne(node => node.name.toLowerCase() === "point").fills = [{type: 'SOLID', color: {r: 1, g: 0, b: 0}}]
    figma.currentPage.selection[0].appendChild(FigmaInstance)
  }
  originalChildren.forEach(child => {
    child.remove();
  });
  }

  // Make sure to close the plugin when you're done. Otherwise the plugin will
  // keep running, which shows the cancel button at the bottom of the screen.
  //figma.closePlugin();
};
