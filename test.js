function createInstance(type, parent) {
  return {
    type,
    props: {},
    state: {},
    children: {},
    firstChild: null,
    lastChild: null,
    node: null,
    parent,
    index: -1,
  };
}

var currentTask = null;
var pendingTasks = [];
var effects = [];

function request(task) {
  if (currentTask) {
    pendingTasks.push(task);
  } else {
    currentTask = task;
    window.requestIdleCallback(doWork);
  }
}

function doWork(deadline) {
  while (deadline.timeRemaining() > 5) {
    const { done, value } = currentTask.next();
    if (done) {
      return window.requestAnimationFrame(commit);
    } else {
      if (Array.isArray(value)) {
        effects.push(...value);
      } else {
        effects.push(value);
      }
    }
  }
  window.requestIdleCallback(doWork);
}

function commit() {
  for (let effect of effects) effect();
  effects = [];
  currentTask = pendingTasks.shift();
  if (currentTask) {
    window.requestIdleCallback(doWork);
  }
}

function render(element, container) {
  const root = createInstance(container.tagName.toLowerCase(), null);
  root.node = container;
  request(reconcileChilren(root, [element]));
  window.root = root;
}

function* renderComponent(instance, props) {
  // if (equals(props, instance.props)) return;
  if (typeof instance.type === "string") {
    yield* renderDOMComponent(instance, props);
  } else {
    yield* renderCompositeComponent(instance, props);
  }
  instance.props = props;
}

function setState(update) {
  this.state = { ...this.state, ...update };
  request(renderComponent(this, this.props));
}

function* renderCompositeComponent(instance, props) {
  const { type, state } = instance;
  const elements = type(props, state, setState.bind(instance));
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
  if (instance.type === "text") {
    yield () => {
      instance.node.textContent = props.children;
    };
  } else {
    yield* reconcileChilren(instance, props.children);
  }
}

function* reconcileChilren(instance, elements) {
  const newChildren = {};
  const oldChildren = instance.children;
  let firstChild, lastChild, prevChild;
  let lastIndex = -1;
  for (let [index, element] of elements.entries()) {
    const [type, props, children] = element;
    const key = props.key != null ? props.key : index;
    let child;
    if (oldChildren.hasOwnProperty(key) && oldChildren[key].type === type) {
      child = oldChildren[key];
      delete oldChildren[key];
      if (child.index < lastIndex) {
        const _prevChild = prevChild;
        const _child = child;
        yield () => {
          insertAfter(_prevChild, _child);
        };
      } else {
        lastIndex = child.index;
      }
      props.children = children;
      yield* renderComponent(child, props);
    } else {
      child = yield* mountComponent(element, instance, prevChild);
    }
    child.index = index;
    newChildren[key] = child;
    if (!firstChild) firstChild = child;
    lastChild = prevChild = child;
  }
  for (let child of Object.values(oldChildren)) {
    yield* unmountComponent(child);
  }
  instance.children = newChildren;
  instance.firstChild = firstChild;
  instance.lastChild = lastChild;
}

function getFirstNode(instance) {
  if (typeof instance.type === "string") {
    return instance.node;
  }
  return getFirstNode(instance.firstChild);
}

function getLastNode(instance) {
  if (typeof instance.type === "string") {
    return instance.node;
  }
  return getLastNode(instance.lastChild);
}

function getParentNode(instance) {
  if (typeof instance.type === "string") {
    return instance.node;
  }
  return getParentNode(instance.parent);
}

function* mountComponent(element, parent, previousSibling) {
  const [type, props, children] = element;
  props.children = children;
  const instance = createInstance(type, parent);
  if (typeof type === "string") {
    yield () => {
      instance.node =
        type === "text" ? new Text() : document.createElement(type);
    };
    yield* renderComponent(instance, props);
    yield () => {
      if (previousSibling) {
        insertAfter(previousSibling, instance);
      } else {
        appendChild(parent, instance);
      }
    };
  } else {
    yield* renderComponent(instance, props);
  }

  instance.props = props;
  return instance;
}

function* unmountComponent(instance) {
  for (let child of Object.values(instance.children)) {
    yield* unmountComponent(child);
  }
  if (typeof instance.type === "string") {
    instance.node.remove();
  }
}

function insertAfter(previouSibling, instance) {
  const lastNode = getLastNode(instance);
  let curNode = getFirstNode(instance);
  let prevNode = getLastNode(previouSibling);
  while (curNode !== lastNode) {
    prevNode.after(curNode);
    prevNode = curNode;
    curNode = curNode.nextSibling;
  }
  prevNode.after(curNode);
}

function appendChild(parent, instance) {
  const parentNode = getParentNode(parent);
  parentNode.append(instance.node);
}

function equals(a, b) {
  if (a == null && b == null) return true;
  if (a == null || b == null) return false;
  if (typeof a != typeof b) return false;
  if (/number|string|boolean|symbol|function/.test(typeof a)) return a == b;
  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length != b.length) return false;
    for (let i = 0; i < a.length; i++) {
      if (!equals(a[i], b[i])) return false;
    }
    return true;
  }
  if (Array.isArray(a) || Array.isArray(b)) return false;
  if (Object.keys(a).length != Object.keys(b).length) return false;
  for (let key of Object.keys(a)) {
    if (!b.hasOwnProperty(key)) return false;
    if (!equals(a[key], b[key])) return false;
  }
  return true;
}

function toKebabCase(s) {
  return s.replace(/[A-Z]/g, (c) => "-" + c.toLowerCase());
}
