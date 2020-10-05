const util = require("util");
const fs = require("fs");
const path = require("path");
const readFile = util.promisify(fs.readFile);
const writeFile = util.promisify(fs.writeFile);

function indent(str, size) {
  return str.replace(/\n/g, "\n" + " ".repeat(size));
}

function emitModule({ moduleId, content }) {
  return `\
modules.set("${moduleId}", {
  exports: null,
  init: function (module, exports, require) {
    ${indent(content, 4)}
  }
});`;
}

function emitChunkModules(chunk) {
  return [...chunk.modules.values()].map(emitModule).join("\n\n");
}

function emitChunkURL(asyncChunk) {
  const asyncEntry = asyncChunk.modules.get(asyncChunk.entry);
  return `chunks.set("${asyncEntry.moduleId}", "${asyncChunk.url}");`;
}

function emitAsyncEntryURLs(chunks) {
  return [...chunks.async.values()].map(emitChunkURL).join("\n");
}

async function emitMainEntry(chunks) {
  const main = chunks.main;
  const entry = main.modules.get(main.entry);
  const runtime = await readFile(path.join(__dirname, "./runtime.js"));
  const output = `\
\
${runtime}

${emitAsyncEntryURLs(chunks)}

(async function () {

  await install("${chunks.vendor.url}");

  ${indent(emitChunkModules(main), 2)}

  require("${entry.moduleId}");
})();`;

  await writeFile(main.outputPath, output);
}

async function emitAsyncEntries(chunks) {
  for (let asyncChunk of chunks.async.values()) {
    const output = `\
\
(async function () {

  await install("${chunks.common.url}");
  
  ${indent(emitChunkModules(asyncChunk), 2)}
  
  requests.get("${asyncChunk.url}").resolve();
})();`;

    await writeFile(asyncChunk.outputPath, output);
  }
}

async function emitNonEntry(chunk) {
  const output = `\
\
${emitChunkModules(chunk)}

requests.get("${chunk.url}").resolve();`;

  await writeFile(chunk.outputPath, output);
}

module.exports = async function emit(chunks) {
  await emitMainEntry(chunks);
  await emitAsyncEntries(chunks);
  await emitNonEntry(chunks.vendor);
  await emitNonEntry(chunks.common);
};
