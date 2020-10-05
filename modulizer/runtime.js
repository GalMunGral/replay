var chunks = new Map();
var requests = new Map();
var modules = new Map();

function install(chunkURL) {
  return new Promise((resolve) => {
    requests.set(chunkURL, { resolve });
    const script = document.createElement("script");
    script.src = chunkURL;
    document.head.appendChild(script);
  });
}

function require(moduleId) {
  const module = modules.get(moduleId);
  if (!module.exports) {
    module.exports = {};
    module.init(module, module.exports, require);
  }
  return module.exports;
}

async function dynamicImport(entry) {
  const chunkURL = chunks.get(entry);
  await install(chunkURL);
  return require(entry);
}
