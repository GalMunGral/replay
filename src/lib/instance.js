function createInstance(type, parent, state) {
  return {
    type,
    props: {},
    state: Object.create(
      (parent && parent.state) || null,
      state ? Object.getOwnPropertyDescriptors(state) : {}
    ),
    index: -1,
    parent,
    children: {},
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
  // console.log(previouSibling, instance);
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

// function* insertBefore(nextSibling, instance) {
//   const firstNode = getFirstNode(instance);
//   let curNode = getLastNode(instance);
//   let prevNode = getFirstNode(nextSibling);
//   yield () => {
//     while (curNode !== firstNode) {
//       prevNode.before(curNode);
//       prevNode = curNode;
//       curNode = curNode.previouSibling;
//     }
//     prevNode.before(curNode);
//   };
// }

function* appendChild(parent, instance) {
  const parentNode = getParentNode(parent);
  let curNode = getFirstNode(instance);
  yield () => {
    parentNode.append(curNode);
  };
}

export {
  createInstance,
  getFirstNode,
  getLastNode,
  getParentNode,
  insertAfter,
  // insertBefore,
  appendChild,
};
