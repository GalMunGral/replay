module.exports = {
  entry: "./src/index",
  contentBase: "./public",
  resolve: {
    extensions: [".ts", ".js", ".jsx"],
  },
  transforms: [
    { test: /\.jsx$/, use: ["replay/transform"] },
    { test: /\.js$/, use: ["modulizer/transforms/common-js"] },
    { test: /\.ts$/, use: ["modulizer/transforms/typescript"] },
    { test: /\.css$/, use: ["modulizer/transforms/css-inline"] },
  ],
};
