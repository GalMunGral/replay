import Heap from "heap";

var pendingTasks = new Heap((a, b) => a.initiator.depth - b.initiator.depth);
var currentTask = null;
var effects = [];

function request(task) {
  if (__DEBUG__) {
    const status = currentTask ? 'waiting:' : 'start:';
    console.debug('[[Schedule]]', status, task);
  }
  if (currentTask) {
    pendingTasks.push(task);
  } else {
    currentTask = task;
    window.requestIdleCallback(doWork);
  }
}

function doWork(deadline, input = null) {
  if (__DEBUG__) {
    console.debug('[[Schedule]] continue:', deadline.timeRemaining());
  }
  do {
    const { done, value } = currentTask.next(input);
    if (done) {
      if (__DEBUG__) {
        console.debug('[[Schedule]] ready to commit');
      }
      return window.requestAnimationFrame(commit);
    } else {
      if (value instanceof Promise) { // Async component
        return value.then(({ default: component }) => {
          window.requestIdleCallback((deadline) => doWork(deadline, component));
        });
      } else if (Array.isArray(value)) {
        effects.push(...value);
      } else {
        effects.push(value);
      }
    }
  } while (deadline.timeRemaining() > 5);
  window.requestIdleCallback(doWork);
}

function commit() {
  effects.forEach(f => f());
  effects = [];
  currentTask = null;
  
  if (__DEBUG__) {
    console.debug('[[Schedule]] committed');
    // debugger;
  }

  while (!pendingTasks.empty()) {
    const nextTask = pendingTasks.pop();
    if (!nextTask.canceled) {
      currentTask = nextTask;
      return window.requestIdleCallback(doWork);
    } else {
      if (__DEBUG__) {
        console.debug('[[Schedule]] canceled:', nextTask);
      }
    }
  }
}

export { request };
