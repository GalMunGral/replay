import { Record, getFirstNode, insertAfter, remove } from "./record";
import { Task, schedule } from './scheduler';
import { setTarget } from "./observable";
import { equals, toKebabCase, isGeneratorFunction } from "./util";

export const lazy = (resolve) => ({ isAsync: true, resolve });

export function render(elements, container) {
  const rootRecord = new Record("_");
  rootRecord.node = container;
  rootRecord.node.innerHTML = "";
  rootRecord.node.prepend(new Text());
  window.__root__ = rootRecord;
  const task = new Task(rootRecord, function*() {
    this.cursor = {
      type: "_",
      node: container.firstChild,
    };
    yield* reconcileChildren.call(this, rootRecord, elements);
  });
  rootRecord.pendingRequests.add(task);
  schedule(task);
}

export function update(record) {
  const task = new Task(record, function*() {
    this.cursor = {
      type: "_",
      node: getFirstNode(record).previousSibling,
    };
    yield* renderComponent.call(this, record);
  });
  record.pendingRequests.add(task);
  schedule(task);
}

function* renderComponent(record, props) {
  if (!props) props = record.props;
  if (equals(props, record.props) && !record.dirty) return;
  if (typeof record.type === "string") {
    yield* renderDOMComponent.call(this, record, props);
  } else {
    yield* renderCompositeComponent.call(this, record, props);
  }
  record.props = props;
  record.dirty = false;
}

function* renderCompositeComponent(record, props) {
  const { type, context } = record;
  if (__DEBUG__) {
    if (type.name !== 'StyleWrapper') {
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
  this.cursor = {
    type: "_",
    node: record.node.firstChild,
  };
  yield* reconcileChildren.call(this, record, props.children);
  this.cursor = this.stack.pop();
}

function* reconcileChildren(parent, elements) {
  let firstChild, lastChild, lastIndex = -1;
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
        yield* insertAfter(this.cursor, record);
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

function* mountComponent(element, parent) {
  let [type, props, children] = element;
  props.children = children;
  if (type.isAsync) {
    if (__DEBUG__) {
      console.debug('[[Resolve]] (async component)');
    }
    type = yield type.resolve();
    if (__DEBUG__) {
      console.debug('[[Resolve]] loaded:', type.name)
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
    yield* insertAfter(this.cursor, record);
  } else {
    yield* renderComponent.call(this, record, props);
  }
  return record;
}

function* unmountComponent(record) {  
  (function cleanup(record) {
    for (let child of Object.values(record.children)) {
      cleanup(child);
    }
    if (typeof record.type === "function") {
      record.subscriptions.forEach((s) => s.cancel());
      record.pendingRequests.forEach((r) => (r.canceled = true));
    }
  })(record);
  yield* remove(record);
}
