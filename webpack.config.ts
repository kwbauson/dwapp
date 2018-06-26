// import webpack from 'webpack'
// import HtmlWebpackPlugin from 'html-webpack-plugin'
const HtmlWebpackPlugin = require('html-webpack-plugin')
const MonacoWebpackPlugin = require('monaco-editor-webpack-plugin')

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
  plugins: [new HtmlWebpackPlugin(), new MonacoWebpackPlugin()],
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },
  mode: 'development',
  devtool: 'inline-source-map',
}

// export default config
