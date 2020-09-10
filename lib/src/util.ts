export function shallowEquals(a: any, b: any) {
  if (typeof a != typeof b) return false;
  if (typeof a != "object" || a == null) return a == b;
  if (Object.keys(a).length != Object.keys(b).length) return false;
  for (let key of Object.keys(a)) {
    if (a[key] !== b[key]) return false;
  }
  return true;
}

export function toKebabCase(s: string) {
  return s.replace(/[A-Z]/g, (c) => "-" + c.toLowerCase());
}

export function isGeneratorFunction(obj: Object) {
  const constructor = obj.constructor;
  return constructor && constructor.name === "GeneratorFunction";
}

export class DefaultMap<K, V> extends Map<K, V> {
  constructor(private factory: () => V) {
    super();
  }
  get(key: K): V {
    if (!this.has(key)) {
      this.set(key, this.factory());
    }
    return super.get(key);
  }
}

export interface Cancelable {
  cancel(): void;
}

export class CancelableExecution implements Cancelable {
  private handle: number;
  constructor(fn: Function) {
    this.handle = window.requestIdleCallback(fn);
  }
  public cancel() {
    window.cancelIdleCallback(this.handle);
  }
}

export class CancelableEffect implements Cancelable {
  private handle: number;
  constructor(fn: Function) {
    this.handle = window.requestIdleCallback(fn);
  }
  public cancel() {
    window.cancelIdleCallback(this.handle);
  }
}

export class CancelablePromise implements Cancelable {
  private reject: Function;
  private promise: Promise<any>;
  constructor(promise: Promise<any>) {
    this.promise = Promise.race([
      promise,
      new Promise((_, reject) => {
        this.reject = reject;
      }),
    ]);
  }
  public then(
    onFulfilled: (value: any) => any,
    onRejected: (value: any) => any
  ) {
    return this.promise.then(onFulfilled, onRejected);
  }
  public cancel() {
    this.reject("CANCELED");
  }
}
