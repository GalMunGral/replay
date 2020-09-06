import Heap from "heap";

var nextId = 0;
var currentTask = null;
var pendingTasks = new Heap((a, b) => a.initiator.depth - b.initiator.depth);

export function Task(initiator, executorGenerator) {
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

export function schedule(task) {
  if (__DEBUG__) {
    const status = currentTask ? 'waiting:' : 'start:';
    console.debug(`[[Schedule]] ${task.initiator.type.name} (${(task.id)})`, status, task);
  }
  if (currentTask) {
    if (__DEBUG__) {
      console.debug('[[Concurrent]]', currentTask.interruptible);  
    }
    pendingTasks.push(task);
  } else {
    currentTask = task;
    window.requestIdleCallback(doWork);
  }
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
  currentTask.initiator.pendingRequests.delete(currentTask);
  currentTask = null;
  while (!pendingTasks.empty()) {
    const nextTask = pendingTasks.pop();
    if (!nextTask.canceled) {
      currentTask = nextTask;
      return window.requestIdleCallback(doWork);
    } else {
      if (__DEBUG__) {
        console.debug(`[[Schedule]] ${nextTask.initiator.type.name} (${nextTask.id}) canceled:`, nextTask);
      }
    }
  }
}
