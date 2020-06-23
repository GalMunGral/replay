const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const OptimizeCssAssetsPlugin = require("optimize-css-assets-webpack-plugin");
const ParallelUglifyPlugin = require("webpack-parallel-uglify-plugin");
const commonConfig = require("./webpack.common");
const merge = require("webpack-merge");

module.exports = merge(commonConfig, {
  mode: "production",
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [MiniCssExtractPlugin.loader, "css-loader"],
      },
      {
        test: /\.(png|svg|ico)$/,
        use: {
          loader: "url-loader",
          options: {
            limit: 5 * 1024,
            outputPath: "images",
            name: "[name].[contenthash].[ext]",
          },
        },
      },
    ],
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: "[name].[contenthash].css",
    }),
    new OptimizeCssAssetsPlugin(),
    new ParallelUglifyPlugin({}),
  ],
  devtool: "source-map",
});
