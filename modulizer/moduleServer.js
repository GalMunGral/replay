const path = require("path");
const fs = require("fs");
const { transform } = require("@babel/core");
const config = require("./config");

const projectRoot = process.cwd();
const filenames = ["", "index"];
const extensions = ["", ...config.extensions];

function resolve(absolutePath) {
  for (let filename of filenames) {
    for (let extension of extensions) {
      try {
        const extended = path.join(absolutePath, filename) + extension;
        const resolved = require.resolve(extended);
        return resolved;
      } catch {
        continue;
      }
    }
  }
  throw `Module "${absolutePath}" not found`;
}

const createImportTransformPlugin = (filePath) => {
  const currentDir = path.dirname(filePath);

  function resolveModulePath(module) {
    const modulePath = /^[./]/.test(module)
      ? path.join(currentDir, module) // relative import
      : path.join(projectRoot, "node_modules", module); // node module
    const absolutePath = resolve(modulePath);
    const relativePath = path.relative(projectRoot, absolutePath);
    return "/" + relativePath;
  }

  return () => ({
    visitor: {
      ImportDeclaration({ node }) {
        node.source.value = resolveModulePath(node.source.value);
      },
      ExportNamedDeclaration({ node }) {
        if (node.source) {
          // Check that this is a re-export
          node.source.value = resolveModulePath(node.source.value);
        }
      },
      ExportAllDeclaration({ node }) {
        node.source.value = resolveModulePath(node.source.value);
      },
    },
  });
};

function transformESM({ code, filePath }, cb) {
  transform(
    code,
    {
      plugins: [
        require.resolve("@babel/plugin-proposal-class-properties"),
        require.resolve("babel-plugin-transform-commonjs"),
        createImportTransformPlugin(filePath),
      ],
    },
    (err, result) => {
      if (err) return cb(err);
      cb(null, result.code);
    }
  );
}

function load(filePath, cb) {
  for (let rule of config.loaders) {
    if (rule.test.test(filePath)) {
      const loaderPipeline = rule.use.reduce(
        (next, loaderModule) => {
          return (err, code) => {
            if (err) return cb(err);
            const loader = require(loaderModule);
            loader({ code, filePath }, next);
          };
        },
        (err, code) => {
          if (err) return cb(err);
          transformESM({ code, filePath }, cb);
        }
      );
      return fs.readFile(filePath, { encoding: "utf-8" }, loaderPipeline);
    }
  }
  // No loader found. Resolve the import to a URL.
  const encoded = Buffer.from(filePath).toString("base64").slice(-10);
  const filename = encoded + path.extname(filePath);
  const outputPath = path.join(process.cwd(), config.contentBase, filename);
  fs.copyFile(filePath, outputPath, (err) => {
    if (err) return cb(err);
    const url = "/" + filename;
    const module = `export default "${url}"`;
    cb(null, module);
  });
}

module.exports = function serveModule(req, res, next) {
  let absolutePath;
  try {
    const partialPath = path.join(process.cwd(), req.url);
    absolutePath = resolve(partialPath);
  } catch {
    // Module not found
    return next();
  }

  load(absolutePath, (err, src) => {
    // All errors that occurred during loading are handled here
    if (err) throw err;
    res.setHeader("content-type", "text/javascript");
    res.end(src);
  });
};
