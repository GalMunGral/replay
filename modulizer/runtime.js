var modules = new Map();

function require(moduleId) {
  const module = modules.get(moduleId);
  if (!module.exports) {
    module.exports = {};
    module.init(module, module.exports, require);
  }
  return module.exports;
}

function _import(moduleId) {
  return Promise.resolve(require(moduleId));
}
