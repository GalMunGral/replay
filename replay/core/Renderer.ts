import { Context, RenderTask, Scheduler } from "./Scheduler";
import {
  pushObserver,
  popObserver,
  OneTimeObservable,
  OneTimeObserver,
  observable,
} from "./Observable";

export interface Quasiquote extends Iterable<any> {
  0: string | RenderFunction | AsyncRenderFunction; // type
  1: Arguments; // props
  2: string | Quasiquote[]; // children
}

export interface RenderFunction extends Function {
  (props: Arguments, scope: DynamicScope, context: RenderTask):
    | string
    | Quasiquote[];
  init?: (
    props: Arguments,
    scope: DynamicScope,
    context: RenderTask
  ) => DynamicScope | void;
}

export interface Arguments {
  key?: string;
  children?: string | Quasiquote[];
  [key: string]: any;
}

export interface DynamicScope extends Object {
  deinit?: () => void;
  [key: string]: any;
}

export interface AsyncRenderFunction {
  isAsync: true;
  resolver: ResolverFunction;
}

export type ResolverFunction = () => Promise<{ default: RenderFunction }>;

export function lazy(resolver: ResolverFunction): AsyncRenderFunction {
  return { isAsync: true, resolver };
}

const hostRenderer: RenderFunction = function (props, {}, context) {
  const record: ActivationRecord = this;
  const memoized = record.props;
  for (let [name, value] of Object.entries(props)) {
    if (name == "children") continue;
    if (name == "style") {
      for (let [k, v] of Object.entries(value)) {
        k = k.replace(/[A-Z]/g, (c) => "-" + c.toLowerCase());
        if (!memoized.style || memoized.style[k] !== v) {
          context.emit(() => {
            (record.node as HTMLElement).style[k] = v;
          });
        }
      }
    } else {
      // Other DOM properties
      if (value !== memoized[name]) {
        context.emit(() => {
          record.node[name] = value;
        });
      }
    }
  }
  return props.children;
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

export class ActivationRecord implements OneTimeObserver {
  private isHostRecord: boolean;
  public renderFunction: RenderFunction;
  public scope = observable({}) as DynamicScope;
  public props: Arguments = {};
  public children = new Map<string, ActivationRecord>();
  public depth: number;
  public index = -1;
  public key?: string = null;
  public node: ChildNode = null;
  public firstChild: ActivationRecord = null;
  public lastChild: ActivationRecord = null;
  public state: number = 0;
  private subscriptions = new Set<OneTimeObservable>();
  private invalidated = false;

  constructor(
    public type: string | RenderFunction | AsyncRenderFunction,
    public parent: ActivationRecord = null
  ) {
    this.isHostRecord = typeof type == "string" || type[$$isHostRenderer];
    this.depth = parent ? parent.depth + 1 : 0;
    if (parent) Object.setPrototypeOf(this.scope, parent.scope);
    if (this.isHostRecord) {
      this.node =
        typeof type == "string"
          ? type == "text"
            ? new Text()
            : type == "comment"
            ? new Comment()
            : document.createElement(type)
          : document.createElement((type as RenderFunction).name);
      if (this.node.nodeType == 1) {
        (this.node as Element).append(new Text()); // dummy node
      }
    }
  }

  public get firstHostRecord(): ActivationRecord {
    return this.isHostRecord ? this : this.firstChild?.firstHostRecord;
  }

  private get lastHostRecord(): ActivationRecord {
    return this.isHostRecord ? this : this.lastChild?.lastHostRecord;
  }

  private get childNodes(): ChildNode[] {
    const childNodes = [];
    const firstNode = this.firstHostRecord.node;
    const lastNode = this.lastHostRecord.node;
    let cur = firstNode;
    while (cur !== lastNode) {
      childNodes.push(cur);
      cur = cur.nextSibling;
    }
    childNodes.push(cur);
    return childNodes;
  }

  public observeOnce(data: OneTimeObservable): void {
    data.observers.add(this);
    this.subscriptions.add(data);
  }

  public invalidate() {
    if (!this.invalidated) {
      this.invalidated = true;
      Scheduler.instance.requestUpdate(this);
    }
  }

  private unobserve(clone: ActivationRecord): void {
    this.subscriptions.forEach((data) => {
      data.observers.delete(this);
      if (clone) clone.observeOnce(data);
    });
    this.subscriptions.clear();
    Scheduler.instance.cancelUpdate(this);
  }

  *render(props: Arguments, context: RenderTask) {
    props = props ?? this.props;

    if (shallowEquals(props, this.props) && !this.invalidated) {
      context.emit(() => {
        this.children.forEach((child) => {
          child.parent = this;
        });
      });
      return this.isHostRecord ? [this.node] : this.childNodes;
    }

    let elements: string | Quasiquote[];

    pushObserver(this);
    elements = this.renderFunction.apply(this, [props, this.scope, context]);
    popObserver();
    yield;

    let roots: ChildNode[];

    if (this.type === "text" || this.type === "comment") {
      const textNode = this.node as CharacterData;
      context.emit(() => {
        textNode.textContent = elements as string;
      });
      roots = [this.node];
    } else {
      roots = yield* this.diff(elements as Quasiquote[], context);
    }

    context.emit(() => {
      this.state = 1;
      this.invalidated = false;
      this.props = props;
    });

    return roots;
  }

  *diff(elements: Quasiquote[], context: RenderTask) {
    const childNodes = [];
    const oldChildren = this.children;
    this.children = new Map();

    for (let [i, element] of (elements as Quasiquote[]).entries()) {
      if (!element) element = ["comment", {}, "[slot]"]; // empty
      if (!Array.isArray(element)) element = ["text", {}, String(element)]; // raw text
      const [type, props, children] = element;
      props.children = children;

      let child: ActivationRecord;

      const key = props.key ?? String(i);
      if (oldChildren.has(key) && oldChildren.get(key).type === type) {
        // Reuse existing record
        child = oldChildren.get(key).clone(this, context);
        oldChildren.delete(key);
      } else {
        // Create a new record
        child = new ActivationRecord(type, this);
        const f = (child.renderFunction =
          typeof type == "string"
            ? getHostRenderFunction(type)
            : typeof type == "object"
            ? yield type
            : type);
        // Initialize dynamic scope
        if (typeof f.init == "function") {
          const locals = f.init(props, child.scope, context) ?? {};
          const descriptors = Object.getOwnPropertyDescriptors(locals);
          Object.defineProperties(child.scope, descriptors);
        }
      }

      if (i == 0) this.firstChild = child;
      if (i == elements.length - 1) this.lastChild = child;
      this.children.set(key, child);
      child.key = key;
      child.index = i;

      const roots = yield* child.render(props, context);
      childNodes.push(...roots);
    }

    // Remove unused records and their DOM nodes
    oldChildren.forEach((child) => {
      context.emit(() => {
        if (child.isHostRecord) {
          child.node.remove();
        } else {
          child.childNodes.forEach((node) => {
            node.remove();
          });
        }
      });
      child.destroy(context);
    });
    oldChildren.clear();

    // Move or attach new DOM nodes
    if (this.isHostRecord) {
      context.emit(() => {
        childNodes.reduce((prev, cur) => {
          if (prev.nextSibling !== cur) {
            prev.after(cur);
          }
          return cur;
        }, this.node.firstChild);
      });
    }

    return this.isHostRecord ? [this.node] : childNodes;
  }

  public clone(parent: ActivationRecord, context: Context): ActivationRecord {
    const clone: ActivationRecord = { ...this };
    Object.setPrototypeOf(clone, ActivationRecord.prototype);
    clone.children = new Map(this.children);
    clone.parent = parent ?? this.parent;
    clone.depth = clone.parent ? clone.parent.depth + 1 : 0;
    clone.subscriptions = new Set<OneTimeObservable>();
    clone.state = 0; // not mounted
    context.emit(() => {
      if (!this.isHostRecord) this.unobserve(clone);
      Object.keys(this).forEach((key) => (this[key] = null));
      this.state = 2; // cloned
      clone.state = 1; // current
    });
    return clone;
  }

  public destroy(context: Context): void {
    this.children.forEach((c) => {
      if (c.parent === this) c.destroy(context);
    });
    context.emit(() => {
      if (!this.isHostRecord) {
        this.unobserve(null);
        if (
          // Check that it is not inherited
          this.scope.hasOwnProperty("deinit") &&
          typeof this.scope.deinit == "function"
        ) {
          this.scope.deinit();
        }
      }
      Object.keys(this).forEach((key) => (this[key] = null));
      this.state = 3; // destroyed
    });
  }
}
