const path = require("path");
const { DefinePlugin } = require("webpack");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const { BundleAnalyzerPlugin } = require("webpack-bundle-analyzer");

const babelLoader = {
  loader: "babel-loader",
  options: {
    babelrcRoots: [".", "./node_modules/replay"],
  },
};

module.exports = (env) => ({
  entry: "./src/index",
  output: {
    path: path.resolve(__dirname, "public"),
    publicPath: "/",
    filename: "[name].[contenthash].js",
    chunkFilename: "[name].[contenthash].js",
  },
  resolve: {
    extensions: [".ts", ".js", ".jsx"],
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: [babelLoader, "ts-loader"],
      },
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        use: [babelLoader, "replay/loader"],
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
    new BundleAnalyzerPlugin(),
  ],
});
