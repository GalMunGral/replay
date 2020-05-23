import { update } from "./renderer";

var current;
var dirty = false;
var updateQueue = new Set();

function setCurrent(instance) {
  current = instance;
}

function flushUpdateQueue() {
  for (let instance of updateQueue) {
    update(instance);
  }
  updateQueue.clear();
  dirty = false;
}

function Observable(obj) {
  if (!obj) return null;

  const properties = Object.getOwnPropertyDescriptors(obj);

  for (let name in properties) {
    const descriptor = properties[name];
    if (descriptor.get || descriptor.set) continue;

    let value = descriptor.value;
    const observers = new Set();

    Object.defineProperty(obj, name, {
      get() {
        if (current && !observers.has(current)) {
          const instance = current;
          observers.add(instance);
          instance.subscriptions.push({
            cancel: () => observers.delete(instance),
          });
        }
        return value;
      },
      set(newValue) {
        value = newValue;
        for (let observer of observers) {
          observer.dirty = true;
          updateQueue.add(observer);
        }
        if (!dirty) {
          dirty = true;
          window.queueMicrotask(flushUpdateQueue);
        }
      },
    });
  }
  return obj;
}

export { Observable, setCurrent };
