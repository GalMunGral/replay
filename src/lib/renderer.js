import {
  createInstance,
  insertAfter,
  appendChild,
  insertBefore,
  getFirstNode,
  getLastNode,
} from "./instance";
import { setCurrent } from "./observable";
import { request } from "./scheduler";
import { equals, toKebabCase, isGeneratorFunction } from "./util";

function getPath(instance) {
  if (!instance) return "";
  if (
    typeof instance.type === "string" ||
    instance.type.name === "StyleWrapper"
  ) {
    return getPath(instance.parent);
  }
  return getPath(instance.parent) + "->" + instance.type.name;
}

var previousSibling;
var stack = [];

function* renderComponent(instance, props) {
  if (!props) props = instance.props;
  if (equals(props, instance.props) && !instance.dirty) {
    return;
  }
  if (typeof instance.type === "string") {
    yield* renderDOMComponent(instance, props);
  } else {
    yield* renderCompositeComponent(instance, props);
  }
  instance.props = props;
  instance.dirty = false;
}

function* renderCompositeComponent(instance, props) {
  // console.log(getPath(instance), "RENDER", instance, props);
  const { type, state } = instance;
  setCurrent(instance);
  let elements;
  if (isGeneratorFunction(type)) {
    elements = yield* type(props, state);
  } else {
    elements = type(props, state);
  }
  setCurrent(null);
  yield* reconcileChilren(instance, elements);
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
    yield () => {
      instance.node.textContent = props.children;
    };
  } else {
    if (!Array.isArray(props.children)) {
      props.children = [["text", {}, props.children]];
    }
    stack.push(previousSibling);
    previousSibling = { type: "dummy", node: instance.node.firstChild };
    yield* reconcileChilren(instance, props.children);
    previousSibling = stack.pop();
  }
}

function* reconcileChilren(instance, elements) {
  const newChildren = {};
  const oldChildren = instance.children;
  let firstChild, lastChild;
  let lastIndex = -1;
  for (let [index, element] of elements.entries()) {
    element = element || ["comment", {}, "slot"];
    const [type, props, children] = element;
    const key = props.key != null ? props.key : index;
    let child;
    if (oldChildren.hasOwnProperty(key) && oldChildren[key].type === type) {
      child = oldChildren[key];
      delete oldChildren[key];
      if (child.index < lastIndex) {
        yield* insertAfter(previousSibling, child);
      } else {
        lastIndex = child.index;
      }
      props.children = children;
      yield* renderComponent(child, props);
    } else {
      child = yield* mountComponent(element, instance);
    }
    child.index = index;
    // console.log(element, key, child);

    newChildren[key] = child;
    if (!firstChild) firstChild = child;
    lastChild = child;
    previousSibling = child;
  }
  for (let child of Object.values(oldChildren)) {
    yield* unmountComponent(child);
  }
  instance.children = newChildren;
  instance.firstChild = firstChild;
  instance.lastChild = lastChild;
}

function* mountComponent(element, parent) {
  const [type, props, children] = element;

  // console.log(element, props);
  props.children = children;
  let instance;
  if (typeof type === "string") {
    instance = createInstance(type, parent, null);

    switch (type) {
      case "text":
        instance.node = new Text();
        break;
      case "comment":
        instance.node = new Comment();
        break;
      default:
        instance.node = document.createElement(type);
        instance.node.append(new Text());
    }
    instance.node.instance = instance;

    yield* renderComponent(instance, props);

    // if (previousSibling) {
    yield* insertAfter(previousSibling, instance);
    // }
    // else {
    //   yield* appendChild(parent, instance);
    // }
  } else {
    instance = createInstance(
      type,
      parent,
      type.initialState ? type.initialState() : null
    );
    yield* renderComponent(instance, props);
  }
  instance.props = props;
  return instance;
}

function* unmountComponent(instance) {
  cleanup(instance);
  yield () => {
    const lastNode = getLastNode(instance);
    const cur = getFirstNode(instance);
    while (cur !== lastNode) cur.remove();
    cur.remove();
  };
}

function cleanup(instance) {
  Object.values(instance.children).forEach((child) => cleanup(child));
  if (typeof instance.type === "function") {
    instance.subscriptions.forEach((s) => s.cancel());
    instance.requests.forEach((r) => (r.canceled = true));
  }
}

function render(elements, container) {
  const root = createInstance(container.tagName.toLowerCase());
  root.node = container;
  request(
    (function* () {
      previousSibling = { type: "dummy", node: container.firstChild };
      yield* reconcileChilren(root, elements);
    })()
  );
  window.root = root;
}

function update(instance) {
  // console.log(instance.type.name || instance.type, "update");
  // const task = renderComponent(instance, instance.props);
  const task = (function* () {
    previousSibling = {
      type: "dummy",
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
