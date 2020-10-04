const path = require("path");

function isNonNullObject(val) {
  return typeof val == "object" && val != null;
}

function merge(target, source) {
  Object.keys(source).forEach((key) => {
    if (isNonNullObject(target[key]) && isNonNullObject(source[key])) {
      if (Array.isArray(target[key]) && Array.isArray(source[key])) {
        target[key] = [...new Set([...target[key], ...source[key]])];
      } else if (Array.isArray(target) || Array.isArray(source)) {
        target[key] = source[key];
      } else {
        merge(target[key], source[key]);
      }
    } else {
      target[key] = source[key];
    }
  });
}

module.exports = {
  entry: "./src/index",
  contentBase: ".",
  resolve: {
    mainFiles: ["index"],
    extensions: [".js"],
  },
  transforms: [],
};

try {
  merge(
    module.exports,
    require(path.join(process.cwd(), "./modulize.config.js"))
  );
} catch {
  console.warn("No config file found.");
} finally {
  console.info("Loaded config:\n", module.exports);
}
