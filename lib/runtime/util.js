function equals(a, b) {
  if (typeof a != typeof b) return false;
  if (typeof a != 'object' || a == null) return a == b;
  if (Object.keys(a).length != Object.keys(b).length) return false;
  for (let key of Object.keys(a)) {
    if (a[key] !== b[key]) return false;
  }
  return true;
}

function toKebabCase(s) {
  return s.replace(/[A-Z]/g, (c) => "-" + c.toLowerCase());
}

function isGeneratorFunction(obj) {
  const constructor = obj.constructor;
  return constructor && constructor.name === "GeneratorFunction";
}

export { equals, toKebabCase, isGeneratorFunction };
