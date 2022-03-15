const { readFileSync } = require("fs");
const express = require("express");
const { minify } = require("html-minifier");
const { renderToString } = require("@replay/server");
const { default: App } = require("./components/App");

const server = express(),
  PORT = 8080;

server.use(express.static("./public"));
server.use(express.static("./assets"));

server.use((_, res, next) => {
  res.header("Content-Security-Policy", "img-src 'self'");
  next();
});
server.get("*", (req, res) => {
  const html = readFileSync("./public/index.html", {
    encoding: "utf8",
  });

  // Server-side Rendering
  const [styles, app] = renderToString([App], {
    initialPath: req.path || "inbox",
  });
  const parts = html.split(/\/\* css \*\/|<!--app-->/);

  res.send(
    minify(parts[0] + styles + parts[1] + app + parts[2], {
      minifyCSS: true,
      minifyJS: true,
      collapseWhitespace: true,
    })
  );
});

server.listen(PORT, () => {
  console.log(`Listening on ${PORT}`);
});
