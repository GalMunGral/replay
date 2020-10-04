import { OneTimeObservable, OneTimeObserver, observable } from "./Observable";
import { $$isHostRenderer, requestUpdate } from "./Renderer";

export interface RenderFunction extends Function {
  (props?: Arguments, scope?: DynamicScope): any;
  init?: (props: Arguments, scope: DynamicScope) => DynamicScope | void;
}

export interface Arguments {
  key?: string;
  children?: (() => any)[];
  [key: string]: any;
}

export interface DynamicScope extends Object {
  deinit?: () => void;
  [key: string]: any;
}

export class Record implements OneTimeObserver {
  public isHostRecord: boolean;
  public key: string;
  public renderFunction: RenderFunction;
  public scope = observable({}) as DynamicScope;
  public props: Arguments = {};
  public children = new Map<string, Record>();
  public depth: number;
  public node: ChildNode = null;
  public firstChild: Record = null;
  public lastChild: Record = null;
  public subscriptions = new Set<OneTimeObservable>();
  public invalidated = false;

  constructor(
    public type: string | RenderFunction,
    public parent: Record = null
  ) {
    this.isHostRecord = Boolean(
      typeof type == "string" || type[$$isHostRenderer]
    );
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
    }
  }

  public get firstHostRecord(): Record {
    return this.isHostRecord ? this : this.firstChild?.firstHostRecord;
  }

  public get lastHostRecord(): Record {
    return this.isHostRecord ? this : this.lastChild?.lastHostRecord;
  }

  public get childNodes(): ChildNode[] {
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
      requestUpdate(this);
    }
  }

  private unobserve(): void {
    this.subscriptions.forEach((data) => {
      data.observers.delete(this);
    });
    this.subscriptions.clear();
  }

  public destroy(): void {
    this.children.forEach((c) => c.destroy());
    if (!this.isHostRecord) {
      this.unobserve();
      if (
        // Check that it is not inherited
        this.scope.hasOwnProperty("deinit") &&
        typeof this.scope.deinit == "function"
      ) {
        this.scope.deinit();
      }
    }
    Object.keys(this).forEach((key) => (this[key] = null));
  }
}
