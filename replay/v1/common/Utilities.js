import _voidElements from "html-tags/void";

const voidElements = new Set(_voidElements);

function isVoidElement(tag) {
  return voidElements.has(tag);
}

function toKebabCase(s) {
  return s.replace(/[A-Z]/g, (c) => "-" + c.toLowerCase());
}

function normalize(element, index = 0) {
  const type = element[0];
  let props = {};
  let children = [];
  for (let item of element.slice(1)) {
    if (typeof item === "object" && !Array.isArray(item)) {
      props = item;
    } else {
      children = item;
    }
  }
  if (props.key === undefined || props.key === null) {
    if (props.id !== undefined && props.id !== null) {
      props.key = props.id;
    } else {
      props.key = index;
    }
  }
  return [type, props, children];
}

function equals(a, b) {
  if (a == null && b == null) return true;
  if (a == null || b == null) return false;
  if (typeof a != typeof b) return false;
  if (/number|string|boolean|symbol|function/.test(typeof a)) return a == b;
  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length != b.length) return false;
    for (let i = 0; i < a.length; i++) {
      if (!equals(a[i], b[i])) return false;
    }
    return true;
  }
  if (Array.isArray(a) || Array.isArray(b)) return false;
  if (Object.keys(a).length != Object.keys(b).length) return false;
  for (let key of Object.keys(a)) {
    if (!b.hasOwnProperty(key)) return false;
    if (!equals(a[key], b[key])) return false;
  }
  return true;
}

function isGeneratorFunction(obj) {
  const constructor = obj.constructor;
  return constructor && constructor.name === "GeneratorFunction";
}

export { isVoidElement, toKebabCase, normalize, equals, isGeneratorFunction };
