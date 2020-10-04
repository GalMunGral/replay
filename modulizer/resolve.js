const path = require("path");
const config = require("./config");

module.exports = function resolve(request) {
  // Resolve it as is
  try {
    return require.resolve(request);
  } catch {}

  // Resolve it as a file
  for (let extension of config.resolve.extensions) {
    try {
      return require.resolve(request + extension);
    } catch {}
  }

  // Resolve it as a directory
  for (let file of config.resolve.mainFiles) {
    for (let extension of config.resolve.extensions) {
      try {
        return require.resolve(path.join(request, file) + extension);
      } catch {}
    }
  }

  throw `Module "${request}" not found`;
};
