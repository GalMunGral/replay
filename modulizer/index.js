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
const contentBase = path.join(root, config.contentBase);

if (!fs.existsSync(contentBase)) {
  fs.mkdirSync(contentBase);
}

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

var browser;

async function startServer() {
  if (process.argv[2] === "--bundle") {
    const entry = resolve(path.join(root, config.entry));
    process.stdout.write("[MODULIZER] ...bundling\r");
    const frames = ["/", "-", "\\", "|"];
    let i = 0;
    let spinner = setInterval(() => {
      process.stdout.write(`[MODULIZER] ...bundling ${frames[i]}\r`);
      i = (i + 1) % 4;
    }, 32);
    await bundle(entry);
    clearInterval(spinner);
    console.log("[MODULIZER] DONE".padEnd(30, " "));
  }

  browser = await puppeteer.launch({
    headless: true,
    args: ["--allow-insecure-localhost"],
  });

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

function handleRequest(stream, headers) {
  const url = headers[":path"];

  Promise.resolve()
    .then(async function serveNativeModule() {
      // Serve file as ES module
      const filePath = path.join(root, url);
      require.resolve(filePath); // This could throw

      if (cache.has(filePath)) {
        // console.info("Hit:", filePath);
        const file = cache.get(filePath);
        send(file, { stream, push: false });
        return file;
      }

      // console.info("Miss:", filePath);
      const file = await modulize(filePath);
      send(file, { stream, push: false });
      return file;
    })
    .catch(async function serveStaticFile(err) {
      // console.log(err.message);
      // Serve file as an asset
      const file = { path: path.join(contentBase, url) };
      const content = await readFile(file.path);
      stream.respond({ "content-type": mime.lookup(file.path) });
      stream.end(content);
      return file;
    })
    .then(function watchFile(file) {
      if (process.argv[2] === "--bundle") return;
      // `file` could be either a module or asset.
      if (!watchers.has(file.path) && !file.path.startsWith(contentBase)) {
        const watcher = fs.watch(file.path, (event) => {
          if (event === "change") {
            debouncedReload(file);
          }
        });
        watchers.set(file.path, watcher);
      }
    })
    .catch(function serveIndex() {
      const minify = (str) => str.trim().replace(/(?<=>)\s+(?=<)/g, "");

      if (process.argv[2] === "--bundle") {
        const pathname = headers[":path"];
        const url = new URL(pathname, "https://127.0.0.1:8080");

        if (!url.searchParams.has("__raw__")) {
          throw url; // pre-render
        }

        stream.respond({ "content-type": "text/html; charset=utf-8" });
        stream.end(
          minify(`
            <body>
              <div id="app" ssr></div>
              <script src="/main.bundle.js"></script>
            </body>
          `)
        );
      } else {
        // DEVELOPMENT MODE - DISABLE SSR
        const entryPath = (() => {
          const partial = path.join(root, config.entry);
          const absolute = resolve(partial);
          const relative = path.relative(root, absolute);
          return "/" + relative;
        })();

        const wsClientPath = "node_modules/modulizer/ws-client.js";

        stream.respond({ "content-type": "text/html; charset=utf-8" });
        stream.end(
          minify(`
            <body>
              <div id="app" no-ssr></div>
              <script type="module" src="${entryPath}"></script>
              <script type="module" src="${wsClientPath}"></script>
            </body>
          `)
        );
      }
    })
    .catch(async function SSR(url) {
      if (!pageCache.has(url.href)) {
        console.info("[SSR] Miss:", url.href);

        url.searchParams.set("__raw__", 1);
        const page = await browser.newPage();
        await page.goto(url, { waitUntil: "networkidle0" });
        const renderedHTML = await page.content();
        await page.close();
        url.searchParams.delete("__raw__");

        pageCache.set(url.href, renderedHTML);
      } else {
        console.info("[SSR] Hit:", url.href);
      }
      stream.respond({ "content-type": "text/html; charset=utf-8" });
      stream.end(pageCache.get(url.href));
    });
}

startServer();
