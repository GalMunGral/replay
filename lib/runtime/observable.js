import { DefaultMap } from "./util";

var target;
var pending = false;
const updateQueue = new Set();
const observerMatrix = new DefaultMap(() => {
  return new DefaultMap(() => new Set());
});

export function setTarget(record) {
  target = record;
}

function flushUpdateQueue() {
  for (let record of updateQueue) {
    record.update();
  }
  updateQueue.clear();
  pending = false;
}

export function observable(obj) {
  if (!obj) return null;
  return new Proxy(obj, {
    get(obj, prop) {
      const observers = observerMatrix.get(obj).get(prop);
      if (target && !observers.has(target)) {
        target.subscribe(observers);
      }
      return Reflect.get(...arguments);
    },
    set(obj, prop, value) {
      if (value === obj[prop]) return true;
      if (__DEBUG__) {
        console.debug("[[Set]]", prop, obj);
        console.debug("[[Set]] old value:", obj[prop]);
        console.debug("[[Set]] new value:", value);
      }
      const observers = observerMatrix.get(obj).get(prop);
      for (let observer of observers) {
        observer.dirty = true;
        updateQueue.add(observer);
      }
      if (!pending) {
        pending = true;
        window.queueMicrotask(flushUpdateQueue);
      }
      return Reflect.set(...arguments);
    },
  });
}
