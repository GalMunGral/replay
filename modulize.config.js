module.exports = {
  entry: "./src-new/index",
  contentBase: "./public",
  resolve: {
    extensions: [".ts", ".js", ".jsx"],
  },
  transforms: [
    { test: /\.jsx$/, use: ["replay-next/transform"] },
    { test: /\.js$/, use: ["modulizer/transforms/cjs-esm"] },
    { test: /\.ts$/, use: ["modulizer/transforms/typescript"] },
    { test: /\.css$/, use: ["modulizer/transforms/css"] },
  ],
};
