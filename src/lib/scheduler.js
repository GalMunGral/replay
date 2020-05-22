import Heap from "heap";

var currentTask = null;
var effects = [];
var pendingTasks = new Heap(function priority(a, b) {
  return a.sender.depth - b.sender.depth;
});

function request(task) {
  // console.log("got request");
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
      return window.requestAnimationFrame(commit);
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
    // console.log(effect);
    effect();
  }
  effects = [];
  currentTask = null;
  // console.log(pendingTasks.length)

  while (!pendingTasks.empty()) {
    const next = pendingTasks.pop();
    // console.log(next);
    // console.log(
    //   pendingTasks.toArray().map((t) => [t.sender.type.name, t.canceled])
    // );
    if (next && !next.canceled) {
      currentTask = next;
      window.requestIdleCallback(doWork);
      break;
    }
  }
}

export { request };
