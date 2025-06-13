const path = require('path');

module.exports = (env, argv) => {
  const isProduction = argv.mode === 'production';
  
  return {
    mode: argv.mode || 'development',
    entry: './src/code.ts',
    target: 'node', // Figma plugin environment is more like Node.js
    devtool: isProduction ? false : 'inline-source-map',
    module: {
      rules: [
        {
          test: /\.tsx?$/,
          use: 'ts-loader',
          exclude: /node_modules/,
        },
      ],
    },
    resolve: {
      extensions: ['.tsx', '.ts', '.js'],
      alias: {
        '@': path.resolve(__dirname, 'src'),
        '@utils': path.resolve(__dirname, 'src/utils'),
      },
    },
    output: {
      filename: 'code.js',
      path: path.resolve(__dirname, '.'),
      clean: false, // Don't clean the root directory
    },
    // Optimize for Figma plugin constraints
    optimization: {
      minimize: isProduction,
    },
    // Don't bundle Node.js built-ins since Figma provides its own environment
    externals: {
      'figma': 'figma'
    }
  };
};
