const path = require("path");
const fs = require("fs");
const util = require("util");
const config = require("./config");
const transformCJS = require("./transforms/commonjs");
const transformESM = require("./transforms/module");
const transformFile = require("./transforms/file");
const readFile = util.promisify(fs.readFile);

const moduleCache = new Map(); // file path => file content
const processed = new Set(); // file paths

function send(file, options) {
  const { stream, push } = options;
  if (push) {
    // Try caching for now
    moduleCache.set(file.path, file);
    console.log("Pushed:", file.path);
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
  processed.add(file.path);
}

module.exports = function serve(file, options) {
  if (moduleCache.has(file.path)) {
    console.log("Hit:", file.path);
    const cached = moduleCache.get(file.path);
    send(cached, options);
    return;
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

          file.deps.forEach((path) => {
            if (processed.has(path)) return;
            // TODO: Enable HTTP/2 server push
            const dep = { path };
            serve(dep, { ...options, push: true });
          });
        })
        .catch(console.error);
    }
  }

  // Failed to "modulize" the file. Export a URL instead.
  transformFile(file).then((file) => send(file, options));
};
