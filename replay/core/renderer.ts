import {
  Quasiquote,
  ActivationRecord,
  Arguments,
  RenderFunction,
  AsyncRenderFunction,
} from "./component";
import { RenderTask } from "./scheduler";

function shallowEquals(a: any, b: any): boolean {
  if (typeof a != typeof b) return false;
  if (typeof a != "object" || a == null) return a == b;
  if (Object.keys(a).length != Object.keys(b).length) return false;
  for (let key of Object.keys(a)) {
    if (a[key] !== b[key]) return false;
  }
  return true;
}

function toKebabCase(s: string): string {
  return s.replace(/[A-Z]/g, (c) => "-" + c.toLowerCase());
}

export function* renderComponent(
  record: ActivationRecord,
  props: Arguments,
  context: RenderTask
): Generator<AsyncRenderFunction, void, RenderFunction> {
  props = props ?? record.props;
  if (shallowEquals(props, record.props) && !record.dirty) {
    if (__DEBUG__) {
      LOG("[[Render]] early exit");
    }
    context.emit(() => {
      record.children.forEach((child) => {
        if (__DEBUG__) {
          const oldParent = child.parent.name + child.parent.id;
          const newParent = record.name + record.id;
          LOG(`[[Commit]] HANDOVER: ${oldParent} => ${newParent}`);
        }
        child.parent = record;
      });
    });
    return;
  }
  // Clear dirty bit *before* rather than *after* rendering,
  // so if further updates occur while rendering is in process, the dirty bit doesn't get cleared mistakenly.
  record.dirty = false;
  if (typeof record.type === "string") {
    yield* renderDOMComponent(record, props, context);
  } else {
    yield* renderCompositeComponent(record, props, context);
  }
  record.props = props;
}

function* renderCompositeComponent(
  record: ActivationRecord,
  props: Arguments,
  context: RenderTask
) {
  const { type: render, scope } = record;
  const elements = (render as RenderFunction).call(
    record,
    props,
    scope,
    context
  );
  yield;
  yield* reconcileChildren(record, elements, context);
}

function* renderDOMComponent(
  record: ActivationRecord,
  props: Arguments,
  context: RenderTask
) {
  const memoized = record.props;
  for (let [name, value] of Object.entries(props)) {
    if (name === "children") continue;
    if (name === "style") {
      for (let [k, v] of Object.entries(value)) {
        k = toKebabCase(k);
        if (!memoized.style || memoized.style[k] !== v) {
          context.emit(() => {
            (record.node as HTMLElement).style[k] = v;
          });
        }
      }
    } else {
      // Other DOM properties
      if (value !== memoized[name]) {
        context.emit(() => {
          record.node[name] = value;
        });
      }
    }
  }
  if (record.type === "text" || record.type === "comment") {
    context.emit(() => {
      (record.node as HTMLElement).textContent = String(props.children);
    });
    return;
  }
  // Only `text` and `comment` are allowed to have non-array children
  // Convert `p('hello')` to  `p([ text('hello') ])`
  if (!Array.isArray(props.children)) {
    props.children = [["text", {}, props.children]];
  }

  yield;

  context.stack.push(context.cursor);
  context.cursor = new ActivationRecord("_");
  context.cursor.node = record.node.firstChild;
  yield* reconcileChildren(record, props.children, context);
  context.cursor = context.stack.pop();
}

function* reconcileChildren(
  parent: ActivationRecord,
  elements: Quasiquote[],
  context: RenderTask
) {
  let lastIndex = -1;
  let oldChildren = parent.children;
  parent.children = new Map();
  for (let [index, element] of elements.entries()) {
    element = element || ["comment", {}, "[slot]"];
    const [type, props, children] = element;
    const key = props.key ?? String(index);
    props.children = children;
    let record: ActivationRecord;
    if (oldChildren.has(key) && oldChildren.get(key).type === type) {
      // Reuse existing record
      record = oldChildren.get(key).clone(parent, context);
      oldChildren.delete(key);
      if (record.index < lastIndex) {
        record.insertAfter(context.cursor, context);
      } else {
        lastIndex = record.index;
      }
      yield* renderComponent(record, props, context);
    } else {
      // Create a new record
      record = yield* mountComponent(element, parent, context);
    }
    if (index === 0) parent.firstChild = record;
    if (index === elements.length - 1) parent.lastChild = record;
    parent.children.set(key, record);
    record.key = key;
    record.index = index;
    context.cursor = record;
  }
  oldChildren.forEach((record) => {
    unmountComponent(record, context);
  });
  oldChildren.clear();
}

function* mountComponent(
  element: Quasiquote,
  parent: ActivationRecord,
  context: RenderTask
) {
  let [type, props, children] = element;
  props.children = children;
  if (typeof type == "object" && type.isAsync) {
    if (__DEBUG__) {
      LOG("[[Resolve]] (async component)");
    }
    type = (yield type) as RenderFunction;
    if (__DEBUG__) {
      LOG("[[Resolve]] loaded:", type.name);
    }
  }
  const record = new ActivationRecord(type as string | RenderFunction, parent);
  if (typeof type == "string") {
    switch (type) {
      case "text":
        record.node = new Text();
        break;
      case "comment":
        record.node = new Comment();
        break;
      default:
        record.node = document.createElement(type);
        (record.node as Element).append(new Text()); // dummy node
    }
    yield* renderComponent(record, props, context);
    record.insertAfter(context.cursor, context);
  } else {
    yield* renderComponent(record, props, context);
  }
  return record;
}

function unmountComponent(record: ActivationRecord, context: RenderTask): void {
  if (__DEBUG__) {
    LOG(
      "[[Render]] unmount:",
      record.name + record.id,
      record.firstNode,
      record.lastNode
    );
  }
  record.remove(context);
  record.destruct(context);
}
