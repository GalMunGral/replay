const path = require("path");
const t = require("@babel/types");
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
    deps.add(filePath); // -> this is for h2 server push
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
    ExportAllDeclaration({ node }) {
      node.source.value = resolveDep(node.source.value);
    },
    ExportNamedDeclaration({ node }) {
      if (node.source) {
        // Make sure this is a re-export
        node.source.value = resolveDep(node.source.value);
      }
    },
    CallExpression({ node }) {
      // for dynamically imported module
      if (t.isImport(node.callee) && t.isStringLiteral(node.arguments[0])) {
        node.arguments[0].value = resolveDep(node.arguments[0].value);
      }
    },
  });
  const result = generate(ast);

  return {
    ...file,
    content: result.code,
    deps,
  };
};
