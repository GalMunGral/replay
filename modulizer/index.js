#!/usr/bin/env node
const http = require("http");
const config = require("./config");
const serveModule = require("./moduleServer");
const serveStatic = require("./staticServer");

const middlewares = [serveStatic, serveModule];

function handleRequest(req, res) {
  const handler = middlewares.reduce(
    (next, middleware) => {
      return () => middleware(req, res, next);
    },
    () => {
      res.setHeader("content-type", "text/html");
      res.end(`<script type="module" src="${config.entry}"></script>`);
    }
  );
  handler(req, res);
}

http.createServer(handleRequest).listen(8080, () => {
  console.log("Modulizer listening on port 8080");
});
