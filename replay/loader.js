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
      const openingElement = path.node.openingElement;
      const name = openingElement.name.name;
      const type = /^[a-z_]/.test(name)
        ? t.stringLiteral(name)
        : t.identifier(name);
      const props = t.objectExpression(
        openingElement.attributes.map((attr) => {
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
      const children = path.node.children
        .flatMap((expr) => {
          return t.isJSXText(expr)
            ? expr.value.trim()
              ? t.stringLiteral(expr.value)
              : null
            : t.isJSXSpreadChild(expr)
            ? expr.expression // No need to spread the results
            : t.isJSXExpressionContainer(expr)
            ? t.isJSXEmptyExpression(expr.expression)
              ? null // {/* ...comments */} -> null
              : expr.expression
            : expr;
        })
        .filter((x) => x)
        .map((expr) =>
          t.callExpression(t.identifier("__RUN__"), [
            t.arrowFunctionExpression([], expr),
          ])
        );

      if (children.length) {
        path.replaceWithMultiple([
          t.callExpression(t.identifier("__STEP_INTO__"), [type, props]),
          ...children,
          t.callExpression(t.identifier("__STEP_OUT__"), [type]),
        ]);
      } else {
        path.replaceWith(
          t.callExpression(t.identifier("__STEP_OVER__"), [type, props])
        );
      }
    },
  });

  const { code } = generate(ast);

  return code;
};
