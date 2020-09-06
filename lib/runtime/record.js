import { replay } from './renderer';

export class Record {
  constructor(type, parent) {
    this.name = typeof type == 'string' ? type : type.name;
    this.type = type;
    this.props = {};
    const locals = typeof type.init == "function" ? type.init() : {};
    this.context = Object.create(
      parent ? parent.context : null,
      Object.getOwnPropertyDescriptors(locals)
    );
    this.children = new Map();
    this.parent = parent;
    this.depth = parent ? parent.depth + 1 : 0;
    this.index = -1;
    this.node = null;
    this.firstChild = null;
    this.lastChild = null;
    this.dirty = false;
    this.subscriptions = [];
  }

  subscribe(observers) {
    observers.add(this);
    this.subscriptions.push(new Subscription(this, observers));
  }

  update() {
    if (__DEBUG__) {
      console.debug('[[Update]] replaying:', this.type.name);
    }
    replay(this);
  }

  * clone(parent) {
    const clone = Object.create(Record.prototype);
    clone.name = this.name;
    clone.type = this.type;
    clone.props = this.props;
    clone.context = this.context;
    clone.children = new Map(this.children);
    clone.parent = parent;
    clone.depth = parent ? parent.depth + 1 : 0;
    clone.index = -1;
    clone.node = this.node;
    clone.firstChild = this.firstChild;
    clone.lastChild = this.lastChild;
    clone.dirty = this.dirty;
    clone.subscriptions = [];
    yield () => {
      this.subscriptions.forEach(s => s.update(clone))
      this.subscriptions = [];
    }
    return clone;
  }
}

class Subscription {
  constructor(record, observers) {
    this.record = record;
    this.observers = observers;
  }
  update(record) {
    this.cancel();
    record.subscribe(observer);
  }
  cancel() {
    this.observers.delete(this.record);
  }
}

export function getFirstNode(record) {
  if (typeof record.type === "string") {
    return record.node;
  }
  return getFirstNode(record.firstChild);
}

export function getLastNode(record) {
  if (typeof record.type === "string") {
    return record.node;
  }
  return getLastNode(record.lastChild);
}

export function getParentNode(record) {
  if (typeof record.type === "string") {
    return record.node;
  }
  return getParentNode(record.parent);
}

export function* insertAfter(previouSibling, record) {
  const lastNode = getLastNode(record);
  let curNode = getFirstNode(record);
  let prevNode = getLastNode(previouSibling);
  yield () => {
    while (curNode !== lastNode) {
      prevNode.after(curNode);
      prevNode = curNode;
      curNode = curNode.nextSibling;
    }
    prevNode.after(curNode);
  };
}

export function* remove(record) {
  const firstNode = getFirstNode(record);
  const lastNode = getLastNode(record);
  yield () => {
    let cur = firstNode;
    let next = cur.nextSibling;
    while (cur !== lastNode) {
      cur.remove();
      cur = next;
      next = next.nextSibling;
    }
    cur.remove();
  };
}
