const path = require("path");
const fs = require("fs");
const { transform } = require("@babel/core");
const config = require("./config");

const filenames = ["", "index"];
const extensions = ["", ...config.extensions];

function resolve(absolutePath) {
  for (let filename of filenames) {
    for (let extension of extensions) {
      try {
        const extended = path.join(absolutePath, filename) + extension;
        const resolved = require.resolve(extended);
        console.log("resolved", resolved);
        return resolved;
      } catch {
        continue;
      }
    }
  }
  throw `Module "${absolutePath}" not found`;
}

const createImportTransformPlugin = (filePath) => {
  const projectRoot = process.cwd();
  const currentDir = path.dirname(filePath);
  return () => ({
    visitor: {
      ImportDeclaration({ node }) {
        const module = node.source.value;
        const modulePath = /^[./]/.test(module)
          ? path.join(currentDir, module) // relative import
          : path.join(projectRoot, "node_modules", module); // node module
        const absolutePath = resolve(modulePath);
        const relativePath = path.relative(projectRoot, absolutePath);
        node.source.value = "/" + relativePath;
        console.log(module, "->", relativePath);
      },
    },
  });
};

function transformESM(src, filePath, cb) {
  transform(
    src,
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
          return (err, data) => {
            if (err) return cb(err);
            require(loaderModule)(data, next);
          };
        },
        (err, data) => {
          if (err) return cb(err);
          transformESM(data, filePath, cb);
        }
      );
      return fs.readFile(filePath, loaderPipeline);
    }
  }
  cb(`No loader configured for ${filePath}`);
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
    if (err) {
      console.error("######", err);
      throw err;
    }
    res.setHeader("content-type", "text/javascript");
    res.end(src);
  });
};
