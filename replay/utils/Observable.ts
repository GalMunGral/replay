import { ActivationRecord, RenderFunction } from "../core/Component";
import { RenderTask, Scheduler } from "../core/Scheduler";

var currentRecord: ActivationRecord;
var currentContext: RenderTask;

export function setCurrent(
  record: ActivationRecord,
  context: RenderTask
): void {
  currentRecord = record;
  currentContext = context;
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

// TODO CHECK
const observerRegistry: DefaultMap<
  Object, // object
  DefaultMap<
    string, // key
    Set<ActivationRecord>
  >
> = new DefaultMap(() => {
  return new DefaultMap(() => {
    const observers = new Set<ActivationRecord>();
    return observers;
  });
});

export function observer(render: RenderFunction): RenderFunction {
  return function (props, scope, context) {
    setCurrent(this, context);
    const result = render.call(this, props, scope, context);
    setCurrent(null, null);
    return result;
  };
}

export function observable<T extends Object>(obj: T): T {
  if (!obj) return null;
  return new Proxy<T>(obj, {
    get(target: Object, key: string, receiver: Object) {
      const observers = observerRegistry.get(target).get(key);
      const record = currentRecord;
      const context = currentContext;
      if (record && !observers.has(record)) {
        // This will be contained in a `CancelableEffect`
        context.emit(() => {
          record.subscribe(observers);
        });
      }
      return Reflect.get(target, key, receiver);
    },
    set(target: Object, key: string, value: any, receiver: Object) {
      if (value === target[key]) return true;
      const observers = observerRegistry.get(target).get(key);
      Scheduler.instance.requestUpdate(observers);
      return Reflect.set(target, key, value, receiver);
    },
  });
}
