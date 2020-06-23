const path = require("path");
const commonConfig = require("./webpack.common");
const merge = require("webpack-merge");

module.exports = merge(commonConfig, {
  mode: "development",
  module: {
    rules: [
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader"],
      },
      {
        test: /\.(png|svg|ico)$/,
        use: {
          loader: "file-loader",
          options: {
            outputPath: "images",
            name: "[name].[contenthash].[ext]",
          },
        },
      },
    ],
  },
  devtool: "source-map",
  devServer: {
    contentBase: path.resolve(__dirname, "public"),
    historyApiFallback: true,
  },
});
