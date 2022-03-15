import Heap from "heap";
import { schedule, commit } from "./Runner";

var currentTask = null;
var pendingTasks = new Heap(function priority(a, b) {
  return a.sender.__depth__ - b.sender.__depth__;
});

function requestRender(renderTask) {
  if (currentTask) {
    pendingTasks.push(renderTask);
  } else {
    currentTask = renderTask;
    window.requestIdleCallback(doWork);
  }
}

function doWork(deadline) {
  try {
    while (deadline.timeRemaining() > 5) {
      const { done, value: effect } = currentTask.next();
      if (done) {
        return window.requestAnimationFrame(commitUpdate);
      } else {
        // value(); // Synchronous mode
        schedule(effect); // Asynchronous mode
      }
    }
    window.requestIdleCallback(doWork);
  } catch (e) {
    console.log(e.stack);
  }
}

function commitUpdate() {
  commit();
  currentTask = null;

  // Find next task that is not canceled
  while (!pendingTasks.empty()) {
    const next = pendingTasks.pop();
    if (
      next &&
      !next.canceled &&
      next.sender.__$first__ &&
      next.sender.__$first__.isConnected // Make sure the component has not been unmounted
    ) {
      currentTask = next;
      window.requestIdleCallback(doWork);
      break;
    }
  }
}

export { requestRender };
