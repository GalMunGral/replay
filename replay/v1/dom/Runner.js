var cursor = null;
var stack = [];
var pendingOperations = [];

function getCursor() {
  return cursor;
}

function setCursor(node) {
  cursor = node;
}

function pushCursor(node) {
  stack.push(cursor);
  cursor = node;
}

function popCursor() {
  cursor = stack.pop();
}

function schedule(operation) {
  pendingOperations.push(operation);
}

function commit() {
  pendingOperations.forEach((operation) => {
    operation();
  });
  pendingOperations = [];
}

export { getCursor, setCursor, pushCursor, popCursor, schedule, commit };
