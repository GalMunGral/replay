const path = require("path");
const fs = require("fs");
const util = require("util");
const config = require("./config");
const readFile = util.promisify(fs.readFile);
const transformCJS = require("./transforms/common-js");
const analyzeESM = require("./transforms/es-module");
const exportURL = require("./transforms/file-url");

function modulize(file) {
  const original = readFile(file.path, {
    encoding: "utf-8",
  }).then((content) => ({
    ...file,
    content,
  }));
  for (let rule of config.transforms) {
    if (rule.test.test(file.path)) {
      const transforms = [analyzeESM, transformCJS, ...rule.use.map(require)];
      return transforms.reduceRight(
        (previous, transform) => previous.then(transform),
        original
      );
    }
  }
  // Failed to "modulize" the file. Export a URL instead.
  return exportURL(file);
}

module.exports = modulize;
