# Figmata Code

![GIF figmata Code](https://github.com/user-attachments/assets/3c1c92b3-00f3-4d8e-bbb8-8e9e84ddfb50)

# Figmata

A plugin for Figma to visualize data from json or csv
![Figmata_GIF](https://github.com/user-attachments/assets/d3b609fc-bde2-46a4-81e1-1ab9ffe9b3fa)

# Backlog

* [x] Add TSV parsing function to the default
       ![image](https://github.com/user-attachments/assets/3fdf2de9-1738-4ddf-9a5d-5f723b77cec0)


  * [x] Have a safer function for scaling (where 0 is allowed, where it scales related to how it is auto aligned to the frame... , changing the characters allow for numbers, colour allow for HEX names or RGB etc d3 schemes https://d3js.org/d3-scale-chromatic/categorical
* [x] Add more deliberite choise on what you are currently editing (and how to switch between contexts), currently the focus is not sufficient since users might start chaning elements in the meantime.

  * [x] Add a pause sync button, now it is a deliberate auto-refresh button
  * [x] Add a lock to components button
  * [x] See a list of elements on the page (like files in VScode)
  * [ ] Be able to map data to the page and have the charts 'depend' on this global context
* [ ] Better examples:

  * [x] Tufte Boxplot (vs normal boxplot)
  * [ ] Tufte 3 dimensions on one plot (x vs y, y vs z and x vs z)
  * [x] Likert scale for questionaires
* [ ] Better UI for selecting

  * [ ] Make it more data to form style; same way as figma shows their elements and properties
  * [ ] Have prompt based coupling between raw data and parsed data for visualisation
    * [ ] Try out this concept within GPT

Sketch of how it could be: 
![image](https://github.com/user-attachments/assets/70de0dcf-3cee-4cbf-9c1f-c021704061aa)

Below are the steps to get your plugin running. You can also find instructions at:

  https://www.figma.com/plugin-docs/plugin-quickstart-guide/

This plugin template uses Typescript and NPM, two standard tools in creating JavaScript applications.

First, download Node.js which comes with NPM. This will allow you to install TypeScript and other
libraries. You can find the download link here:

  https://nodejs.org/en/download/

Next, install TypeScript using the command:

  npm install

Then to build the whole system

  npm run build

If you are familiar with JavaScript, TypeScript will look very familiar. In fact, valid JavaScript code
is already valid Typescript code.
