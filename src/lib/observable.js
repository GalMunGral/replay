import { update } from "./renderer";
import { equals } from "./util";

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

const Observable = (obj) => {
  if (!obj) return null;
  const propertyDescriptors = Object.getOwnPropertyDescriptors(obj);
  for (let name in propertyDescriptors) {
    const descriptor = propertyDescriptors[name];
    if (descriptor.get || descriptor.set) continue; // Not a simple property

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
        // if (equals(value, newValue)) return;
        value = newValue;
        for (let observer of observers) {
          observer.dirty = true;
          // console.log(
          //   name,
          //   "causes",
          //   observer.type.name || observer.type,
          //   "to update"
          // );
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
};

export { Observable, setCurrent };
