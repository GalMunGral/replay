const path = require("path");
const parser = require("@babel/parser");
const { default: traverse } = require("@babel/traverse");
const { default: generate } = require("@babel/generator");
const resolve = require("../resolve");

const projectRoot = process.cwd();

module.exports = (file) => {
  const currentDir = path.dirname(file.path);

  function resolveModulePath(dep) {
    const modulePath = /^[./]/.test(dep)
      ? path.join(currentDir, dep) // relative import
      : path.join(projectRoot, "node_modules", dep); // node file
    const absolutePath = resolve(modulePath);
    const relativePath = path.relative(projectRoot, absolutePath);
    return "/" + relativePath;
  }

  const ast = parser.parse(file.content, {
    sourceType: "module",
    plugins: ["jsx", "classProperties"],
  });

  traverse(ast, {
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
  });

  return {
    ...file,
    content: generate(ast).code,
  };
};
