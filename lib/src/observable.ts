import { DefaultMap } from "./util";
import { ActivationRecord } from "./renderer";
import { RenderTask, Scheduler } from "./scheduler";

if (__DEBUG__) {
  globalThis.__obs__ = [];
  globalThis.inspect = () => {
    return globalThis.__obs__.map((o) => [...o].map((x) => x.name + x.id));
  };
}

export class Observable {
  static currentRecord: ActivationRecord;
  static currentContext: RenderTask;

  static setCurrent(record: ActivationRecord, context: RenderTask): void {
    Observable.currentRecord = record;
    Observable.currentContext = context;
  }

  static observerMatrix: DefaultMap<
    Object, // Property owner
    DefaultMap<
      string, // Property name
      Set<ActivationRecord>
    >
  > = new DefaultMap(() => {
    return new DefaultMap(() => {
      const observers: Set<ActivationRecord> = new Set();
      if (__DEBUG__) {
        globalThis.__obs__.push(observers);
      }
      return observers;
    });
  });

  constructor(obj: Object) {
    if (!obj) return null;
    return new Proxy(obj, {
      get(target: Object, key: string, receiver: Object) {
        const observers = Observable.observerMatrix.get(target).get(key);
        const record = Observable.currentRecord;
        const context = Observable.currentContext;
        if (record && !observers.has(record)) {
          context.emit(() => {
            record.subscribe(observers); // This will be contained in a `CancelableEffect`
          });
        }
        return Reflect.get(target, key, receiver);
      },
      set(target: Object, key: string, value: any, receiver: Object) {
        if (value === target[key]) return true;
        if (__DEBUG__) {
          console.debug("[[Set]]", key, target);
          console.debug("[[Set]] old value:", target[key]);
          console.debug("[[Set]] new value:", value);
        }
        const observers = Observable.observerMatrix.get(target).get(key);
        Scheduler.instance.requestUpdate(observers);
        return Reflect.set(target, key, value, receiver);
      },
    });
  }
}

export function observable(obj: Object): Observable {
  return new Observable(obj);
}