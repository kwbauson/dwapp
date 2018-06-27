// import webpack from 'webpack'
// import HtmlWebpackPlugin from 'html-webpack-plugin'
const HtmlWebpackPlugin = require('html-webpack-plugin')
const MonacoWebpackPlugin = require('monaco-editor-webpack-plugin')

// const config: webpack.Configuration = {

const config = {
  entry: './src/index.tsx',
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules|webpack.config.ts/,
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({ title: 'DwApp ' }),
    new MonacoWebpackPlugin({
      languages: ['yaml'],
      features: [
        'bracketMatching',
        'clipboard',
        'comment',
        'contextmenu',
        'coreCommands',
        'cursorUndo',
        'dnd',
        'find',
        'folding',
        'format',
        'gotoLine',
        'hover',
        'inPlaceReplace',
        'iPadShowKeyboard',
        'linesOperations',
        'multicursor',
        'quickCommand',
        'smartSelect',
        'suggest',
        'transpose',
        'wordHighlighter',
        'wordOperations',
      ],
    }),
  ],
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },
  mode: 'development',
  devtool: 'cheap-module-eval-source-map',
}

const prodConfig = {
  mode: 'production',
  devtool: false,
}

module.exports = process.env.PROD ? { ...config, ...prodConfig } : config

// export default config
