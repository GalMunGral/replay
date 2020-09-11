import { Context, RenderTask, Scheduler } from "./scheduler";

interface RenderFunction extends Function {
  (props: Object, scope: Object, context: Context): Quasiquote[];
  init?: () => Object;
}

type ResolverFunction = () => Promise<{ default: RenderFunction }>;

export interface AsyncRenderFunction {
  isAsync: true;
  resolver: ResolverFunction;
}

export function lazy(resolver: ResolverFunction): AsyncRenderFunction {
  return { isAsync: true, resolver };
}

export type ActivationRecordType = string | RenderFunction;

export type Quasiquote = [
  string | RenderFunction | AsyncRenderFunction, // type
  Object, // props
  Quasiquote[] // children
];

export class ActivationRecord {
  private static nextId = 0;
  public id: number;
  public readonly name: string;
  public readonly scope: Object = {};
  public children: Map<string, ActivationRecord> = new Map();
  public depth: number;
  public index = -1;
  public key?: string = null;
  public node: ChildNode = null;
  public firstChild: ActivationRecord = null;
  public lastChild: ActivationRecord = null;
  public dirty = false;
  public subscriptions: Set<ActivationRecord>[] = [];

  constructor(
    public readonly type: ActivationRecordType,
    public parent: ActivationRecord = null,
    public props: Object = {}
  ) {
    this.id = ActivationRecord.nextId++;
    this.children = new Map();
    this.depth = parent ? parent.depth + 1 : 0;
    if (typeof type == "string") {
      this.name = type;
    } else if (typeof type == "function") {
      this.name = type.name;
      if (type.init) this.scope = type.init();
      Object.setPrototypeOf(this.scope, parent?.scope);
    }
  }

  public clone(parent: ActivationRecord, context: Context): ActivationRecord {
    if (__DEBUG__) {
      LOG("[[Render]] clone record");
    }
    const clone: ActivationRecord = Object.create(ActivationRecord.prototype);
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

  public destruct(context: Context): void {
    if (__DEBUG__) {
      LOG(this.id, "DESTRUCT");
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

  subscribe(observers: Set<ActivationRecord>): void {
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

  public get parentNode(): ChildNode {
    if (typeof this.type === "string") {
      return this.node;
    }
    return this.parent?.parentNode;
  }

  public get firstNode(): ChildNode {
    return typeof this.type === "string"
      ? this.node
      : this.firstChild?.firstNode;
  }

  public get lastNode(): ChildNode {
    return typeof this.type === "string" ? this.node : this.lastChild?.lastNode;
  }

  public insertAfter(previouSibling: ActivationRecord, context: RenderTask) {
    const lastNode = this.lastNode;
    let curNode = this.firstNode;
    context.emit(() => {
      if (__DEBUG__) {
        // LOG(
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

  public remove(context: RenderTask) {
    const firstNode = this.firstNode;
    const lastNode = this.lastNode;
    context.emit(() => {
      if (__DEBUG__) {
        LOG("[[Commit]] remove", this.name + this.id, firstNode, lastNode);
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
