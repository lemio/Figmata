const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const HtmlInlineCssWebpackPlugin = require('html-inline-css-webpack-plugin').default;
const HtmlInlineScriptPlugin = require('html-inline-script-webpack-plugin');
const ExtractTypesPlugin = require('./webpack-plugins/extract-types-plugin');

module.exports = (env, argv) => {
  const isProduction = argv.mode === 'production';
  
  return {
    mode: isProduction ? 'production' : 'development',
    
    // This is necessary because Figma's 'eval' works differently than normal eval
    devtool: isProduction ? false : 'inline-source-map',
    
    entry: {
      code: './src/main.ts', // Backend plugin code
      ui: ['./ui-src/scripts/main.ts'] // Frontend UI code
    },
    
    output: {
      filename: '[name].js',
      path: path.resolve(__dirname, 'dist'),
      clean: true,
      globalObject: 'globalThis'
    },
    
    resolve: {
      extensions: ['.ts', '.js'],
      alias: {
        '@shared': path.resolve(__dirname, 'shared'),
        '@src': path.resolve(__dirname, 'src'),
        '@ui': path.resolve(__dirname, 'ui-src')
      }
    },

    node: {
      global: false
    },
    
    module: {
      rules: [
        // Converts TypeScript code to JavaScript
        {
          test: /\.tsx?$/,
          use: {
            loader: 'ts-loader',
            options: {
              configFile: path.resolve(__dirname, 'tsconfig.json')
            }
          },
          exclude: /node_modules/,
        },
        // Handle CSS files - inline them into the HTML
        {
          test: /\.css$/,
          use: ['style-loader', 'css-loader'],
        },
      ],
    },
    
    plugins: [
      new webpack.DefinePlugin({
        'self': 'globalThis'
      }),
      new webpack.ProvidePlugin({
        self: ['globalThis']
      }),
      new webpack.BannerPlugin({
        banner: 'var self = globalThis;',
        raw: true,
        entryOnly: false,
        include: 'code.js'
      }),
      new ExtractTypesPlugin({
        outputPath: 'extracted-types.js'
      }),
      new HtmlWebpackPlugin({
        template: './ui-src/index.html',
        filename: 'ui.html',
        chunks: ['ui'],
        inject: 'body',
        minify: isProduction ? {
          collapseWhitespace: true,
          removeComments: true,
          removeRedundantAttributes: true,
          removeScriptTypeAttributes: true,
          removeStyleLinkTypeAttributes: true,
          useShortDoctype: true
        } : false
      }),
      new HtmlInlineCssWebpackPlugin(),
      new HtmlInlineScriptPlugin({
        scriptMatchPattern: [/ui\.js$/]
      })
    ],
    
    // Disable chunk splitting for single file output
    optimization: {
      splitChunks: {
        cacheGroups: {
          default: false,
          vendors: false,
        }
      },
    },
  };
};