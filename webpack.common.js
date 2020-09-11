const path = require("path");
const { DefinePlugin, ProvidePlugin } = require("webpack");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = (env) => ({
  entry: "./src/index.js",
  output: {
    path: path.resolve(__dirname, "public"),
    publicPath: "/",
    filename: "[name].[contenthash].js",
    chunkFilename: "[name].[contenthash].js",
  },
  resolve: {
    extensions: [".ts", ".js"],
    alias: {
      "@replay": path.resolve(__dirname, "@replay"),
      "@assets": path.resolve(__dirname, "src/assets"),
      "@components": path.resolve(__dirname, "src/components"),
      "@observables": path.resolve(__dirname, "src/observables"),
    },
  },
  resolveLoader: {
    alias: {
      "@replay": path.resolve(__dirname, "@replay"),
    },
  },
  module: {
    noParse: /lodash/,
    rules: [
      {
        test: /\.ts$/,
        use: ["babel-loader", "ts-loader"],
      },
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: ["babel-loader", "@replay/loader"],
      },
      {
        test: /\.(ttf|woff(2)?|eot)$/,
        use: {
          loader: "file-loader",
          options: {
            outputPath: "fonts",
            name: "[name].[contenthash].[ext]",
          },
        },
      },
    ],
  },
  plugins: [
    new DefinePlugin({
      __DEBUG__: Boolean(env?.debug),
      LOG: "console.debug",
    }),
    new HtmlWebpackPlugin({
      title: "Cmail",
      favicon: path.resolve(__dirname, "src/assets/favicon.ico"),
    }),
    // new CleanWebpackPlugin(),
  ],
});
