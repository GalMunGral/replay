function createRecord(type, parent) {
  const parentContext = parent ? parent.context : null;
  const localContext = typeof type.init == "function" ? type.init() : {};
  return {
    type,
    context: Object.create(
      parentContext,
      Object.getOwnPropertyDescriptors(localContext)
    ),
    props: {},
    children: new Map(),
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

function getFirstNode(record) {
  if (typeof record.type === "string") {
    return record.node;
  }
  return getFirstNode(record.firstChild);
}

function getLastNode(record) {
  if (typeof record.type === "string") {
    return record.node;
  }
  return getLastNode(record.lastChild);
}

function getParentNode(record) {
  if (typeof record.type === "string") {
    return record.node;
  }
  return getParentNode(record.parent);
}

function* insertAfter(previouSibling, record) {
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

function* remove(record) {
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

export {
  createRecord,
  getFirstNode,
  getLastNode,
  getParentNode,
  insertAfter,
  remove,
};
