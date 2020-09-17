const t = require("@babel/types");
const parser = require("@babel/parser");
const { default: traverse } = require("@babel/traverse");
const { default: generate } = require("@babel/generator");

module.exports = (src) => {
  const ast = parser.parse(src, {
    sourceType: "module",
    plugins: ["jsx", "classProperties"],
  });

  traverse(ast, {
    JSXElement(path) {
      const name = path.node.openingElement.name.name;
      const type = /^[a-z_]/.test(name)
        ? t.stringLiteral(name)
        : t.identifier(name);
      const props = t.objectExpression(
        path.node.openingElement.attributes.map((attr) => {
          return t.isJSXSpreadAttribute(attr)
            ? t.spreadElement(attr.argument)
            : t.objectProperty(
                t.identifier(attr.name.name),
                t.isJSXExpressionContainer(attr.value)
                  ? attr.value.expression
                  : attr.value
              );
        })
      );
      const children = t.arrayExpression(
        path.node.children
          .flatMap((child) => {
            return t.isJSXText(child)
              ? child.value.trim()
                ? t.arrayExpression([
                    t.stringLiteral("text"),
                    t.objectExpression([]),
                    t.stringLiteral(child.value),
                  ])
                : null // remove extraneous text nodes
              : t.isJSXSpreadChild(child)
              ? t.spreadElement(child.expression)
              : t.isJSXExpressionContainer(child)
              ? t.isJSXEmptyExpression(child.expression)
                ? null // {/* ...comments */} -> null
                : child.expression
              : child;
          })
          .filter((x) => x)
      );
      const node = t.arrayExpression([type, props, children]);
      path.replaceWith(node);
    },
  });

  const { code } = generate(ast);

  return code;
};
