import { Task, schedule, unschedule } from "./scheduler";
import { setTarget } from "./observable";
import { shallowEquals, toKebabCase, isGeneratorFunction } from "./util";

export const lazy = (resolve) => ({ isAsync: true, resolve });

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

export default class Record {
  constructor(type, parent) {
    this.name = typeof type == "string" ? type : type.name;
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

  get parentNode() {
    if (typeof this.type === "string") {
      return this.node;
    }
    return this.parent.parentNode;
  }

  get firstNode() {
    return typeof this.type === "string"
      ? this.node
      : this.firstChild.firstNode;
  }

  get lastNode() {
    return typeof this.type === "string" ? this.node : this.lastChild.lastNode;
  }

  *destruct() {
    for (let c of this.children.values()) {
      yield* c.destruct();
    }
    if (typeof this.type == "function") {
      yield () => {
        this.subscriptions.forEach((s) => s.cancel());
        unschedule(this);
      };
    }
  }

  subscribe(observers) {
    observers.add(this);
    this.subscriptions.push(new Subscription(this, observers));
  }

  update() {
    if (__DEBUG__) {
      console.debug("[[Update]] replaying:", this.type.name);
    }
    replay(this);
  }

  *clone(parent) {
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
      this.subscriptions.forEach((s) => s.update(clone));
      this.subscriptions = [];
    };
    return clone;
  }

  *insertAfter(previouSibling) {
    const lastNode = this.lastNode;
    let curNode = this.firstNode;
    yield () => {
      let prevNode = previouSibling.lastNode;
      while (curNode !== lastNode) {
        prevNode.after(curNode);
        prevNode = curNode;
        curNode = curNode.nextSibling;
      }
      prevNode.after(curNode);
    };
  }

  *remove() {
    const firstNode = this.firstNode;
    const lastNode = this.lastNode;
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
}

export function render(elements, container) {
  const rootRecord = new Record("_");
  rootRecord.node = container;
  rootRecord.node.innerHTML = "";
  rootRecord.node.prepend(new Text());
  window.__root__ = rootRecord;
  const task = new Task(rootRecord, function* () {
    this.cursor = new Record("_");
    this.cursor.node = container.firstChild;
    yield* reconcileChildren.call(this, rootRecord, elements);
  });
  schedule(task);
}

export function replay(record) {
  const task = new Task(record, function* () {
    this.cursor = new Record("_");
    this.cursor.node = record.firstNode.previousSibling;
    yield* renderComponent.call(this, record);
  });
  schedule(task);
}

function* mountComponent(element, parent) {
  let [type, props, children] = element;
  props.children = children;
  if (type.isAsync) {
    if (__DEBUG__) {
      this.t = performance.now();
      console.debug("[[Resolve]] (async component)");
    }
    // Mark as interruptible
    this.interruptible = true;
    type = yield type;
    if (__DEBUG__) {
      const t = performance.now() - this.t;
      this.t = 0;
      console.debug("[[Resolve]] loaded:", type.name, t);
    }
  }
  const record = new Record(type, parent);
  if (typeof type == "string") {
    switch (type) {
      case "text":
        record.node = new Text();
        break;
      case "comment":
        record.node = new Comment();
        break;
      default:
        record.node = document.createElement(type);
        // Create a dummy node to make reordering easier
        record.node.append(new Text());
    }
    yield* renderComponent.call(this, record, props);
    yield* record.insertAfter(this.cursor);
  } else {
    yield* renderComponent.call(this, record, props);
  }
  return record;
}

function* unmountComponent(record) {
  yield* record.remove();
  yield* record.destruct();
}

function* renderComponent(record, props) {
  if (!props) props = record.props;
  if (shallowEquals(props, record.props) && !record.dirty) return;
  // Clear dirty bit *before* rather than *after* rendering,
  // so if further updates occur while rendering is in process, the dirty bit doesn't get cleared mistakenly.
  record.dirty = false;
  if (typeof record.type === "string") {
    yield* renderDOMComponent.call(this, record, props);
  } else {
    yield* renderCompositeComponent.call(this, record, props);
  }
  record.props = props;
}

function* renderCompositeComponent(record, props) {
  const { type, context } = record;
  if (__DEBUG__) {
    if (type.name !== "StyleWrapper") {
      // console.debug('[[Render]]', type.name, props);
    }
  }
  let elements;
  setTarget(record);
  if (isGeneratorFunction(type)) {
    elements = yield* type(props, context);
  } else {
    elements = type(props, context);
  }
  setTarget(null);
  yield* reconcileChildren.call(this, record, elements);
}

function* renderDOMComponent(record, props) {
  const effects = [];
  const memoized = record.props;
  for (let [name, value] of Object.entries(props)) {
    if (name === "children") continue;
    if (name === "style") {
      for (let [k, v] of Object.entries(value)) {
        k = toKebabCase(k);
        if (!memoized.style || memoized.style[k] !== v) {
          effects.push(() => {
            record.node.style[k] = v;
          });
        }
      }
    } else {
      if (value !== memoized[name]) {
        effects.push(() => {
          record.node[name] = value;
        });
      }
    }
  }
  yield effects;
  if (record.type === "text" || record.type === "comment") {
    yield () => (record.node.textContent = props.children);
    return;
  }
  if (!Array.isArray(props.children)) {
    props.children = [["text", {}, props.children]]; // p('hello') -> p([ text('hello') ])
  }
  this.stack.push(this.cursor);
  this.cursor = new Record("_");
  this.cursor.node = record.node.firstChild;
  yield* reconcileChildren.call(this, record, props.children);
  this.cursor = this.stack.pop();
}

function* reconcileChildren(parent, elements) {
  let firstChild,
    lastChild,
    lastIndex = -1;
  let oldChildren = parent.children;
  parent.children = new Map();
  for (let [index, element] of elements.entries()) {
    if (!element) {
      element = ["comment", {}, "[slot]"];
    }
    const [type, props, children] = element;
    const key = props.key ?? index;
    props.children = children;
    let record;
    if (oldChildren.has(key) && oldChildren.get(key).type === type) {
      record = oldChildren.get(key);
      oldChildren.delete(key);
      if (record.index < lastIndex) {
        yield* record.insertAfter(this.cursor);
      } else {
        lastIndex = record.index;
      }
      yield* renderComponent.call(this, record, props);
    } else {
      record = yield* mountComponent.call(this, element, parent);
    }
    record.index = index;
    parent.children.set(key, record);
    if (!firstChild) firstChild = record;
    lastChild = record;
    this.cursor = record;
  }
  parent.firstChild = firstChild;
  parent.lastChild = lastChild;
  for (let record of oldChildren.values()) {
    yield* unmountComponent.call(this, record);
  }
  oldChildren.clear();
}
