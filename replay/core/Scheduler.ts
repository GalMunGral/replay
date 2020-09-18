import {
  ActivationRecord,
  RenderFunction,
  AsyncRenderFunction,
} from "./Component";
import { update } from "./Renderer";

type Effect = () => void;

export interface Cancelable {
  cancel(): void;
}

export interface Context {
  emit(effect: Effect): void;
}

export class CancelableExecution implements Cancelable {
  private handle: number;
  constructor(cb: IdleCallback) {
    this.handle = window.requestIdleCallback(cb);
  }
  public cancel() {
    window.cancelIdleCallback(this.handle);
  }
}

export class CancelableEffect implements Cancelable {
  private handle: number;
  constructor(cb: FrameRequestCallback) {
    this.handle = window.requestAnimationFrame(cb);
  }
  public cancel() {
    window.cancelAnimationFrame(this.handle);
  }
}

export class CancelablePromise<T> implements Cancelable {
  private reject: (reason: any) => void;
  private promise: Promise<T>;

  // Cancellation can only happen before a promise is resolved or
  // after its resolution has been handled and fresh cancelable has been set.
  // This canceled bit is used for the unlikely edge case where a cancellation (part of a microtask, see below)
  // happens right between the resolution of the promise and the execution of its callbacks,
  // in which case the cancel token would have no effect, and the `onFulfilled` callback would be called.
  // Cancellation can be detected in this case by checking the canceled bit first and rejecting if its set.

  private canceled = false;

  constructor(promise: Promise<T>) {
    this.promise = Promise.race([
      promise,
      new Promise<T>((_, reject) => {
        this.reject = reject;
      }),
    ]);
  }

  public then(onFulfilled: (value: T) => any): Promise<unknown> {
    return this.promise.then((value: T) => {
      if (this.canceled) {
        return Promise.reject("CANCELED");
      }
      return onFulfilled(value);
    });
  }

  public cancel(): void {
    this.canceled = true;
    this.reject("CANCELED");
  }
}

export class RenderTask implements Context {
  static nextId = 0;
  public id = RenderTask.nextId++;
  public cursor: ActivationRecord;
  public stack: ActivationRecord[] = [];
  private executor: Generator<AsyncRenderFunction, void, RenderFunction>;
  public effects: Effect[] = [];

  constructor(public entry: ActivationRecord) {
    this.executor = (function* (context: RenderTask) {
      context.cursor = new ActivationRecord("_");
      context.cursor.node = entry.firstHostRecord.node.previousSibling;
      // console.log(context.cursor.node);
      const root = entry.clone(entry.parent, context);
      const nodes = yield* update(root, null, context);
      context.emit(() => {
        let cur = context.cursor.node;
        nodes.forEach((n) => {
          // console.log(cur, n);
          if (n.previousSibling !== cur) {
            cur.after(n);
          }
          cur = n;
        });
      });
      if (entry.parent) {
        const parent = entry.parent;
        const children = parent.children;
        context.emit(() => {
          children.set(entry.key, root);
          if (parent.firstChild === entry) {
            parent.firstChild = root;
          }
          if (parent.lastChild === entry) {
            parent.lastChild = root;
          }
        });
      }
    })(this);
  }

  public run(input?: RenderFunction) {
    return this.executor.next(input);
  }

  public emit(effect: Effect): void {
    this.effects.push(effect);
  }

  public commit(): void {
    this.effects.forEach((effect) => effect());
  }
}

export class Scheduler {
  static instance = new Scheduler();
  static context = {
    emit(effect: Effect): void {
      effect();
    },
  };

  private signaled = false;
  private currentTask: RenderTask = null;
  private continuation: Cancelable = null;
  // TODO CHECK
  private pendingUpdates = new Set<ActivationRecord>();

  private run(deadline: IdleDeadline, input?: RenderFunction) {
    do {
      const { done, value } = this.currentTask.run(input);
      if (done) {
        this.continuation = new CancelableEffect(() => {
          this.currentTask.commit();
          const entry = this.nextUpdate();
          if (entry) {
            this.currentTask = new RenderTask(entry);
            this.continuation = new CancelableExecution((deadline) =>
              this.run(deadline)
            );
          } else {
            this.currentTask = null;
            this.continuation = null;
          }
        });
        return;
      } else if (value && value.isAsync) {
        (this.continuation = new CancelablePromise(value.resolver()))
          .then(({ default: component }) => {
            this.continuation = new CancelableExecution((deadline) => {
              this.run(deadline, component);
            });
          })
          .catch((err) => {
            if (err === "CANCELED") {
              console.warn("CANCELED");
            } else {
              console.error(err);
            }
          });
        return;
      }
    } while (deadline.timeRemaining() > 5);
    this.continuation = new CancelableExecution((deadline) => {
      this.run(deadline);
    });
  }

  private nextUpdate(): ActivationRecord {
    const sorted = [...this.pendingUpdates.values()].sort(
      (a, b) => a.depth - b.depth
    );
    const entry = sorted.shift();
    this.pendingUpdates.delete(entry);
    return entry;
  }

  public requestUpdate(notified: Set<ActivationRecord>): void {
    notified.forEach((record) => {
      record.dirty = true;
      this.pendingUpdates.add(record);
    });
    if (!this.signaled) {
      this.signaled = true;
      queueMicrotask(() => {
        this.signaled = false;

        // Cancellation cannot happen during a macrotask because `this.continuation` (set by previous task)
        // *is* the current running task, which cannot be cancelled and will schedule a new task when it finishes.
        // Cancellation needs to wait for this *new* task to be scheduled, at which point `this.continuation` is actually cancellable.
        if (this.currentTask) {
          const entry = this.currentTask.entry;
          this.currentTask = null;
          this.continuation.cancel();
          this.pendingUpdates.add(entry);
        }

        const entry = this.nextUpdate();
        if (entry) {
          this.currentTask = new RenderTask(entry);
          this.continuation = new CancelableExecution((deadline) => {
            this.run(deadline);
          });
        }
      });
    }
  }

  public cancelUpdate(entry: ActivationRecord): void {
    this.pendingUpdates.delete(entry);
  }
}
