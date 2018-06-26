// import webpack from 'webpack'
// import HtmlWebpackPlugin from 'html-webpack-plugin'
const HtmlWebpackPlugin = require('html-webpack-plugin')
const MonacoWebpackPlugin = require('monaco-editor-webpack-plugin')

const mode = process.env.PROD ? 'production' : 'development'
const devtool = process.env.PROD ? false : 'eval-source-map'
// const config: webpack.Configuration = {
module.exports = {
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
    new HtmlWebpackPlugin(),
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
  mode,
  devtool,
}

// export default config
