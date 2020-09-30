#!/usr/bin/env node
const fs = require("fs");
const path = require("path");
const util = require("util");
const http2 = require("http2");
const mime = require("mime-types");
const WebSocket = require("ws");
const { debounce } = require("lodash");
const config = require("./config");
const resolve = require("./resolve");
const { modulize, invalidateCache } = require("./modulize");
const readFile = util.promisify(fs.readFile);

const watchers = new Map(); // file path -> watcher

const server = http2
  .createSecureServer({
    // https://github.com/websockets/ws/issues/1458#issuecomment-455327412
    allowHTTP1: true,
    key: fs.readFileSync(path.join(__dirname, "localhost-privkey.pem")),
    cert: fs.readFileSync(path.join(__dirname, "localhost-cert.pem")),
  })
  .on("error", (err) => console.error(err))
  .on("stream", handleRequest)
  .listen(8080, () => {
    console.log("Modulizer listening on port 8080");
  });

const wss = new WebSocket.Server({ server, path: "/ws" })
  .on("error", (err) => console.error(err))
  .on("connection", (ws) => {
    console.log("new connection", wss.clients.size, Date.now());
  });

const debouncedReload = debounce((file) => {
  invalidateCache(file);
  wss.clients.forEach((ws) => {
    ws.send("UPDATE");
  });
}, 10);

function handleRequest(stream, headers) {
  const root = process.cwd();
  const url = headers[":path"];

  Promise.resolve()
    .then(() => {
      // Serve file as ES module
      const file = { path: path.join(root, url) };
      require.resolve(file.path);
      modulize(file, { stream, push: false });
      return file;
    })
    .catch(() => {
      // Serve file as an asset
      const file = { path: path.join(root, config.contentBase, url) };
      return readFile(file.path).then((content) => {
        stream.respond({ "content-type": mime.lookup(file.path) });
        stream.end(content);
        return file;
      });
    })
    .then((file) => {
      // `file` could be either a module or asset.
      if (!watchers.has(file.path)) {
        const watcher = fs.watch(file.path, (event) => {
          if (event === "change") {
            debouncedReload(file);
          }
        });
        watchers.set(file.path, watcher);
      }
    })
    .catch(() => {
      // Serve entry file
      const entryPath = (() => {
        const partial = path.join(root, config.entry);
        const absolute = resolve(partial);
        const relative = path.relative(root, absolute);
        return "/" + relative;
      })();

      const wsClientPath = (() => {
        const absolute = path.join(__dirname, "./ws-client.js");
        const relative = path.relative(root, absolute);
        return "/" + relative;
      })();

      const html = `
        <script type="module" src="${entryPath}"></script>
        <script type="module" src="${wsClientPath}"></script>
      `;

      stream.respond({ "content-type": "text/html; charset=utf-8" });
      stream.end(html);
    })
    .catch(() => {
      stream.respond({ ":status": 404 });
      stream.end("Not Found");
    });
}
