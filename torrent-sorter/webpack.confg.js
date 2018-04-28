const path = require('path');
const fs = require('fs');
const webpack = require('webpack');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin')


const scriptFile = 'ab_torrent_sorter.user.js';

const headerDoc = fs.readFileSync('./src/' + scriptFile, 'utf8');
let userscriptHeader = '';
for (const line of headerDoc.split('\n')) {
  console.log(line);
  if (!line.startsWith('//'))
    break;
  userscriptHeader += line + '\n';
}

module.exports = {
  entry: './src/' + scriptFile,
  output: {
    filename: scriptFile,
    path: path.resolve(__dirname, 'dist')
  },
  module: {
    rules: [
        { test: /\.js$/, exclude: /node_modules/, loader: "babel-loader" }
    ]
  },
  mode: 'development',
  devtool: 'source-map',
  plugins: [
    /*new UglifyJsPlugin({
      test: scriptFile
    }),*/
    new webpack.BannerPlugin({
      raw: true,
      banner: userscriptHeader,
      entryOnly: true
    }),

  ]
};