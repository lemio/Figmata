let MainElement = figma.currentPage.selection[0]
let FirstElement = MainElement.children[0]
let data = 
    [
    { "Width": 10, "Height": 100 },
    { "Width": 20, "Height": 200 },
    { "Width": 40, "Height": 300 },
    { "Width": 65, "Height": 600 },
    { "Width": 15, "Height": 150 },
    ]
let originalChildren = FigmaFrame.children
data.forEach((row) => {
    let FigmaInstance = FirstElement.clone()
    FigmaInstance.resize(row.Width,row.Height)
    MainElement.appendChild(FigmaInstance)
})
originalChildren.forEach(child => {
    child.remove();
  });






figmata = {
    init: (type = "SELECTION") => {
        MainElement = figma.currentPage.selection[0];
        FirstElement = MainElement.children[0]
    }
}