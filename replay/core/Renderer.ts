import {
  Quasiquote,
  ActivationRecord,
  Arguments,
  RenderFunction,
  AsyncRenderFunction,
  DynamicScope,
} from "./Component";
import { RenderTask } from "./Scheduler";

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

export function* evaluate(
  record: ActivationRecord,
  props: Arguments,
  context: RenderTask
): Generator<AsyncRenderFunction, void, RenderFunction> {
  props = props ?? record.props;
  if (shallowEquals(props, record.props) && !record.dirty) {
    if (__DEBUG__) {
      // LOG(`[[Render]] ${record.name} early exit`);
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
  } else {
    // Clear dirty bit *before* rather than *after* rendering,
    // so if further updates occur while rendering is in process, the dirty bit doesn't get cleared mistakenly.
    // record.dirty = false;
    if (typeof record.type === "string") {
      yield* render(record, props, context);
    } else {
      yield* expand(record, props, context);
    }
    record.dirty = false;
    record.props = props;
  }
}

function* expand(
  record: ActivationRecord,
  props: Arguments,
  context: RenderTask
) {
  const type = record.type as RenderFunction | AsyncRenderFunction;
  const scope = record.scope;
  const fn: RenderFunction = typeof type == "object" ? yield type : type;
  record.name = fn.name;
  const elements = fn.call(record, props, scope, context);
  yield* enter(record, elements, context);
}

function* render(
  record: ActivationRecord,
  props: Arguments,
  context: RenderTask
) {
  const memoized = record.props;
  for (let [name, value] of Object.entries(props)) {
    if (name == "children") continue;
    if (name == "style") {
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
  } else {
    // Only `text` and `comment` are allowed to have non-array children
    // Convert `p('hello')` to  `p([ text('hello') ])`
    // if (!Array.isArray(props.children)) {
    //   props.children = [["text", {}, props.children]];
    // }
    context.stack.push(context.cursor);
    const dummy = new ActivationRecord("_");
    context.emit(() => {
      dummy.node = record.node.firstChild;
    });
    context.cursor = dummy;
    yield* enter(record, props.children as Quasiquote[], context);
    context.cursor = context.stack.pop();
  }
}

function* enter(
  parent: ActivationRecord,
  elements: Quasiquote[],
  context: RenderTask
) {
  yield;
  let lastIndex = -1;
  let oldChildren = parent.children;
  parent.children = new Map();

  // The elements array must not be empty. There must be at least a placeholder
  // for the next component to attach itself to due to the way the current algorithm works
  if (elements.length == 0) {
    elements = [["comment", {}, "[slot]"]];
  }

  for (let [index, element] of elements.entries()) {
    if (!element) element = ["comment", {}, "[slot]"];
    if (!Array.isArray(element)) element = ["text", {}, String(element)];
    const [type, props, children] = element;
    const key = props.key ?? String(index);
    props.children = children;
    let record: ActivationRecord;
    if (oldChildren.has(key) && oldChildren.get(key).type === type) {
      // Reuse existing record
      record = oldChildren.get(key).clone(parent, context);
      oldChildren.delete(key);
      if (record.index < lastIndex) {
        const prev = context.cursor;
        context.emit(() => record.insertAfter(prev));
      } else {
        lastIndex = record.index;
      }
      yield* evaluate(record, props, context);
    } else {
      // Create a new record
      record = yield* initialize(element, parent, context);
    }
    if (index === 0) parent.firstChild = record;
    if (index === elements.length - 1) parent.lastChild = record;
    parent.children.set(key, record);
    record.key = key;
    record.index = index;
    context.cursor = record;
  }
  oldChildren.forEach((record) => {
    deinitialize(record, context);
  });
  oldChildren.clear();
}

function* initialize(
  element: Quasiquote,
  parent: ActivationRecord,
  context: RenderTask
) {
  let [type, props, children] = element;
  const record = new ActivationRecord(type, parent);
  props.children = children;
  if (typeof type == "string") {
    // DOM Component
    switch (type) {
      case "text":
        context.emit(() => (record.node = new Text()));
        break;
      case "comment":
        context.emit(() => (record.node = new Comment()));
        break;
      default:
        context.emit(() => {
          record.node = document.createElement(type as string);
          (record.node as Element).append(new Text()); // dummy node
        });
    }
    yield* evaluate(record, props, context);
    const prev = context.cursor;
    context.emit(() => record.insertAfter(prev));
  } else {
    // Functional Component
    const fn: RenderFunction = typeof type == "object" ? yield type : type;

    if (fn.init) {
      Object.assign(record.scope, fn.init(props, record.scope, context));
    }
    yield* evaluate(record, props, context);
  }
  return record;
}

function deinitialize(record: ActivationRecord, context: RenderTask): void {
  if (__DEBUG__) {
    LOG(
      "[[Render]] unmount:",
      record.name + record.id,
      record.firstNode,
      record.lastNode
    );
  }
  context.emit(() => record.removeNodes());
  record.destructSubtree(context);
}
