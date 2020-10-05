const path = require("path");
const config = require("./config");
const modulize = require("./modulize");
const emit = require("./emit");

const root = process.cwd();

class ChunkData {
  modules = new Map();
  constructor(name, entry, async = false) {
    this.name = name;
    this.entry = entry;
    this.async = async;
  }

  get outputPath() {
    const filename = `${this.name}.bundle.js`;
    return path.join(root, config.contentBase, filename);
  }

  get url() {
    return `/${this.name}.bundle.js`;
  }
}

async function build(filePath, context, chunks, queue) {
  if (
    // will have been installed by the main chunk
    chunks.main.modules.has(filePath) ||
    // will have been installed by the first async chunk
    chunks.common.modules.has(filePath) ||
    chunks.vendor.modules.has(filePath)
  ) {
    return;
  }

  let moduleData;

  for (let asyncChunk of chunks.async.values()) {
    if (asyncChunk.modules.has(filePath)) {
      moduleData = asyncChunk.modules.get(filePath);
      chunks.common.modules.set(filePath, moduleData);
      asyncChunk.modules.delete(filePath);
      // A module can exist in at most one async chunk because
      // the second time it is encountered it would be moved to 'common'
      break;
    }
  }

  if (!moduleData) {
    moduleData = await modulize(filePath, { native: false });
    context.modules.set(filePath, moduleData);
  }

  // modules in the same chunk -> DFS
  for (let filePath of moduleData.deps || []) {
    await build(
      filePath,
      /node_modules/.test(filePath) ? chunks.vendor : context,
      chunks,
      queue
    );
  }

  // async chunks -> BFS
  for (let asyncEntry of moduleData.asyncDeps || []) {
    if (!chunks.async.has(asyncEntry) && !queue.includes(asyncEntry)) {
      // Not a existing chunk
      queue.push(asyncEntry);
    }
  }
}

module.exports = async function bundle(entry) {
  const chunks = {
    main: new ChunkData("main", entry),
    common: new ChunkData("common"),
    vendor: new ChunkData("vendor"),
    async: new Map(),
  };

  // DFS for modules within each chunk, BFS for chunks
  const queue = [];
  // Main entry needs different treatment
  await build(entry, chunks.main, chunks, queue);
  while (queue.length) {
    const asyncEntry = queue.shift();
    const asyncChunk = new ChunkData(
      `async-${chunks.async.size}`,
      asyncEntry,
      true
    );
    chunks.async.set(asyncEntry, asyncChunk);
    await build(asyncEntry, asyncChunk, chunks, queue);
  }

  emit(chunks);
};
