import {
  ActivationRecord,
  ActivationRecordType,
  AsyncRenderFunction,
} from "./component";
import { renderComponent } from "./renderer";

type Executor = Generator<AsyncRenderFunction, void, ActivationRecordType>;

export interface Cancelable {
  cancel(): void;
}

export class CancelableExecution implements Cancelable {
  private handle: number;
  constructor(fn: Function) {
    this.handle = window.requestIdleCallback(fn);
  }
  public cancel() {
    window.cancelIdleCallback(this.handle);
  }
}

export class CancelableEffect implements Cancelable {
  private handle: number;
  constructor(fn: FrameRequestCallback) {
    this.handle = window.requestAnimationFrame(fn);
  }
  public cancel() {
    window.cancelAnimationFrame(this.handle);
  }
}

export class CancelablePromise implements Cancelable {
  private reject: Function;
  private promise: Promise<any>;
  constructor(promise: Promise<any>) {
    this.promise = Promise.race([
      promise,
      new Promise((_, reject) => {
        this.reject = reject;
      }),
    ]);
  }
  public then(
    onFulfilled: (value: any) => any,
    onRejected: (value: any) => any
  ) {
    return this.promise.then(onFulfilled, onRejected);
  }
  public cancel() {
    this.reject("CANCELED");
  }
}

export interface Context {
  emit(effect: Function): void;
}

class SchedulerContext implements Context {
  emit(effect: Function): void {
    effect();
  }
}

export class RenderTask implements Context {
  static nextId = 0;
  public id = RenderTask.nextId++;
  private execution: Executor;
  private cursor: ActivationRecord;
  private stack: ActivationRecord[] = [];
  private effects: Function[] = [];

  constructor(public entry: ActivationRecord) {
    this.execution = (function* (context) {
      context.cursor = new ActivationRecord("anchor");
      context.cursor.node = entry.firstNode.previousSibling;
      const root = entry.clone(entry.parent, context);
      yield* renderComponent(root, null, context);
      if (entry.parent) {
        const parent = entry.parent;
        const children = parent.children;
        children.get(entry.key)?.destruct(context);
        context.emit(() => {
          if (__DEBUG__) {
            console.debug(
              "[[Commit]] replace:",
              children.get(entry.key),
              "with:",
              root
            );
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
  public run(input: any) {
    return this.execution.next(input);
  }
  public advance(record: ActivationRecord) {
    this.cursor = record;
  }
  public enter(record: ActivationRecord) {
    this.stack; // TODO
  }
  public emit(effect: Function) {
    this.effects.push(effect);
  }
  public commit(): void {
    this.effects.forEach((f: Function) => f());
  }
}

export class Scheduler {
  static instance = new Scheduler();
  static context: SchedulerContext = {
    emit(effect) {
      effect();
    },
  };

  private signaled = false;
  private currentTask: RenderTask;
  private continuation: Cancelable;
  private pendingUpdates = new Set<ActivationRecord>();

  private run(deadline: any, input: ActivationRecordType = null) {
    if (__DEBUG__) {
      const entry = this.currentTask.entry;
      console.debug(
        `[[Schedule]] ${entry.name} (${entry.id}) CONTINUE`,
        deadline.timeRemaining()
      );
    }
    do {
      const { done, value } = this.currentTask.run(input);
      if (done) {
        if (__DEBUG__) {
          const entry = this.currentTask.entry;
          console.debug(
            `[[Schedule]] ${entry.name} (${entry.id}) RENDER COMPLETE`
          );
        }
        this.continuation = new CancelableEffect(() => {
          if (__DEBUG__) {
            const entry = this.currentTask.entry;
            console.debug(`[[Schedule]] ${entry.name} (${entry.id}) COMMIT`);
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
          console.debug(
            `[[Schedule]] ${entry.name} (${entry.id}) LOADING ASYNC`
          );
        }
        (this.continuation = new CancelablePromise(value.resolver())).then(
          ({ default: component }) => {
            if (__DEBUG__) {
              const entry = this.currentTask.entry;
              console.debug(
                `[[Schedule]] ${entry.name} (${entry.id}) (resolved)`,
                component.name
              );
            }
            this.continuation = new CancelableExecution((deadline) => {
              this.run(deadline, component);
            });
          },
          (err) => {
            console.log("HEY", err);
          }
        );
        return;
      }
    } while (deadline.timeRemaining() > 5);
    this.continuation = new CancelableExecution((deadline) => {
      this.run(deadline);
    });
  }

  private nextUpdate() {
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
        console.debug(`[[Schedule]] ${entry.name} (${entry.id}) CANCELED`);
        globalThis.inspect();
      }
    }
    notified.forEach((record) => {
      record.dirty = true;
      this.pendingUpdates.add(record);
      if (__DEBUG__) {
        console.debug(`[[Schedule]] ${record.name} (${record.id}) WAIT`);
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
            console.debug(
              `[[Schedule]] ${entry.name} (${entry.id}) starting...`,
              this.currentTask
            );
          }
        }
      });
    }
  }
  public cancelUpdate(entry) {
    this.pendingUpdates.delete(entry);
  }
}

export function render(elements, container: HTMLElement) {
  container.before(new Text());
  const entry = new ActivationRecord(container.tagName, null, {
    children: elements,
  });
  entry.node = container;
  entry.dirty = true;
  Scheduler.instance.requestUpdate(new Set([entry]));
  globalThis.entry = entry;
}
