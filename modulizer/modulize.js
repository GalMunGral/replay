const path = require("path");
const fs = require("fs");
const util = require("util");
const config = require("./config");
const transformCJS = require("./transforms/commonjs");
const transformESM = require("./transforms/module");
const transformFile = require("./transforms/file");
const readFile = util.promisify(fs.readFile);

const moduleCache = new Map(); // path -> content

function send(file, options) {
  const { stream, push } = options;
  if (stream) {
    if (push) {
      // const root = process.cwd();
      // const url = "/" + path.relative(root, file.path);
      // stream.pushStream({ ":path": url }, (err, pushStream) => {
      //   if (err) throw err;
      //   pushStream.respond({
      //     ":status": 200,
      //     "content-type": "text/javascript",
      //   });
      //   pushStream.end(file.content);
      // });
    } else {
      stream.respond({ "content-type": "text/javascript" });
      stream.end(file.content);
    }
  }
  moduleCache.set(file.path, file);
}

function modulize(file, options = {}) {
  if (moduleCache.has(file.path)) {
    console.info("Hit:", file.path);
    const cached = moduleCache.get(file.path);
    send(cached, options);
    return;
  } else {
    console.info("Miss:", file.path);
  }

  const original = readFile(file.path, {
    encoding: "utf-8",
  }).then((content) => ({
    ...file,
    content,
  }));

  for (let rule of config.transforms) {
    if (rule.test.test(file.path)) {
      return [transformESM, transformCJS, ...rule.use.map(require)]
        .reduceRight(
          (previous, transform) => previous.then(transform),
          original
        )
        .then((file) => {
          send(file, options);
          // setImmediate(() => {
          //   file.deps.forEach((path) => {
          //     if (moduleCache.has(path)) return;
          //     const dep = { path };
          //     modulize(dep, { ...options, push: true });
          //   });
          // });
        })
        .catch(console.error);
    }
  }

  // Failed to "modulize" the file. Export a URL instead.
  transformFile(file).then((file) => send(file, options));
}

function invalidateCache(file) {
  moduleCache.delete(file.path);
  modulize(file); // No option object - just cache it
}

module.exports = {
  modulize,
  invalidateCache,
};
