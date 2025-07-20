const fs = require('fs');
const path = require('path');

class ExtractTypesPlugin {
  constructor(options = {}) {
    this.options = {
      outputPath: options.outputPath || 'extracted-types.js',
      ...options
    };
  }

  apply(compiler) {
    // Run before compilation starts to ensure the file exists when webpack resolves modules
    compiler.hooks.beforeCompile.tapAsync('ExtractTypesPlugin', (params, callback) => {
        try {
          console.log('ExtractTypesPlugin: Starting type extraction...');
          const nodeModulesPath = path.resolve(compiler.context, 'node_modules');
          
          // Extract Figma types
          const figmaTypesPath = path.join(nodeModulesPath, '@figma/plugin-typings');
          let figmaTypes = '';
          
          if (fs.existsSync(figmaTypesPath)) {
            const indexPath = path.join(figmaTypesPath, 'index.d.ts');
            const pluginApiPath = path.join(figmaTypesPath, 'plugin-api.d.ts');
            
            if (fs.existsSync(indexPath)) {
              figmaTypes += fs.readFileSync(indexPath, 'utf8') + '\n';
            }
            if (fs.existsSync(pluginApiPath)) {
              figmaTypes += fs.readFileSync(pluginApiPath, 'utf8') + '\n';
            }
          }

          // Extract D3 types from @types/d3 package
          const d3TypesPath = path.join(nodeModulesPath, '@types/d3');
          let d3Types = '';
          
          if (fs.existsSync(d3TypesPath)) {
            // Read the main d3 types index
            const d3IndexPath = path.join(d3TypesPath, 'index.d.ts');
            //d3Types += 'const d3 = (function() {\n'
            if (fs.existsSync(d3IndexPath)) {
              d3Types += fs.readFileSync(d3IndexPath, 'utf8') + '\n';
            }

            // Include all D3 sub-modules as per the d3 package dependencies
            const d3Modules = [
              'd3-array', 'd3-axis', 'd3-brush', 'd3-chord', 'd3-color', 'd3-contour',
              'd3-delaunay', 'd3-dispatch', 'd3-drag', 'd3-dsv', 'd3-ease', 'd3-fetch',
              'd3-force', 'd3-format', 'd3-geo', 'd3-hierarchy', 'd3-interpolate',
              'd3-path', 'd3-polygon', 'd3-quadtree', 'd3-random', 'd3-scale',
              'd3-scale-chromatic', 'd3-selection', 'd3-shape', 'd3-time',
              'd3-time-format', 'd3-timer', 'd3-transition', 'd3-zoom','d3-sankey'
            ];
            
            // Add the actual D3 sub-module types
            d3Modules.forEach(moduleName => {
              const modulePath = path.join(nodeModulesPath, '@types', moduleName, 'index.d.ts');
              if (fs.existsSync(modulePath)) {
                const content = fs.readFileSync(modulePath, 'utf8');
                // Clean up the content for Monaco consumption
                /*const cleanedContent = content
                  .replace(/\/\/\/ <reference [^>]*>/g, '') // Remove triple-slash references
                  .replace(/export \* from ['""][^'"]*['""]/g, '') // Remove re-exports
                  .replace(/export \{[^}]*\} from ['""][^'"]*['""]/g, '') // Remove named re-exports
                  .replace(/export default [^;]*;/g, '') // Remove default exports
                  .replace(/export (declare )?/g, 'declare ') // Convert exports to declares
                  .trim();*/
                if (content && content.length > 10) {
                  d3Types += `\n// Types from ${moduleName}\n${content}\n`;
                }
              }
            });
            //d3Types += '}());\n';
          }

          // Clean up the types to remove problematic patterns
          figmaTypes = this.cleanTypeDefinitions(figmaTypes);
          d3Types = this.cleanTypeDefinitions(d3Types);

          console.log('ExtractTypesPlugin: Figma types length:', figmaTypes.length);
          console.log('ExtractTypesPlugin: D3 types length:', d3Types.length);

          // Write the types to a file that can be imported
          const extractedTypesPath = path.join(compiler.context, 'ui-src/scripts/services/extracted-types-generated.ts');
          const moduleContent = `// Auto-generated type definitions extracted from node_modules
// This file is generated during the webpack build process

export interface ExtractedTypes {
  figma: string;
  d3: string;
}

export const EXTRACTED_TYPES: ExtractedTypes = {
  figma: ${JSON.stringify(figmaTypes)},
  d3: ${JSON.stringify(d3Types)}
};

export const getExtractedTypes = (): ExtractedTypes => EXTRACTED_TYPES;
`;

          fs.writeFileSync(extractedTypesPath, moduleContent, 'utf8');

          console.log('ExtractTypesPlugin: Types written to', extractedTypesPath);
          callback();

        } catch (error) {
          console.error('ExtractTypesPlugin error:', error);
          callback(error);
        }
      });
  }

  cleanTypeDefinitions(content) {
    return content
      // Remove triple-slash references that can cause issues
      .replace(/\/\/\/ <reference [^>]*>/g, '')
      // Remove import statements
      .replace(/import[^;]*;/g, '')
      // Clean up multiple empty lines
      .replace(/\n\s*\n\s*\n/g, '\n\n')
      .trim();
  }
}

module.exports = ExtractTypesPlugin;
