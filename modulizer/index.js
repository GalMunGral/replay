#!/usr/bin/env node
const fs = require("fs");
const path = require("path");
const util = require("util");
const http2 = require("http2");
const mime = require("mime-types");
const puppeteer = require("puppeteer");
const WebSocket = require("ws");
const { debounce } = require("lodash");
const config = require("./config");
const resolve = require("./resolve");
const modulize = require("./modulize");
const bundle = require("./bundle");
const readFile = util.promisify(fs.readFile);

const root = process.cwd();

const watchers = new Map(); // path -> watcher
const cache = new Map(); // path -> content
const pageCache = new Map(); // path -> pre-rendered HTML

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
  cache.set(file.path, file);
}

const server = http2
  .createSecureServer({
    // https://github.com/websockets/ws/issues/1458#issuecomment-455327412
    allowHTTP1: true,
    key: fs.readFileSync(path.join(__dirname, "localhost-privkey.pem")),
    cert: fs.readFileSync(path.join(__dirname, "localhost-cert.pem")),
  })
  .on("error", (err) => console.error(err))
  .on("stream", handleRequest);

const wss = new WebSocket.Server({ server, path: "/ws" })
  .on("error", (err) => console.error(err))
  .on("connection", (ws) => {
    console.log("new connection", wss.clients.size, Date.now());
  });

if (process.argv[2] === "--bundle") {
  const entry = resolve(path.join(root, config.entry));
  process.stdout.write("[MODULIZER] ...bundling\r");
  const frames = ["/", "-", "\\", "|"];
  let i = 0;
  let spinner = setInterval(() => {
    process.stdout.write(`[MODULIZER] ...bundling ${frames[i]}\r`);
    i = (i + 1) % 4;
  }, 32);
  bundle(entry).then(() => {
    clearInterval(spinner);
    console.log("[MODULIZER] DONE".padEnd(30, " "));
    server.listen(8080, () => {
      console.log("Listening on port 8080");
    });
  });
} else {
  server.listen(8080, () => {
    console.log("Listening on port 8080");
  });
}

const debouncedReload = debounce((file) => {
  cache.delete(file.path);
  modulize(file.path).then((file) => {
    cache.set(file.path, file);
  });
  wss.clients.forEach((ws) => {
    ws.send("UPDATE");
  });
}, 10);

async function prerender(url) {
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--allow-insecure-localhost"],
  });
  const page = await browser.newPage();
  await page.goto(url, { waitUntil: "networkidle0" });
  const html = await page.content();
  await browser.close();
  return html;
}

function handleRequest(stream, headers) {
  const url = headers[":path"];

  Promise.resolve()
    .then(async function serveNativeModule() {
      // Serve file as ES module
      const filePath = path.join(root, url);
      require.resolve(filePath); // This could throw

      if (cache.has(filePath)) {
        console.info("Hit:", filePath);
        const file = cache.get(filePath);
        send(file, { stream, push: false });
        return file;
      }

      console.info("Miss:", filePath);
      const file = await modulize(filePath);
      send(file, { stream, push: false });
      return file;
    })
    .catch(async function serveStaticFile(err) {
      // console.log(err);
      // Serve file as an asset
      const file = { path: path.join(root, config.contentBase, url) };
      const content = await readFile(file.path);
      stream.respond({ "content-type": mime.lookup(file.path) });
      stream.end(content);
      return file;
    })
    .then(function watchFile(file) {
      if (process.argv[2] === "--bundle") return;
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
    .catch(async function servePrerendered() {
      const pathname = headers[":path"];
      const url = new URL(pathname, "https://127.0.0.1:8080");
      if (url.searchParams.has("__raw__")) {
        throw "Requested by Puppeteer";
      }
      if (!pageCache.has(pathname)) {
        url.searchParams.set("__raw__", true);
        pageCache.set(pathname, await prerender(url));
      }
      stream.respond({ "content-type": "text/html; charset=utf-8" });
      stream.end(pageCache.get(pathname));
    })
    .catch(function serveRaw(err) {
      console.log(err);
      // Serve entry file
      if (process.argv[2] === "--bundle") {
        stream.respond({ "content-type": "text/html; charset=utf-8" });
        stream.end(`
          <body>
            <div id="app"></div>
            <script src="/main.bundle.js"></script>
          </body>
        `);
      } else {
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
        stream.respond({ "content-type": "text/html; charset=utf-8" });
        stream.end(`
          <body>
            <div id="app"></div>
            <script type="module" src="${entryPath}"></script>
            <script type="module" src="${wsClientPath}"></script>
          </body>
        `);
      }
      // console.log(err);
      // stream.respond({ ":status": 404 });
      // stream.end("Not Found");
    });
}
