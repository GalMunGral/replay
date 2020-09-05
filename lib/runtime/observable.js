import { update } from "./renderer";

var target;
var pending = false;
var updateQueue = new Set();

function setTarget(instance) {
  target = instance;
}

function flushUpdateQueue() {
  for (let instance of updateQueue) {
    update(instance);
  }
  updateQueue.clear();
  pending = false;
}

class DefaultMap extends Map {
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

const observerMatrix = new DefaultMap(() => {
  return new DefaultMap(() => new Set())
});

function observable(obj) {
  if (!obj) return null;
  const handler = {
    get(obj, prop) {
      const observers = observerMatrix.get(obj).get(prop);
      if (target && !observers.has(target)) {
        const instance = target;
        observers.add(instance);
        instance.subscriptions.push({
          cancel: () => observers.delete(instance),
        });
      }
      return Reflect.get(...arguments);
    },
    set(obj, prop, value) {
      if (value === obj[prop]) return true; 
      if (__DEBUG__) {
        console.debug('[[Set]]', prop, obj);
        console.debug('[[Set]] old value:', obj[prop])
        console.debug('[[Set]] new value:', value);
      }
      const observers = observerMatrix.get(obj).get(prop);
      for (let observer of observers) {
        if (__DEBUG__) {
          console.debug('[[Update]]', observer.type.name)
        }
        observer.dirty = true;
        updateQueue.add(observer);
      }
      if (!pending) {
        pending = true;
        window.queueMicrotask(flushUpdateQueue);
      }
      return Reflect.set(...arguments);
    }
  }
  return new Proxy(obj, handler);
}

export { observable, setTarget };
