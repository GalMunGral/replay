const path = require("path");
const fs = require("fs");
const util = require("util");
const config = require("./config");
const transformCJS = require("./transforms/commonjs");
const transformESM = require("./transforms/module");
const transformFile = require("./transforms/file");
const readFile = util.promisify(fs.readFile);

module.exports = function serve(file, stream, push) {
  function send(content) {
    if (push) {
      const urlPath = "/" + path.relative(process.cwd(), file.path);
      stream.pushStream({ ":path": urlPath }, (err, pushStream) => {
        if (err) throw err;
        stream.respond({ "content-type": "text/javascript" });
        pushStream.end(content);
      });
    } else {
      stream.respond({ "content-type": "text/javascript" });
      stream.end(content);
    }
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
        .then(({ content }) => send(content))
        .catch(console.error);
    }
  }

  // Failed to "modulize" the file. Export a URL instead.
  transformFile(file).then(({ content }) => {
    send(content);
  });
};
