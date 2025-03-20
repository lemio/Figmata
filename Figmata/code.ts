
// This plugin will open a window to prompt the user to enter a number, and
// it will then create that many rectangles on the screen.

// This file holds the main code for plugins. Code in this file has access to
// the *figma document* via the figma global object.
// You can access browser APIs in the <script> tag inside "ui.html" which has a
// full browser environment (See https://www.figma.com/plugin-docs/how-plugins-run).

// This shows the HTML page in "ui.html".
figma.showUI(__html__);
figma.ui.resize(600, 1000);
/*
figma.ui.onmessage =  async (msg: any) => {
  console.log(msg);
}*/

function debounce(callback: () => void, timeout: number) {
  let timer: any;
  return (...args: []) => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      callback.apply(this, args);
    }, timeout);
  };
}
figma.ui.onmessage =  async (msg: {code: string}) => {
  const selection: any = figma.currentPage.selection[0]
  selection.setPluginData('code',msg.code)
  
  //selection.setRelaunchData({'edit': 'test'})
  const debouncedFunction =  debounce(() =>{
    try {
      eval(`//figmata.init()
    function delay(ms){
      return new Promise(resolve => setTimeout(resolve, ms));
    }
      async () =>  {
    let FigmaFrame = figma.currentPage.selection[0]
    let FirstChild = FigmaFrame.children[0];
    //await Promise.all([figma.loadFontAsync({family: "Roboto", style: "Regular"}),figma.loadFontAsync({ family: "Inter", style: "Regular" })]);
    let fonts = [...new Set(FigmaFrame.findAll(node => node.type === "TEXT").map(node => node.fontName.family + '***' + node.fontName.style))].map(font => {
          const [family, style] = font.split('***');
          console.log(family, style);
          return figma.loadFontAsync({ family, style }).catch(e => console.error(e));
        })
        //await Promise.all(fonts)
        
    let originalChildren = FigmaFrame.children
    originalChildren.slice(1).forEach(child => {
        child.remove();
      });
      delay(100)
    ${msg.code}
    delay(1)
    originalChildren.slice(0,1).forEach(child => {
        console.log(child)
        child.remove();
      });
      }()
      delay(1)
    `)
      }catch(error){
        console.log(error)
      }
  },100)
  debouncedFunction()
}
/*
figma.ui.onmessage =  async (msg: {type: string, count: number}) => {
  
  //Copy the elements

  let figmata = {init,clone,add}


  /*figmata.init()
  let data = [
    { "Quantity": 10, "Price": 100 },
    { "Quantity": 20, "Price": 200 },
    { "Quantity": 40, "Price": 300 },
    { "Quantity": 65, "Price": 600 },
    { "Quantity": 15, "Price": 150 }
  ]
  data.forEach((row) => {
      let element = figmata.clone()
      element.resize(row.Quantity,row.Price)                            //Add current size of main unit
      element.property["Type"] = "ScatterDefault"                       //Options: [Default, Property2, Property3]
      element.child['xVal'].characters = String(row.Quantity)           //Add current text of main unit
      element.child['yVal'].characters = "€" + String(row.Price)        //Add current text of main unit
      //element.child['xTick']
      //element.child['yTick']
      //element.child['Point']
      figmata.add()
  })*/
  
/*
  figmata.init()
  let data = [
    {}
  ]
  data.forEach((row) => {
      let element = figmata.clone()
      element.resize(100,100)                            
      element.property["Type"] = "ScatterDefault"  
      //Options: [ScatterDefault, SimpleBar, VerticalStackedBar]
      element.child['xVal'].characters = 'xVal'          
      element.child['yVal'].characters = 'yval'       
      //element.child['xTick']
      //element.child['yTick']
      //element.child['Point']
      figmata.add()
  })



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

    
    for (let i = 0; i < 5; i++) {
      let FigmaInstance = FigmaMaster.clone();
      let newHeight = FigmaInstance.absoluteBoundingBox.height;
    if (msg.count >= 2){
    newHeight = Math.max(Math.round(Math.random()*200),0.01); //Number must be greater than or equal to 0.01
    if (FigmaInstance.constraints.vertical === "MAX"){
    let height = FigmaInstance.absoluteBoundingBox.height;
    let addedHeight = newHeight - height;
      FigmaInstance.y = FigmaInstance.y - addedHeight
    }
    }
    if (msg.count >= 4){
      FigmaInstance.findOne(node => node.name.toLowerCase() === "yval").characters = newHeight.toString();
    }
    let newWidth = FigmaInstance.absoluteBoundingBox.width;
    if (msg.count >= 1){
    newWidth = Math.max(Math.round(Math.random()*200),0.01); //Number must be greater than or equal to 0.01
    if (FigmaInstance.constraints.horizontal === "MAX"){
    let width = FigmaInstance.absoluteBoundingBox.width;
    let addedWidth = newWidth - width;
      FigmaInstance.x = FigmaInstance.x - addedWidth
    }
  }
    if (msg.count >= 3){
      FigmaInstance.findOne(node => node.name.toLowerCase() === "xval").characters = newWidth.toString();
    }
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
*/


  const makeFigmata = async () => {
    //get the button that was clicked
    const selection: any = figma.currentPage.selection[0];
    selection.setRelaunchData({'edit': 'test', 'reset': 'yes'})
    console.log(selection.type)
    if (selection.type === 'FRAME'){
      
      console.log(figma.command)
      if (figma.command === 'reset'){
        selection.setPluginData('code','')
      }
    if (selection.getPluginData('code') !== ''){
      figma.ui.postMessage({
        test:selection.getPluginData('code'),
      });
      return;
    }
    

    
    const firstElement:any = selection.children[0]

    var propertiesString = ''
    for (const [key, value] of Object.entries(firstElement.componentProperties)) {
      const mainComponent = await firstElement.getMainComponentAsync()
      const options = mainComponent.parent.componentPropertyDefinitions[key].variantOptions.join(",")
      propertiesString += `\telement.setProperties({"${key}":"${value.value}"}) \n\t//${options}\n`
    }
    var childrenString = ''
    var elements = firstElement.children.slice()
    elements.reverse().forEach((child:any) => {
      switch(child.type){
        case 'TEXT':
          childrenString += `\telement.findChild(x => x.name === '${child.name}').characters = "${child.characters}"`
        break;
        default:
          childrenString += `\t//element.findChild(x => x.name === '${child.name}')`
      }

      if (child.componentProperties !== undefined){
        childrenString += `//prop`
      }
      childrenString += "\n"
    })
    const code = `
let data = [
    { "Quantity": 10, "Price": 100 },
    { "Quantity": 20, "Price": 200 },
    { "Quantity": 40, "Price": 300 },
    { "Quantity": 65, "Price": 600 },
    { "Quantity": 15, "Price": 150 }
  ]
data.forEach((row) => {
\tlet element = FirstChild.clone(); //${firstElement.name}
\telement.resize(${firstElement.absoluteBoundingBox.width},${firstElement.absoluteBoundingBox.height})
${propertiesString}${childrenString}
FigmaFrame.appendChild(element)
})
`
      figma.ui.postMessage({
        test:code,
      });
    }
  }

  figma.on("run",makeFigmata)
  figma.on("selectionchange",makeFigmata)