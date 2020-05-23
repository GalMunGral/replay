function createInstance(type, parent, createContext = () => ({}), deps = {}) {
  const proto = (parent && parent.context) || null;
  const properties = Object.getOwnPropertyDescriptors(createContext(proto));
  const context = Object.create(proto, properties);
  Object.freeze(context);

  return {
    type,
    parent,
    context,
    props: {},
    children: {},
    index: -1,
    firstChild: null,
    lastChild: null,
    node: null,
    subscriptions: [],
    requests: [],
    depth: parent ? parent.depth + 1 : 0,
  };
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

function* insertAfter(previouSibling, instance) {
  const lastNode = getLastNode(instance);
  let curNode = getFirstNode(instance);
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

export {
  createInstance,
  getFirstNode,
  getLastNode,
  getParentNode,
  insertAfter,
};
