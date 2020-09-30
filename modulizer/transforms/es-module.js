const path = require("path");
const parser = require("@babel/parser");
const { default: traverse } = require("@babel/traverse");
const { default: generate } = require("@babel/generator");
const resolve = require("../resolve");

const root = process.cwd();

module.exports = (file) => {
  const context = path.dirname(file.path);
  const deps = new Set();

  function resolveDep(resource) {
    const filePath = resource.startsWith(".") // TODO: not sure about this
      ? resolve(path.join(context, resource)) // relative import
      : resolve(path.join(root, "node_modules", resource)); // node module

    // Collect dependencies for HTTP/2 server push
    deps.add(filePath);

    return "/" + path.relative(root, filePath);
  }

  const ast = parser.parse(file.content, {
    sourceType: "module",
    plugins: ["jsx", "classProperties"],
  });

  traverse(ast, {
    ImportDeclaration({ node }) {
      node.source.value = resolveDep(node.source.value);
    },
    ExportNamedDeclaration({ node }) {
      if (node.source) {
        // Make sure this is a re-export
        node.source.value = resolveDep(node.source.value);
      }
    },
    ExportAllDeclaration({ node }) {
      node.source.value = resolveDep(node.source.value);
    },
  });

  return { ...file, content: generate(ast).code, deps };
};
