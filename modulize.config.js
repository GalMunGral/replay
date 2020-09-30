module.exports = {
  entry: "./src/index",
  contentBase: "./public",
  mainFiles: ["index"],
  extensions: [".ts", ".tsx", ".js", ".jsx"],
  transforms: [
    { test: /\.jsx$/, use: ["replay/transform"] },
    { test: /\.js$/, use: ["modulizer/transforms/commonjs"] },
    { test: /\.ts$/, use: ["modulizer/transforms/typescript"] },
    { test: /\.css$/, use: ["modulizer/transforms/css"] },
  ],
};
