import { createFrame, insertAfter, getFirstNode, remove } from "./instance";
import { setCurrent } from "./observable";
import { request } from "./scheduler";
import { equals, toKebabCase, isGeneratorFunction } from "./util";

var previousSibling;
var stack = [];

function* renderComponent(instance, props) {
  if (!props) props = instance.props;
  if (equals(props, instance.props) && !instance.dirty) return;

  if (typeof instance.type === "string") {
    yield* renderDOMComponent(instance, props);
  } else {
    yield* renderCompositeComponent(instance, props);
  }

  instance.props = props;
  instance.dirty = false;
}

function* renderCompositeComponent(instance, props) {
  const { type, context } = instance;
  let elements;

  setCurrent(instance);
  if (isGeneratorFunction(type)) {
    elements = yield* type(props, context);
  } else {
    elements = type(props, context);
  }
  setCurrent(null);

  yield* reconcileChildren(instance, elements);
}

function* renderDOMComponent(instance, props) {
  const effects = [];
  const memoized = instance.props;

  for (let [name, value] of Object.entries(props)) {
    if (name === "children") continue;
    if (name === "style") {
      for (let [k, v] of Object.entries(value)) {
        k = toKebabCase(k);
        if (!memoized.style || memoized.style[k] !== v) {
          effects.push(() => {
            instance.node.style[k] = v;
          });
        }
      }
    } else {
      if (value !== memoized[name]) {
        effects.push(() => {
          instance.node[name] = value;
        });
      }
    }
  }

  yield effects;

  if (instance.type === "text" || instance.type === "comment") {
    yield () => (instance.node.textContent = props.children);
    return;
  }

  if (!Array.isArray(props.children)) {
    props.children = [["text", {}, props.children]]; // p('hello') -> p([ text('hello') ])
  }

  stack.push(previousSibling);
  previousSibling = {
    type: "_",
    node: instance.node.firstChild,
  };
  yield* reconcileChildren(instance, props.children);
  previousSibling = stack.pop();
}

function* reconcileChildren(parent, elements) {
  const newChildren = {};
  const oldChildren = parent.children;

  let firstChild, lastChild;
  let lastIndex = -1;

  for (let [index, element] of elements.entries()) {
    if (!element) element = ["comment", {}, "[slot]"];
    const [type, props, children] = element;
    const key = props.key != null ? props.key : index;
    props.children = children;

    let instance;
    if (oldChildren.hasOwnProperty(key) && oldChildren[key].type === type) {
      instance = oldChildren[key];
      delete oldChildren[key];
      if (instance.index < lastIndex) {
        yield* insertAfter(previousSibling, instance);
      } else {
        lastIndex = instance.index;
      }
      yield* renderComponent(instance, props);
    } else {
      instance = yield* mountComponent(element, parent);
    }

    instance.index = index;
    newChildren[key] = instance;

    if (!firstChild) firstChild = instance;
    lastChild = instance;

    previousSibling = instance;
  }

  for (let instance of Object.values(oldChildren)) {
    yield* unmountComponent(instance);
  }

  parent.children = newChildren;
  parent.firstChild = firstChild;
  parent.lastChild = lastChild;
}

function* mountComponent(element, parent) {
  const [type, props, children] = element;
  props.children = children;

  const instance = createFrame(type, parent);

  if (typeof type === "string") {
    switch (type) {
      case "text":
        instance.node = new Text();
        break;
      case "comment":
        instance.node = new Comment();
        break;
      default:
        instance.node = document.createElement(type);
        instance.node.append(new Text()); // Create a dummy node to make reordering easier
    }
    yield* renderComponent(instance, props);
    yield* insertAfter(previousSibling, instance);
  } else {
    yield* renderComponent(instance, props);
  }

  instance.props = props; // Save
  return instance;
}

function* unmountComponent(instance) {
  cleanup(instance);
  yield* remove(instance);
}

function cleanup(instance) {
  for (let child of Object.values(instance.children)) {
    cleanup(child);
  }
  if (typeof instance.type === "function") {
    instance.subscriptions.forEach((s) => s.cancel());
    instance.requests.forEach((r) => (r.canceled = true));
  }
}

function render(elements, container) {
  const root = createFrame("_");
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

function update(instance) {
  const task = (function* task() {
    previousSibling = {
      type: "_",
      node: getFirstNode(instance).previousSibling,
    };
    yield* renderComponent(instance);
  })();
  task.canceled = false;
  task.sender = instance;
  instance.requests.push(task);
  request(task);
}

export { render, update };
