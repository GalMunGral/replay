import Heap from "heap";

var pendingTasks = new Heap((a, b) => a.sender.depth - b.sender.depth);
var currentTask = null;
var effects = [];

function request(task) {
  if (currentTask) {
    pendingTasks.push(task);
  } else {
    currentTask = task;
    window.requestIdleCallback(doWork);
  }
}

function doWork(deadline) {
  while (deadline.timeRemaining() > 10) {
    const { done, value } = currentTask.next();
    if (done) {
      window.requestAnimationFrame(commit);
      return;
    } else {
      if (Array.isArray(value)) {
        effects.push(...value);
      } else {
        effects.push(value);
      }
    }
  }
  window.requestIdleCallback(doWork);
}

function commit() {
  for (let effect of effects) {
    effect();
  }
  effects = [];
  currentTask = null;

  while (!pendingTasks.empty()) {
    const next = pendingTasks.pop();
    if (!next.canceled) {
      currentTask = next;
      window.requestIdleCallback(doWork);
      return;
    }
  }
}

export { request };
