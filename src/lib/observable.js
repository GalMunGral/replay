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
  const observerMap = new Map(
    Object.keys(obj)
      .filter((key) => properties[key].hasOwnProperty("value")) // not getter/setter
      .map((key) => [key, new Set()])
  );

  return new Proxy(obj, {
    get(__, prop) {
      if (!observerMap.has(prop)) {
        return Reflect.get(...arguments);
      }
      const observers = observerMap.get(prop);
      if (current && !observers.has(current)) {
        const instance = current;
        observers.add(instance);
        instance.subscriptions.push({
          cancel: () => observers.delete(instance),
        });
      }
      return Reflect.get(...arguments);
    },
    set(__, prop) {
      if (!observerMap.has(prop)) {
        return Reflect.set(...arguments);
      }
      observerMap.get(prop).forEach((observer) => {
        observer.dirty = true;
        updateQueue.add(observer);
      });
      if (!dirty) {
        dirty = true;
        window.queueMicrotask(flushUpdateQueue);
      }
      return Reflect.set(...arguments);
    },
  });
}

export { Observable, setCurrent };
