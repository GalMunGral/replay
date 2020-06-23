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

function toKebabCase(s) {
  return s.replace(/[A-Z]/g, (c) => "-" + c.toLowerCase());
}

function isGeneratorFunction(obj) {
  if (regeneratorRuntime) {
    // If polyfilled by regenerator-runtime
    return regeneratorRuntime.isGeneratorFunction(obj);
  }
  const constructor = obj.constructor;
  return constructor && constructor.name === "GeneratorFunction";
}

export { equals, toKebabCase, isGeneratorFunction };
