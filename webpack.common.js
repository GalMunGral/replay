const path = require("path");
const { ProvidePlugin, IgnorePlugin } = require("webpack");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const HappyPack = require("happypack");

module.exports = {
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
  module: {
    noParse: /lodash/,
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: "happypack/loader?id=babel",
      },
      {
        test: /\.(ttf|woff(2)?|eot)$/,
        // use: "happypack/loader?id=fonts",
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
    new ProvidePlugin({
      _: "lodash",
      lazy: [path.resolve(__dirname, "lib/runtime/renderer"), "lazy"],
      decor: [path.resolve(__dirname, "lib/runtime/decorator"), "decor"],
      observable: [
        path.resolve(__dirname, "lib/runtime/observable"),
        "observable",
      ],
    }),
    new HappyPack({
      id: "babel",
      loaders: [
        {
          loader: "babel-loader",
          options: {
            cacheDirectory: true,
          },
        },
      ],
    }),
    // new HappyPack({
    //   id: "fonts",
    //   loaders: [
    //     {
    //       loader: "file-loader",
    //       options: {
    //         outputPath: "fonts",
    //         name: "[name].[contenthash].[ext]",
    //       },
    //     },
    //   ],
    // }),
    new HtmlWebpackPlugin({
      title: "Fmail",
      favicon: path.resolve(__dirname, "src/assets/favicon.ico"),
    }),
    new CleanWebpackPlugin(),
  ],
  optimization: {
    splitChunks: {
      chunks: "all",
      cacheGroups: {
        vendor: {
          name: "vendor",
          test: /node_modules/,
          priority: 2,
        },
        common: {
          name: "common",
          minSize: 0,
          minChunks: 2,
          priority: 1,
        },
      },
    },
  },
};
