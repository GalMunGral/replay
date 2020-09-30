#!/usr/bin/env node
const http = require("http");
const http2 = require("http2");
const fs = require("fs");
const path = require("path");
const config = require("./config");
const serveModule = require("./moduleServer");
const serveStatic = require("./staticServer");

const middlewares = [serveStatic, serveModule];

function handleRequest(stream, headers) {
  const handler = middlewares.reduce(
    (next, middleware) => {
      return () => middleware(stream, headers, next);
    },
    () => {
      stream.respond({ "content-type": "text/html" });
      stream.end(`<script type="module" src="${config.entry}"></script>`);
    }
  );
  handler(stream, headers);
}

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
