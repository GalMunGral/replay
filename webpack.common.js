const path = require("path");
const { DefinePlugin, ProvidePlugin } = require("webpack");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const { BundleAnalyzerPlugin } = require("webpack-bundle-analyzer");

const babelLoader = {
  loader: "babel-loader",
  options: {
    babelrcRoots: [".", "./node_modules/replay"],
  },
};

const replayCore = path.resolve(__dirname, "replay/core/index");

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
    new ProvidePlugin({
      __STEP_INTO__: [replayCore, "__STEP_INTO__"],
      __STEP_OUT__: [replayCore, "__STEP_OUT__"],
      __STEP_OVER__: [replayCore, "__STEP_OVER__"],
      __RUN__: [replayCore, "__RUN__"],
    }),
    new HtmlWebpackPlugin({
      title: "Cmail",
      favicon: path.resolve(__dirname, "src/assets/favicon.ico"),
    }),
    // new BundleAnalyzerPlugin(),
  ],
});
