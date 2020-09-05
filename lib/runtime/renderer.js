import { createRecord, insertAfter, getFirstNode, remove } from "./record";
import { setTarget } from "./observable";
import { request } from "./scheduler";
import { equals, toKebabCase, isGeneratorFunction } from "./util";

const lazy = (resolve) => ({
  isAsync: true,
  resolve
});

var previousSibling;
var stack = [];

function* renderComponent(record, props) {
  if (!props) props = record.props;
  if (equals(props, record.props) && !record.dirty) return;

  if (typeof record.type === "string") {
    yield* renderDOMComponent(record, props);
  } else {
    yield* renderCompositeComponent(record, props);
  }

  record.props = props;
  record.dirty = false;
}

function* renderCompositeComponent(record, props) {
  const { type, context } = record;

  if (__DEBUG__) {
    if (type.name !== 'StyleWrapper') {
      console.debug('[[Render]]', type.name, props);
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

  yield* reconcileChildren(record, elements);
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

  stack.push(previousSibling);
  previousSibling = {
    type: "_",
    node: record.node.firstChild,
  };
  yield* reconcileChildren(record, props.children);
  previousSibling = stack.pop();
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
        yield* insertAfter(previousSibling, record);
      } else {
        lastIndex = record.index;
      }
      yield* renderComponent(record, props);
    } else {
      record = yield* mountComponent(element, parent);
    }

    record.index = index;
    parent.children.set(key, record);

    if (!firstChild) firstChild = record;
    lastChild = record;

    previousSibling = record;
  }

  parent.firstChild = firstChild;
  parent.lastChild = lastChild;

  for (let record of oldChildren.values()) {
    yield* unmountComponent(record);
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
  
  const record = createRecord(type, parent);

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
    yield* renderComponent(record, props);
    yield* insertAfter(previousSibling, record);
  } else {
    yield* renderComponent(record, props);
  }

  return record;
}

function* unmountComponent(record) {
  cleanup(record);
  yield* remove(record);
}

function cleanup(record) {
  for (let child of Object.values(record.children)) {
    cleanup(child);
  }
  if (typeof record.type === "function") {
    record.subscriptions.forEach((s) => s.cancel());
    record.requests.forEach((r) => (r.canceled = true));
  }
}

function render(elements, container) {
  const root = createRecord("_");
  root.node = container;
  root.node.innerHTML = "";
  root.node.prepend(new Text());
  request(
    (function* task() {
      previousSibling = {
        type: "_",
        node: container.firstChild,
      };
      yield* reconcileChildren(root, elements);
    })()
  );
  window.__root__ = root;
}

function update(record) {
  const task = (function* task() {
    previousSibling = {
      type: "_",
      node: getFirstNode(record).previousSibling,
    };
    yield* renderComponent(record);
  })();
  task.canceled = false;
  task.initiator = record;
  record.requests.push(task);
  request(task);
}

export { render, update, lazy };
