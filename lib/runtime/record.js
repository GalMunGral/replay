export class Record{
  constructor(type, parent) {
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
    this.pendingRequests = new Set();
  }

  clone() {
    const clone = Object.create(Record.prototype);
    Object.assign(clone, this);
    return clone;    
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
