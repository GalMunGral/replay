function createFrame(type, parent) {
  const parentContext = parent ? parent.context : null;
  const localContext = typeof type.init == "function" ? type.init() : {};

  return {
    type,
    context: Object.create(
      parentContext,
      Object.getOwnPropertyDescriptors(localContext)
    ),
    props: {},
    children: {},
    parent,
    index: -1,
    firstChild: null,
    lastChild: null,
    node: null,
    subscriptions: [],
    requests: [],
    dirty: false,
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

function* remove(instance) {
  const firstNode = getFirstNode(instance);
  const lastNode = getLastNode(instance);
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

export {
  createFrame,
  getFirstNode,
  getLastNode,
  getParentNode,
  insertAfter,
  remove,
};