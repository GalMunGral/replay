var nextId = 0;
var currentTask = null;
var pendingTasks = new Map(); // At most one task per record

export class Task {
  constructor(initiator, executorGenerator) {
    this.id = nextId++;
    this.initiator = initiator;
    this.executor = executorGenerator.call(this);
    this.cursor = null;
    this.stack = [];
    this.interruptible = false;
    this.canceled = false;
    this.effects = [];
    this.t = 0;
  }
  reset() {
    this.cursor = null;
    this.stack = [];
    this.interruptible = false;
    this.effects = [];
  }
}

export function schedule(task) {
  if (currentTask) {
    if (__DEBUG__) {
      console.debug(`[[Schedule]] ${task.initiator.type.name} (${(task.id)}) waiting...`, task);
      console.debug('[[Schedule]]', currentTask.interruptible);
      console.debug('[[Schedule]] pending:', [...pendingTasks.values()]);
    }
    pendingTasks.set(task.initiator, task);
  } else {
    if (__DEBUG__) {
      console.debug(`[[Schedule]] ${task.initiator.type.name} (${(task.id)}) starting...`, task);
    }
    currentTask = task;
    window.requestIdleCallback(doWork);
  }
}

export function unschedule(record) {
  pendingTasks.delete(record);
}

function poll() {
  if (pendingTasks.size == 0) return null;
  const sorted = [...pendingTasks.entries()].sort((a, b) => {
    return a[1].initiator.depth - b[1].initiator.depth;
  });
  const [record, task] = sorted[0];
  pendingTasks.delete(record);
  return task;
}

function doWork(deadline, input = null) {
  if (__DEBUG__) {
    console.debug(`[[Schedule]] ${currentTask.initiator.type.name} (${currentTask.id}) continue:`, deadline.timeRemaining());
  }
  do {
    const { done, value } = currentTask.executor.next(input);
    if (done) {
      if (__DEBUG__) {
        console.debug(`[[Schedule]] ${currentTask.initiator.type.name} (${currentTask.id}) ready to commit`);
      }
      return window.requestAnimationFrame(commit);
    } else {
      if (value.isAsync) { // Async component
        return value.resolve().then(({ default: component }) => {
          if (__DEBUG__) {
            // Simulate network delay
            setTimeout(() => {
              window.requestIdleCallback((deadline) => doWork(deadline, component));
            }, 5000);
          } else {
            window.requestIdleCallback((deadline) => doWork(deadline, component));
          }
        });
      } else if (Array.isArray(value)) {
        currentTask.effects.push(...value);
      } else {
        currentTask.effects.push(value);
      }
    }
  } while (deadline.timeRemaining() > 5);
  window.requestIdleCallback(doWork);
}

function commit() {
  currentTask.effects.forEach(f => f());
  if (__DEBUG__) {
    console.debug(`[[Schedule]] ${currentTask.initiator.type.name} (${currentTask.id}) committed`);
    // debugger;
  }
  currentTask.effects = [];
  if (currentTask = poll()) {
    console.log(currentTask);
    window.requestIdleCallback(doWork);
  }
}
