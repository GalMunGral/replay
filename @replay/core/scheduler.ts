import {
  Quasiquote,
  ActivationRecord,
  RenderFunction,
  AsyncRenderFunction,
} from "./component";
import { renderComponent } from "./renderer";

type Effect = () => void;

export interface Cancelable {
  cancel(): void;
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

  constructor(promise: Promise<T>) {
    this.promise = Promise.race([
      promise,
      new Promise<T>((_, reject) => {
        this.reject = reject;
      }),
    ]);
  }

  public then(
    onFulfilled: (value: T) => any,
    onRejected?: (reason: any) => any
  ): Promise<unknown> {
    return this.promise.then(onFulfilled, onRejected);
  }

  public cancel(): void {
    this.reject("CANCELED");
  }
}

export interface Context {
  emit(effect: Effect): void;
}

export class RenderTask implements Context {
  static nextId = 0;

  public id = RenderTask.nextId++;
  public cursor: ActivationRecord;
  public stack: ActivationRecord[] = [];
  private executor: Generator<AsyncRenderFunction, void, RenderFunction>;
  private effects: Effect[] = [];

  constructor(public entry: ActivationRecord) {
    this.executor = (function* (context: RenderTask) {
      context.cursor = new ActivationRecord("_");
      context.cursor.node = entry.firstNode.previousSibling;
      const root = entry.clone(entry.parent, context);
      yield* renderComponent(root, null, context);
      if (entry.parent) {
        const parent = entry.parent;
        const children = parent.children;
        children.get(entry.key)?.destruct(context);
        context.emit(() => {
          if (__DEBUG__) {
            LOG("[[Commit]] replace:", children.get(entry.key), "with:", root);
          }
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

class SchedulerContext implements Context {
  emit(effect: Effect): void {
    effect();
  }
}

export class Scheduler {
  static instance = new Scheduler();
  static context = new SchedulerContext();

  private signaled = false;
  private currentTask: RenderTask = null;
  private continuation: Cancelable = null;
  private pendingUpdates = new Set<ActivationRecord>();

  private run(deadline: IdleDeadline, input?: RenderFunction) {
    if (__DEBUG__) {
      const entry = this.currentTask.entry;
      const t = deadline.timeRemaining();
      LOG(`[[Schedule]] ${entry.name} (${entry.id}) CONTINUE`, t);
    }
    do {
      const { done, value } = this.currentTask.run(input);
      if (done) {
        if (__DEBUG__) {
          const entry = this.currentTask.entry;
          LOG(`[[Schedule]] ${entry.name} (${entry.id}) RENDER COMPLETE`);
        }
        this.continuation = new CancelableEffect(() => {
          if (__DEBUG__) {
            const entry = this.currentTask.entry;
            LOG(`[[Schedule]] ${entry.name} (${entry.id}) COMMIT`);
          }
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
        if (__DEBUG__) {
          const entry = this.currentTask.entry;
          LOG(`[[Schedule]] ${entry.name} (${entry.id}) LOADING ASYNC`);
        }
        (this.continuation = new CancelablePromise(value.resolver()))
          .then(({ default: component }) => {
            if (__DEBUG__) {
              const entry = this.currentTask.entry;
              LOG(
                `[[Schedule]] ${entry.name} (${entry.id}) (resolved)`,
                component.name
              );
            }
            this.continuation = new CancelableExecution((deadline) => {
              this.run(deadline, component);
            });
          })
          .catch((err) => console.log("[[TEST]]", err));
        return;
      }
    } while (deadline.timeRemaining() > 0);
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
    if (this.currentTask) {
      const entry = this.currentTask.entry;
      this.currentTask = null;
      this.continuation.cancel();
      this.pendingUpdates.add(entry);
      if (__DEBUG__) {
        LOG(`[[Schedule]] ${entry.name} (${entry.id}) CANCELED`);
      }
    }
    notified.forEach((record) => {
      record.dirty = true;
      this.pendingUpdates.add(record);
      if (__DEBUG__) {
        LOG(`[[Schedule]] ${record.name} (${record.id}) WAIT`);
      }
    });
    if (!this.signaled) {
      this.signaled = true;
      queueMicrotask(() => {
        this.signaled = false;
        const entry = this.nextUpdate();
        if (entry) {
          this.currentTask = new RenderTask(entry);
          this.continuation = new CancelableExecution((deadline) => {
            this.run(deadline);
          });
          if (__DEBUG__) {
            const entry = this.currentTask.entry;
            LOG(
              `[[Schedule]] ${entry.name} (${entry.id}) starting...`,
              this.currentTask
            );
          }
        }
      });
    }
  }
  public cancelUpdate(entry: ActivationRecord): void {
    this.pendingUpdates.delete(entry);
  }
}
