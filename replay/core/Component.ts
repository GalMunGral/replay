import { Context, RenderTask, Scheduler } from "./Scheduler";
import tags from "html-tags";
import { stats } from "./Stats";

export interface Quasiquote extends Iterable<any> {
  0: string | RenderFunction | AsyncRenderFunction; // type
  1: Arguments; // props
  2: string | Quasiquote[]; // children
}

export const $$isHostRenderFunction = Symbol();

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

export interface HostRenderFunction extends RenderFunction {
  [$$isHostRenderFunction]: boolean;
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

const hostRenderFunction: RenderFunction = function (props, {}, context) {
  // console.log(this, props);
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

export function isHostType(
  type: string | RenderFunction | AsyncRenderFunction
): boolean {
  return (
    typeof type == "string" ||
    (typeof type == "function" && type[$$isHostRenderFunction])
  );
}

export function getHostRenderFunction(htmlTag: string): RenderFunction {
  return new Proxy(hostRenderFunction, {
    get(target, key, receiver) {
      if (key === "name") return htmlTag;
      if (key === $$isHostRenderFunction) return true;
      return Reflect.get(target, key, receiver);
    },
  });
}

export class ActivationRecord {
  private static nextId = 0;

  public id = ActivationRecord.nextId++;
  public name: string;
  public renderFunction: RenderFunction;
  public readonly scope = {} as DynamicScope;
  public props: Arguments = {};
  public children = new Map<string, ActivationRecord>();
  public depth: number;
  public index = -1;
  public key?: string = null;
  public node: ChildNode = null;
  public firstChild: ActivationRecord = null;
  public lastChild: ActivationRecord = null;
  public dirty = false;
  public subscriptions = new Set<Set<ActivationRecord>>();

  // TODO: cancellation effects

  constructor(
    public readonly type: string | RenderFunction | AsyncRenderFunction,
    public parent: ActivationRecord = null
  ) {
    this.depth = parent ? parent.depth + 1 : 0;
    if (__DEBUG__) {
      stats.maxDepth = Math.max(stats.maxDepth, this.depth);
    }
    if (parent) Object.setPrototypeOf(this.scope, parent.scope);
    if (isHostType(type)) {
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
    // console.log(type, parent, this.node);
  }

  public clone(parent: ActivationRecord, context: Context): ActivationRecord {
    const clone: ActivationRecord = Object.create(ActivationRecord.prototype);
    Object.assign(clone, this);
    clone.id = ActivationRecord.nextId++;
    clone.children = new Map(this.children);
    clone.parent = parent ?? this.parent;
    clone.depth = parent ? parent.depth + 1 : 0;
    clone.subscriptions = new Set<Set<ActivationRecord>>();
    if (!isHostType(this.type)) {
      context.emit(() => {
        this.transferSubscriptions(clone);
        // This record is already up to date, because
        // if newer updates did occur, this commit wouldn't happen
        Scheduler.instance.cancelUpdate(this);
      });
    }
    return clone;
  }

  public destructSubtree(context: Context): void {
    if (!isHostType(this.type)) {
      context.emit(() => {
        if (this.scope.hasOwnProperty("deinit")) this.scope.deinit();
        this.cancelSubscriptions();
        Scheduler.instance.cancelUpdate(this);
      });
    }
    this.children.forEach((c) => {
      if (c.parent === this) {
        c.destructSubtree(context);
      } else {
        if (__DEBUG__) {
          LOG("[[DESTRUCT]] STOP: NOT MY CHILD");
        }
      }
    });
  }

  subscribe(observers: Set<ActivationRecord>): void {
    observers.add(this);
    this.subscriptions.add(observers);
  }

  private cancelSubscriptions(): void {
    this.subscriptions.forEach((observers) => {
      observers.delete(this);
    });
    this.subscriptions.clear();
  }

  private transferSubscriptions(clone: ActivationRecord): void {
    this.subscriptions.forEach((observers) => {
      observers.delete(this);
      clone.subscribe(observers);
    });
    this.subscriptions.clear();
  }

  public get parentNode(): ChildNode {
    return isHostType(this.type) ? this.node : this.parent?.parentNode;
  }

  public get firstLeaf(): ActivationRecord {
    return isHostType(this.type) ? this : this.firstChild?.firstLeaf;
  }

  public get lastLeaf(): ActivationRecord {
    return isHostType(this.type) ? this : this.lastChild?.lastLeaf;
  }

  public insertAfter(previouSibling: ActivationRecord): void {
    if (__DEBUG__) {
      // LOG(
      //   "[[Commit]] insert:",
      //   this.name + this.id,
      //   this.firstLeaf.node,
      //   "after:",
      //   previouSibling.name + previouSibling.id,
      //   previouSibling.lastLeaf.node
      // );
    }
    const lastNode = this.lastLeaf.node;
    let curNode = this.firstLeaf.node;
    let prevNode = previouSibling.lastLeaf.node;
    while (curNode !== lastNode) {
      prevNode.after(curNode);
      prevNode = curNode;
      curNode = curNode.nextSibling;
    }
    prevNode.after(curNode);
  }

  public removeNodes(): void {
    if (__DEBUG__) {
      LOG(
        "[[Commit]] remove"
        // this.name + this.id,
        // this.firstLeaf.node,
        // this.lastLeaf.node
      );
    }
    const firstNode = this.firstLeaf.node;
    const lastNode = this.lastLeaf.node;
    let cur = firstNode;
    let next = cur.nextSibling;
    while (cur !== lastNode) {
      cur.remove();
      cur = next;
      next = next.nextSibling;
    }
    cur.remove();
  }
}
