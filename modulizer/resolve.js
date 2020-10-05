const path = require("path");
const fs = require("fs");
const config = require("./config");

function assertFileExists(pathname) {
  if (fs.lstatSync(pathname).isFile()) {
    return pathname;
  }
  throw "Not a file";
}

module.exports = function resolve(request) {
  // Resolve it as is
  try {
    return assertFileExists(request);
  } catch {}

  // Resolve it as a file
  for (let extension of config.resolve.extensions) {
    try {
      return assertFileExists(request + extension);
    } catch {}
  }

  // Resolve it as a directory
  for (let file of config.resolve.mainFiles) {
    for (let extension of config.resolve.extensions) {
      try {
        return assertFileExists(path.join(request, file) + extension);
      } catch {}
    }
  }

  throw `Module "${request}" not found`;
};
