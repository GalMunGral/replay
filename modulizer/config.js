const path = require("path");

module.exports = {
  entry: "./src/index",
  contentBase: "./public",
  loaders: [
    { test: /\.js$/, use: [] },
    { test: /\.ts$/, use: ["modulizer/ts-loader"] },
    { test: /\.css$/, use: ["modulizer/css-loader"] },
  ],
};

try {
  const configPath = path.join(process.cwd(), "./modulize.config.js");
  assign(module.exports, require(configPath));
} catch {
} finally {
  console.log("loaded config:", module.exports);
}

function isNonNullObject(val) {
  return typeof val == "object" && val != null;
}

function assign(a, b) {
  Object.keys(b).forEach((key) => {
    if (isNonNullObject(a[key]) && isNonNullObject(b[key])) {
      if (Array.isArray(a[key]) && Array.isArray(b[key])) {
        a[key] = [...new Set([...a[key], ...b[key]])];
      } else if (Array.isArray(a) || Array.isArray(b)) {
        a[key] = b[key];
      } else {
        assign(a[key], b[key]);
      }
    } else {
      a[key] = b[key];
    }
  });
}
