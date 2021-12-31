const path = require("path");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const HTMLWebpackPlugin = require("html-webpack-plugin");
module.exports = {
  mode: "development",
  entry: path.resolve(__dirname, `src/index.js`),
  output: { path:  path.resolve(__dirname, `dist`), filename: "bundle.js" },
  devServer: {
    static: path.resolve(__dirname, `assets`)
  },
  plugins: [
    new CopyWebpackPlugin({
      patterns: [
        { from: path.resolve(__dirname, `assets`), to: path.resolve(__dirname, `dist`) },
      ],
    }),
    new HTMLWebpackPlugin({
      title: "Rickety Ralph",
      template: "template.html"
    }),
  ]
};
