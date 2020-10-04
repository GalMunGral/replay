import { pushObserver, popObserver } from "./Observable";
import { Arguments, Record, RenderFunction } from "./Record";

class Stack<T> extends Array<T> {
  top() {
    return this[this.length - 1];
  }
}

interface RecordContext {
  parent: Record;
  props: Arguments;
  children: (() => any)[];
  oldChildren: Map<string, Record>;
  prevChild: Record;
  index: number;
}

export const recordContexts = new Stack<RecordContext>();
export const hostContexts = new Stack<ChildNode[]>();

var pending = false;
const updateQueue = new Set<Record>();

const hostRenderer: RenderFunction = function (props) {
  const record: Record = this;
  const memoized = record.props;
  for (let [name, value] of Object.entries(props)) {
    if (name == "children") continue;
    if (name == "style") {
      for (let [k, v] of Object.entries(value)) {
        k = k.replace(/[A-Z]/g, (c) => "-" + c.toLowerCase());
        if (!memoized.style || memoized.style[k] !== v) {
          (record.node as HTMLElement).style[k] = v;
        }
      }
    } else {
      // Other DOM properties
      if (value !== memoized[name]) {
        record.node[name] = value;
      }
    }
  }
  props.children.forEach((renderFunc) => {
    const result = renderFunc();
    if (result) {
      __STEP_OVER__("text", {
        textContent: String(result),
      });
    }
  });
};

export const $$isHostRenderer = Symbol();

export function getHostRenderFunction(htmlTag: string): RenderFunction {
  return new Proxy(hostRenderer, {
    get(target, key, receiver) {
      if (key === "name") return htmlTag;
      if (key === $$isHostRenderer) return true;
      return Reflect.get(target, key, receiver);
    },
  });
}

function shallowEquals(a: any, b: any): boolean {
  if (typeof a != typeof b) return false;
  if (typeof a != "object" || a == null) return a == b;
  if (Object.keys(a).length != Object.keys(b).length) return false;
  for (let key of Object.keys(a)) {
    if (a[key] !== b[key]) return false;
  }
  return true;
}

export function __STEP_INTO__(
  type: string | RenderFunction,
  props: Arguments = {}
) {
  const { parent, oldChildren, index, prevChild } = recordContexts.top();
  const key = props.key ?? String(index);
  let record: Record;

  if (oldChildren.has(key) && oldChildren.get(key).type === type) {
    // Reuse existing record
    record = oldChildren.get(key);
    oldChildren.delete(key);
  } else {
    // Create a new record
    record = new Record(type, parent);
    const f = (record.renderFunction =
      typeof type == "string" ? getHostRenderFunction(type) : type);

    // Initialize scope
    if (typeof f.init == "function") {
      const locals = f.init(props, record.scope) ?? {};
      const descriptors = Object.getOwnPropertyDescriptors(locals);
      Object.defineProperties(record.scope, descriptors);
    }
  }

  parent.children.set((record.key = key), record);
  if (!prevChild) parent.firstChild = record;
  parent.lastChild = record;

  {
    // Now that we have a node, we can start working on it.
    const oldChildren = record.children;
    record.children = new Map<string, Record>();
    // Prepare for recurison
    recordContexts.push({
      parent: record,
      props,
      children: [],
      oldChildren,
      prevChild: null,
      index: 0,
    });
    if (record.isHostRecord) {
      hostContexts.push([]);
    }
  }
}

export function __STEP_OUT__(type?: string | RenderFunction) {
  const currentContext = recordContexts.top();
  const { parent: record, props, children } = currentContext;

  props.children = children;

  const shouldUpdate =
    record.invalidated || !shallowEquals(props, record.props);

  if (shouldUpdate) {
    pushObserver(record);
    record.renderFunction.apply(record, [props, record.scope]);
    popObserver();

    // Remove unused records and their DOM nodes
    const { oldChildren } = currentContext;
    oldChildren.forEach((child) => {
      if (child.isHostRecord) {
        child.node.remove();
      } else {
        child.childNodes.forEach((node) => {
          node.remove();
        });
      }
      child.destroy();
    });
    oldChildren.clear();

    // Move or attach new DOM nodes
    if (record.isHostRecord) {
      const childNodes = hostContexts.pop();
      const parentNode = record.node as Element;
      childNodes.reduceRight((next, cur) => {
        if (!(cur.parentNode === parentNode && cur.nextSibling === next)) {
          parentNode.insertBefore(cur, next);
        }
        return cur;
      }, null);
      const parentSiblings = hostContexts.top();
      parentSiblings.push(parentNode);
    }
  } else {
    console.debug("Nothing changed. Skip updates.");

    // No diffing on children. Reuse old ones.
    record.children = currentContext.oldChildren;

    // No reordering, but context still needs to be updated.
    if (record.isHostRecord) {
      hostContexts.pop(); // Pushed in `__STEP_INTO__`
      const parentSiblings = hostContexts.top();
      parentSiblings.push(record.node);
    }
  }

  record.props = props;
  record.invalidated = false;
  recordContexts.pop();
  recordContexts.top().index++;
  recordContexts.top().prevChild = record;
  console.groupEnd();
}

export function __CONTENT__(renderFunc: () => any) {
  const currentContext = recordContexts.top();
  currentContext.children.push(renderFunc);
}

export function __STEP_OVER__(
  type: string | RenderFunction,
  props?: Arguments
) {
  __STEP_INTO__(type, props);
  __STEP_OUT__(type);
}

export function render(rootComponent: RenderFunction, container: Element) {
  container.innerHTML = "";
  hostContexts.push([]);
  recordContexts.push({
    parent: new Record("_"),
    props: null,
    children: [],
    oldChildren: new Map<string, Record>(),
    prevChild: new Record("_"),
    index: 0,
  });

  __STEP_OVER__(rootComponent);

  recordContexts.pop();

  hostContexts.pop().forEach((node) => {
    container.appendChild(node);
  });
}

export function requestUpdate(record: Record) {
  updateQueue.add(record);
  if (!pending) {
    queueMicrotask(flushUpdateQueue);
    pending = true;
  }
}

function update(entry: Record) {
  const lastNode = entry.lastHostRecord.node;
  const parent = lastNode.parentNode;
  const next = lastNode.nextSibling;
  hostContexts.push([]);

  const oldChildren = entry.children;
  entry.children = new Map<string, Record>();
  recordContexts.push(
    {
      parent: null,
      props: null,
      children: null,
      oldChildren: null,
      prevChild: null, // `__STEP_OUT__` requires this
      index: 0, // `__STEP_OUT__` requires this
    },
    {
      parent: entry,
      props: entry.props,
      children: entry.props.children,
      oldChildren,
      prevChild: null,
      index: 0,
    }
  );

  __STEP_OUT__(entry.type);

  const childNodes = hostContexts.pop();
  childNodes.reduceRight((next, cur) => {
    if (!(cur.parentNode === parent && cur.nextSibling === next)) {
      parent.insertBefore(cur, next);
    }
    return cur;
  }, next);

  recordContexts.pop();
}

function flushUpdateQueue() {
  pending = false;
  const sortedTasks = [...updateQueue].sort((a, b) => a.depth - b.depth);
  updateQueue.clear();

  while (sortedTasks.length) {
    const entry = sortedTasks.shift();
    if (!entry.type) continue; // already destroyed
    update(entry);
  }
}
