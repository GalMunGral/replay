import { Scheduler } from "./scheduler";
import { Observable } from "./observable";
import { shallowEquals, toKebabCase, isGeneratorFunction } from "./util";

interface AsyncModule {
  default: FunctionalComponent;
}

type Resolver = () => Promise<AsyncModule>;

export interface AsyncComponent {
  isAsync: boolean;
  resolve: Resolver;
}

export const lazy = (resolve: Resolver): AsyncComponent => ({
  isAsync: true,
  resolve,
});

export interface FunctionalComponent extends Function {
  init?: () => Object;
}

export type DOMComponent = string;
export type Component = DOMComponent | FunctionalComponent;

export class ActivationRecord {
  static nextId = 0;
  id: number;
  public name: string;
  public scope: Object = {};
  public children: Map<string, ActivationRecord> = new Map();
  public depth: number;
  public index = -1;
  public key?: string = null;
  public node: Node = null;
  public firstChild: ActivationRecord = null;
  public lastChild: ActivationRecord = null;
  public dirty = false;
  public subscriptions: Set<ActivationRecord>[] = [];

  constructor(
    public type: Component,
    public parent: ActivationRecord = null,
    public props: Object = {}
  ) {
    this.id = ActivationRecord.nextId++;
    this.children = new Map();
    this.depth = parent ? parent.depth + 1 : 0;
    if (typeof type == "string") {
      this.name = type;
    } else {
      this.name = type.name;
      const locals = typeof type.init == "function" ? type.init() : {};
      this.scope = Object.create(
        parent ? parent.scope : null,
        Object.getOwnPropertyDescriptors(locals)
      );
    }
  }

  clone(parent, context) {
    if (__DEBUG__) {
      // console.debug("[[Render]] cloning");
    }
    const clone = Object.create(ActivationRecord.prototype);
    Object.assign(clone, this);
    clone.id = ActivationRecord.nextId++;
    clone.children = new Map(this.children);
    clone.parent = parent ?? this.parent;
    clone.depth = parent ? parent.depth + 1 : 0;
    clone.subscriptions = [];
    context.emit(() => {
      this.transferSubscriptions(clone);
      Scheduler.instance.cancelUpdate(this);
    });
    return clone;
  }

  destruct(context) {
    if (__DEBUG__) {
      // console.warn(this.id, "destruct");
    }
    if (typeof this.type == "function") {
      context.emit(() => {
        this.cancelSubscriptions();
        Scheduler.instance.cancelUpdate(this);
      });
    }
    this.children.forEach((c) => {
      if (c.parent !== this) {
        console.warn("NOT MY CHILD");
      } else {
        c.destruct(context);
      }
    });
  }

  subscribe(observers) {
    observers.add(this);
    this.subscriptions.push(observers);
  }

  private cancelSubscriptions(): void {
    this.subscriptions.forEach((observers) => {
      observers.delete(this);
    });
    this.subscriptions = [];
  }
  private transferSubscriptions(record: ActivationRecord): void {
    this.subscriptions.forEach((observers) => {
      observers.delete(this);
      record.subscribe(observers);
    });
    this.subscriptions = [];
  }

  get parentNode() {
    if (typeof this.type === "string") {
      return this.node;
    }
    return this.parent?.parentNode;
  }

  get firstNode() {
    return typeof this.type === "string"
      ? this.node
      : this.firstChild?.firstNode;
  }

  get lastNode() {
    return typeof this.type === "string" ? this.node : this.lastChild?.lastNode;
  }

  insertAfter(previouSibling, context) {
    const lastNode = this.lastNode;
    let curNode = this.firstNode;
    context.emit(() => {
      if (__DEBUG__) {
        // console.debug(
        //   "[[Commit]] insert:",
        //   this.name + this.id,
        //   this.firstNode,
        //   "after:",
        //   previouSibling.name + previouSibling.id,
        //   previouSibling.lastNode
        // );
      }
      let prevNode = previouSibling.lastNode;
      while (curNode !== lastNode) {
        prevNode.after(curNode);
        prevNode = curNode;
        curNode = curNode.nextSibling;
      }
      prevNode.after(curNode);
    });
  }

  remove(context) {
    const firstNode = this.firstNode;
    const lastNode = this.lastNode;
    context.emit(() => {
      if (__DEBUG__) {
        console.debug(
          "[[Commit]] remove",
          this.name + this.id,
          firstNode,
          lastNode
        );
      }
      let cur = firstNode;
      let next = cur.nextSibling;
      while (cur !== lastNode) {
        cur.remove();
        cur = next;
        next = next.nextSibling;
      }
      cur.remove();
    });
  }
}

function* mountComponent(element, parent, context) {
  let [type, props, children] = element;
  props.children = children;
  if (type.isAsync) {
    if (__DEBUG__) {
      context.t = performance.now();
      console.debug("[[Resolve]] (async component)");
    }
    // Mark as interruptible
    context.interruptible = true;
    type = yield type;
    context.interruptible = false;
    if (__DEBUG__) {
      const t = performance.now() - context.t;
      context.t = 0;
      console.debug("[[Resolve]] loaded:", type.name, t);
    }
  }
  const record = new ActivationRecord(type, parent);
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
        (record.node as Element).append(new Text()); // dummy node
    }
    yield* renderComponent(record, props, context);
    record.insertAfter(context.cursor, context);
  } else {
    yield* renderComponent(record, props, context);
  }
  return record;
}

function unmountComponent(record, context) {
  if (__DEBUG__) {
    console.debug(
      "[[Render]] unmount:",
      record.name + record.id,
      record.firstNode,
      record.lastNode
    );
  }
  record.remove(context);
  record.destruct(context);
}

export function* renderComponent(record, props, context) {
  if (!props) props = record.props;
  if (shallowEquals(props, record.props) && !record.dirty) {
    if (__DEBUG__) {
      // console.debug("[[Render]] early exit");
    }
    context.emit(() => {
      record.children.forEach((c) => {
        if (__DEBUG__) {
          console.debug(
            `[[Commit]] handover: ${c.parent.name + c.parent.id} => ${
              record.name + record.id
            }`
          );
        }
        c.parent = record;
      });
    });
    return;
  }
  // Clear dirty bit *before* rather than *after* rendering,
  // so if further updates occur while rendering is in process, the dirty bit doesn't get cleared mistakenly.
  record.dirty = false;
  if (typeof record.type === "string") {
    yield* renderDOMComponent(record, props, context);
  } else {
    yield* renderCompositeComponent(record, props, context);
  }
  record.props = props;
}

function* renderCompositeComponent(record, props, context) {
  const { type, scope } = record;
  if (__DEBUG__) {
    if (type.name !== "StyleWrapper") {
      // console.debug("[[Render]]", type.name, props);
    }
  }
  let elements;
  Observable.setCurrent(record, context);
  if (isGeneratorFunction(type)) {
    elements = yield* type(props, scope, context);
  } else {
    elements = type(props, scope, context);
  }
  Observable.setCurrent(null, null);
  yield;

  yield* reconcileChildren(record, elements, context);
}

function* renderDOMComponent(record, props, context) {
  const memoized = record.props;
  for (let [name, value] of Object.entries(props)) {
    if (name === "children") continue;
    if (name === "style") {
      for (let [k, v] of Object.entries(value)) {
        k = toKebabCase(k);
        if (!memoized.style || memoized.style[k] !== v) {
          context.emit(() => {
            record.node.style[k] = v;
          });
        }
      }
    } else {
      if (value !== memoized[name]) {
        context.emit(() => {
          record.node[name] = value;
        });
      }
    }
  }
  if (record.type === "text" || record.type === "comment") {
    context.emit(() => {
      record.node.textContent = props.children;
    });
    return;
  }
  if (!Array.isArray(props.children)) {
    props.children = [["text", {}, props.children]]; // p('hello') -> p([ text('hello') ])
  }
  context.stack.push(context.cursor);
  context.cursor = new ActivationRecord("level-anchor");
  context.cursor.node = record.node.firstChild;

  yield;

  yield* reconcileChildren(record, props.children, context);
  context.cursor = context.stack.pop();
}

function* reconcileChildren(parent, elements, context) {
  let lastIndex = -1;
  let oldChildren = parent.children;
  parent.children = new Map();
  for (let [index, element] of elements.entries()) {
    element = element || ["comment", {}, "[slot]"];
    const [type, props, children] = element;
    const key = props.key ?? index;
    props.children = children;
    let record;
    if (oldChildren.has(key) && oldChildren.get(key).type === type) {
      // Reuse existing record
      record = oldChildren.get(key).clone(parent, context);
      oldChildren.delete(key);
      if (record.index < lastIndex) {
        record.insertAfter(context.cursor);
      } else {
        lastIndex = record.index;
      }
      yield* renderComponent(record, props, context);
    } else {
      // Create a new record
      record = yield* mountComponent(element, parent, context);
    }
    if (index === 0) parent.firstChild = record;
    if (index === elements.length - 1) parent.lastChild = record;
    parent.children.set(key, record);
    record.key = key;
    record.index = index;
    context.cursor = record;
  }
  oldChildren.forEach((record) => {
    unmountComponent(record, context);
  });
  oldChildren.clear();
}
