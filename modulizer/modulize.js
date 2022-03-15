const fs = require("fs");
const util = require("util");
const config = require("./config");
const readFile = util.promisify(fs.readFile);
const transformCJS = require("./transforms/cjs-esm");
const transformESM = require("./transforms/esm-cjs");
const analyzeESM = require("./transforms/es-module");
const analyzeCJS = require("./transforms/common-js");
const exportURL = require("./transforms/file-url");

function requireFromWorkingDir(id) {
  const resolved = require.resolve(id, {
    paths: [process.cwd()],
  });
  return require(resolved);
}

function modulize(filePath, options = { native: true }) {
  const original = readFile(filePath, {
    encoding: "utf-8",
  }).then((content) => ({
    path: filePath,
    content,
  }));
  for (let rule of config.transforms) {
    if (rule.test.test(filePath)) {
      try {
        const transforms = options.native
          ? [analyzeESM, transformCJS, ...rule.use.map(requireFromWorkingDir)]
          : [analyzeCJS, transformESM, ...rule.use.map(requireFromWorkingDir)];
        return transforms.reduceRight(
          (previous, transform) => previous.then(transform),
          original
        );
      } catch (e) {
        // console.log(process.cwd());
        console.debug(e);
      }
    }
  }
  // Failed to "modulize" the file. Export a URL instead.
  return options.native
    ? exportURL(filePath)
    : exportURL(filePath).then(transformESM);
}

module.exports = modulize;
