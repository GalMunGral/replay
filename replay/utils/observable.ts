import { ActivationRecord, RenderFunction } from "../core/component";
import { RenderTask, Scheduler } from "../core/scheduler";

if (__DEBUG__) {
  globalThis.__observers__ = [];
  globalThis.inspect = () => {
    const observerNameId = globalThis.__observers__.map((o) =>
      [...o].map((x) => x.name + x.id)
    );
    console.log(observerNameId);
  };
}

class DefaultMap<K, V> extends Map<K, V> {
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

export function Observer(render: RenderFunction): RenderFunction {
  return function (props, scope, context) {
    Observable.setCurrent(this, context);
    const result = render(props, scope, context);
    Observable.setCurrent(null, null);
    return result;
  };
}

export class Observable {
  static currentRecord: ActivationRecord;
  static currentContext: RenderTask;
  static setCurrent(record: ActivationRecord, context: RenderTask): void {
    Observable.currentRecord = record;
    Observable.currentContext = context;
  }

  static registry: DefaultMap<
    Object, // property owner
    DefaultMap<
      string, // property key
      Set<ActivationRecord>
    >
  > = new DefaultMap(() => {
    return new DefaultMap(() => {
      const observers = new Set<ActivationRecord>();
      if (__DEBUG__) {
        globalThis.__observers__.push(observers);
      }
      return observers;
    });
  });

  constructor(obj: Object) {
    if (!obj) return null;
    return new Proxy(obj, {
      get(target: Object, key: string, receiver: Object) {
        const observers = Observable.registry.get(target).get(key);
        const record = Observable.currentRecord;
        const context = Observable.currentContext;
        if (record && !observers.has(record)) {
          context.emit(() => {
            // This will be contained in a `CancelableEffect`
            record.subscribe(observers);
          });
        }
        return Reflect.get(target, key, receiver);
      },
      set(target: Object, key: string, value: any, receiver: Object) {
        if (value === target[key]) return true;
        if (__DEBUG__) {
          LOG("[[Set]]", key, target);
          LOG("[[Set]] old value:", target[key]);
          LOG("[[Set]] new value:", value);
        }
        const observers = Observable.registry.get(target).get(key);
        Scheduler.instance.requestUpdate(observers);
        return Reflect.set(target, key, value, receiver);
      },
    });
  }
}
