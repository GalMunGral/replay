#!/usr/bin/env node
const fs = require("fs");
const path = require("path");
const util = require("util");
const http2 = require("http2");
const mime = require("mime-types");
const config = require("./config");
const resolve = require("./resolve");
const serve = require("./serve");
const readFile = util.promisify(fs.readFile);

http2
  .createSecureServer({
    key: fs.readFileSync(path.join(__dirname, "localhost-privkey.pem")),
    cert: fs.readFileSync(path.join(__dirname, "localhost-cert.pem")),
  })
  .on("error", (err) => console.error(err))
  .on("stream", handleRequest)
  .listen(8080, () => {
    console.log("Modulizer listening on port 8080");
  });

function handleRequest(stream, headers) {
  const root = process.cwd();
  const url = headers[":path"];

  Promise.resolve()
    .then(() => {
      // Serve file as ES module
      const file = { path: path.join(root, url) };
      require.resolve(file.path);
      serve(file, stream, false);
    })
    .catch(() => {
      // Serve file as an asset
      const filePath = path.join(root, config.contentBase, url);
      return readFile(filePath).then((content) => {
        stream.respond({ "content-type": mime.lookup(filePath) });
        stream.end(content);
      });
    })
    .catch(() => {
      // Serve entry file
      const partial = path.join(root, config.entry);
      const full = resolve(partial);
      const relative = "/" + path.relative(root, full);
      stream.respond({ "content-type": "text/html" });
      stream.end(`<script type="module" src="${relative}"></script>`);
    })
    .catch(() => {
      stream.respond({ ":status": 404 });
      stream.end("Not Found");
    });
}
