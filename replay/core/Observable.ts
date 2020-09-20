class DefaultMap<K, V> extends Map<K, V> {
  constructor(private factory: (key: K) => V) {
    super();
  }
  get(key: K): V {
    if (!this.has(key)) this.set(key, this.factory(key));
    return super.get(key);
  }
}

class DefaultWeakMap<K extends Object, V> extends WeakMap<K, V> {
  constructor(private factory: (key: K) => V) {
    super();
  }
  get(key: K): V {
    if (!this.has(key)) this.set(key, this.factory(key));
    return super.get(key);
  }
}

export interface OneTimeObservable {
  observers: Set<OneTimeObserver>;
  notifyObservers(): void;
  [key: string]: any;
}

export interface OneTimeObserver {
  observeOnce(data: OneTimeObservable): void;
  invalidate(): any;
  [key: string]: any;
}

const INVALIDATED = Symbol("INVALIDATED");
const observerStack: OneTimeObserver[] = [];

export function pushObserver(observer: OneTimeObserver) {
  observerStack.push(observer);
}
export function popObserver() {
  observerStack.pop();
}

class LivePropertyDescriptor<T> implements OneTimeObserver, OneTimeObservable {
  public getValue: (receiver: any) => T;
  private memoized: T | Symbol = INVALIDATED;
  public observers = new Set<OneTimeObserver>();

  constructor(private target: Object, private key: string | number | symbol) {
    const descriptor = Object.getOwnPropertyDescriptor(target, key);
    this.getValue =
      typeof descriptor?.get == "function"
        ? this.getComputedValue
        : this.getStaticValue;
  }

  private getComputedValue(receiver: any) {
    if (this.memoized === INVALIDATED) {
      pushObserver(this);
      this.memoized = Reflect.get(this.target, this.key, receiver);
      popObserver();
    }
    return this.memoized as T;
  }

  private getStaticValue(receiver: any) {
    return Reflect.get(this.target, this.key, receiver);
  }

  public observeOnce(data: OneTimeObservable) {
    data.observers.add(this);
  }

  public invalidate() {
    if (this.memoized !== INVALIDATED) {
      this.memoized = INVALIDATED;
      this.notifyObservers();
    }
  }

  public notifyObservers() {
    console.group(this.key);
    this.observers.forEach((observer) => observer.invalidate());
    this.observers.clear(); // Subscriptions are one-time only
    console.groupEnd();
  }
}

const liveDataRegistry: DefaultWeakMap<
  Object, // target
  DefaultMap<
    string | number | symbol, // key
    LivePropertyDescriptor<any>
  >
> = new DefaultWeakMap((target: Object) => {
  return new DefaultMap((key: string | number | symbol) => {
    return new LivePropertyDescriptor(target, key);
  });
});

const $$isObservable = Symbol("observable");

export function observable<T extends Object>(data: T, level = Infinity): T {
  if (level === 0) return data;
  if (typeof data != "object" || data == null) return data;
  if (
    data instanceof Array ||
    data instanceof Map ||
    data instanceof Set ||
    data instanceof WeakMap ||
    data instanceof WeakSet
  ) {
    return data;
  }

  // BUGFIX: more than one layer of proxy could result in self dependencies because each layer
  // sees a different target and each property ends up having multiple live descriptors
  if (data[$$isObservable]) return data;

  return new Proxy<T>(data, {
    get(target: Object, key, receiver: Object) {
      if (key === $$isObservable) return true;
      const liveDescriptor = liveDataRegistry.get(target).get(key);
      const current = observerStack[observerStack.length - 1];
      if (current && current !== liveDescriptor)
        current.observeOnce(liveDescriptor);
      return observable(liveDescriptor.getValue(receiver), level - 1);
    },
    set(target: Object, key, value: any, receiver: Object) {
      if (value !== target[key]) {
        const liveDescriptor = liveDataRegistry.get(target).get(key);
        liveDescriptor.notifyObservers();
      }
      return Reflect.set(target, key, value, receiver);
    },
    has(target, key) {
      if (key === $$isObservable) return true;
      return Reflect.has(target, key);
    },
    ownKeys(target) {
      return Reflect.ownKeys(target).concat($$isObservable);
    },
    getOwnPropertyDescriptor(target, key) {
      if (key === $$isObservable) {
        return {
          configurable: true,
          enumerable: false,
          writable: false,
          value: true,
        };
      }
      return Reflect.getOwnPropertyDescriptor(target, key);
    },
  });
}
