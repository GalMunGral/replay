const fs = require("fs");
const util = require("util");
const config = require("./config");
const readFile = util.promisify(fs.readFile);
const transformCJS = require("./transforms/cjs-esm");
const transformESM = require("./transforms/esm-cjs");
const analyzeESM = require("./transforms/es-module");
const analyzeCJS = require("./transforms/common-js");
const exportURL = require("./transforms/file-url");

function modulize(filePath, options = { native: true }) {
  const original = readFile(filePath, {
    encoding: "utf-8",
  }).then((content) => ({
    path: filePath,
    content,
  }));
  for (let rule of config.transforms) {
    if (rule.test.test(filePath)) {
      const transforms = options.native
        ? [analyzeESM, transformCJS, ...rule.use.map(require)]
        : [analyzeCJS, transformESM, ...rule.use.map(require)];
      return transforms.reduceRight(
        (previous, transform) => previous.then(transform),
        original
      );
    }
  }
  // Failed to "modulize" the file. Export a URL instead.
  return options.native
    ? exportURL(filePath)
    : exportURL(filePath).then(transformESM);
}

module.exports = modulize;
