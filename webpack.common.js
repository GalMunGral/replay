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
    alias: {
      "@runtime": path.resolve(__dirname, "lib/runtime"),
      "@assets": path.resolve(__dirname, "src/assets"),
      "@components": path.resolve(__dirname, "src/components"),
      "@observables": path.resolve(__dirname, "src/observables"),
    },
  },
  resolveLoader: {
    alias: {
      'replay-loader': path.resolve(__dirname, 'lib/replay-loader.js') 
    }
  },
  module: {
    noParse: /lodash/,
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: [
          {
            loader: "babel-loader",
            options: {
              // cacheDirectory: true,
            },
          },
          'replay-loader'
        ]
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
      __DEBUG__: Boolean(env?.debug)
    }),
    new ProvidePlugin({
      _: "lodash",
      lazy: [path.resolve(__dirname, "lib/runtime/renderer"), "lazy"],
      decor: [path.resolve(__dirname, "lib/runtime/decorator"), "decor"],
      observable: [path.resolve(__dirname, "lib/runtime/observable"), "observable"],
    }),
    new HtmlWebpackPlugin({
      title: "Cmail",
      favicon: path.resolve(__dirname, "src/assets/favicon.ico"),
    }),
    new CleanWebpackPlugin(),
  ]
});
