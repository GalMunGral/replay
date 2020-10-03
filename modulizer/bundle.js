const util = require("util");
const fs = require("fs");
const path = require("path");
const modulize = require("./modulize");
const readFile = util.promisify(fs.readFile);

function indent(str, size) {
  return str.replace(/\n/g, "\n" + " ".repeat(size));
}

async function build(filePath, modules, visited) {
  if (visited.has(filePath)) return;
  const { moduleId, content, deps } = await modulize(filePath, {
    native: false,
  });
  const code = `
modules.set("${moduleId}", {
  exports: null,
  init: function (module, exports, require) {
    ${indent(content, 4)}
  }
});
`;
  modules.push(code);
  visited.add(filePath);
  if (deps) {
    for (let depFilePath of deps) {
      await build(depFilePath, modules, visited);
    }
  }
  return moduleId;
}

async function bundle(entryPath) {
  const runtime = await readFile(path.join(__dirname, "./runtime.js"));
  const modules = [];
  try {
    const moduleId = await build(entryPath, modules, new Set());
    const boot = `require("${moduleId}")`;
    return [runtime, ...modules, boot].join("\n");
  } catch (err) {
    console.log(err);
  }
}

module.exports = bundle;
