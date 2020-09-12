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
    // JSX
    JSXElement(path) {
      const name = path.node.openingElement.name.name;
      const type = /^[a-z]/.test(name)
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
        path.node.children.map((child) => {
          return t.isJSXText(child)
            ? t.arrayExpression([
                t.stringLiteral("text"),
                t.objectExpression([]),
                t.stringLiteral(child.value),
              ])
            : t.isJSXSpreadChild(child)
            ? t.spreadElement(child.expression)
            : t.isJSXExpressionContainer(child)
            ? child.expression
            : child;
        })
      );
      const node = t.arrayExpression([type, props, children]);
      path.replaceWith(node);
    },

    // Original
    ArrayExpression(path) {
      if (shouldTransform(path)) {
        path.node.elements = path.node.elements.map(transformChild);
      }
    },
    CallExpression(path) {
      if (shouldTransform(path)) {
        if (isArrayMap(path.node)) {
          const mapperFn = path.node.arguments[0];
          if (
            t.isArrowFunctionExpression(mapperFn) &&
            t.isCallExpression(mapperFn.body)
          ) {
            mapperFn.body = transform(mapperFn.body);
          }
        } else {
          path.replaceWith(t.arrayExpression([transform(path.node)]));
        }
      }
    },
  });

  const { code } = generate(ast);

  return code;
};

function shouldTransform(path) {
  let comments = path.node.leadingComments;
  return comments && comments[0] && comments[0].value.includes("use transform");
}

function isArrayMap(node) {
  const callee = node.callee;
  return t.isMemberExpression(callee) && callee.property.name == "map";
}

function transform(node) {
  const name = node.callee.name;
  let type = /^[a-z]/.test(name) ? t.stringLiteral(name) : t.identifier(name);
  let props = t.objectExpression([]);
  let children = t.arrayExpression([]);
  node.arguments.forEach((arg) => {
    if (t.isObjectExpression(arg)) {
      props.properties.push(...arg.properties);
    } else if (t.isAssignmentExpression(arg)) {
      const key = t.identifier(arg.left.name);
      const value = arg.right;
      props.properties.push(t.objectProperty(key, value));
    } else if (t.isArrayExpression(arg)) {
      children.elements = arg.elements.map(transformChild);
    } else {
      children = arg;
    }
  });

  return t.arrayExpression([type, props, children]);
}

function transformChild(node) {
  if (t.isCallExpression(node)) {
    if (isArrayMap(node)) {
      const mapperFn = node.arguments[0];
      if (
        t.isArrowFunctionExpression(mapperFn) &&
        t.isCallExpression(mapperFn.body)
      ) {
        mapperFn.body = transform(mapperFn.body);
      }
      return node;
    }
    return transform(node);
  } else if (t.isArrayExpression(node)) {
    node.elements = node.elements.map(transformChild);
    return node;
  } else if (t.isConditionalExpression(node)) {
    node.consequent = transformChild(node.consequent);
    node.alternate = transformChild(node.alternate);
    return node;
  } else if (t.isLogicalExpression(node)) {
    node.right = transformChild(node.right);
    return node;
  } else if (t.isSpreadElement(node)) {
    node.argument = transformChild(node.argument);
    return node;
  } else {
    return node;
  }
}
