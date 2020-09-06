export class DefaultMap extends Map {
  constructor(factory) {
    super();
    this.factory = factory;
  }
  get(key) {
    if (!this.has(key)) {
      this.set(key, this.factory());
    }
    return super.get(key);
  }
}

export function shallowEquals(a, b) {
  if (typeof a != typeof b) return false;
  if (typeof a != 'object' || a == null) return a == b;
  if (Object.keys(a).length != Object.keys(b).length) return false;
  for (let key of Object.keys(a)) {
    if (a[key] !== b[key]) return false;
  }
  return true;
}

export function toKebabCase(s) {
  return s.replace(/[A-Z]/g, (c) => "-" + c.toLowerCase());
}

export function isGeneratorFunction(obj) {
  const constructor = obj.constructor;
  return constructor && constructor.name === "GeneratorFunction";
}
