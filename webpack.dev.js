const path = require("path");
const merge = require("webpack-merge");
const commonConfig = require("./webpack.common");

module.exports = (env) => merge(commonConfig(env), {
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
