const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const { title } = require("process");

module.exports = {
  entry: "./src/index.js",
  mode: "development",
  devServer: {
    open: true,
  },
  module: {
    rules: [
      {
        test: /\.css$/i,
        use: ["style-loader", "css-loader"],
      },
      {
        test: /\.obj$/,
        loader: "webpack-obj-loader",
      },
    ],
  },
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "./dist/bundle.js",
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: "src/template.html",
      title: "New template",
    }),
    new CleanWebpackPlugin(),
  ],
};
