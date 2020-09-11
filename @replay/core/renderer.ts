import { ActivationRecord } from "./component";
import { Observable } from "./observable";

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

function isGeneratorFunction(obj: Object): boolean {
  const constructor = obj.constructor;
  return constructor && constructor.name === "GeneratorFunction";
}

function* mountComponent(element, parent, context) {
  let [type, props, children] = element;
  props.children = children;
  if (type.isAsync) {
    if (__DEBUG__) {
      context.t = performance.now();
      console.debug("[[Resolve]] (async component)");
    }
    // Mark as interruptible
    context.interruptible = true;
    type = yield type;
    context.interruptible = false;
    if (__DEBUG__) {
      const t = performance.now() - context.t;
      context.t = 0;
      console.debug("[[Resolve]] loaded:", type.name, t);
    }
  }
  const record = new ActivationRecord(type, parent);
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

function unmountComponent(record, context) {
  if (__DEBUG__) {
    console.debug(
      "[[Render]] unmount:",
      record.name + record.id,
      record.firstNode,
      record.lastNode
    );
  }
  record.remove(context);
  record.destruct(context);
}

export function* renderComponent(record, props, context) {
  if (!props) props = record.props;
  if (shallowEquals(props, record.props) && !record.dirty) {
    if (__DEBUG__) {
      // console.debug("[[Render]] early exit");
    }
    context.emit(() => {
      record.children.forEach((c) => {
        if (__DEBUG__) {
          console.debug(
            `[[Commit]] handover: ${c.parent.name + c.parent.id} => ${
              record.name + record.id
            }`
          );
        }
        c.parent = record;
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

function* renderCompositeComponent(record, props, context) {
  const { type, scope } = record;
  if (__DEBUG__) {
    if (type.name !== "StyleWrapper") {
      // console.debug("[[Render]]", type.name, props);
    }
  }
  let elements;
  Observable.setCurrent(record, context);
  if (isGeneratorFunction(type)) {
    elements = yield* type(props, scope, context);
  } else {
    elements = type(props, scope, context);
  }
  Observable.setCurrent(null, null);
  yield;

  yield* reconcileChildren(record, elements, context);
}

function* renderDOMComponent(record, props, context) {
  const memoized = record.props;
  for (let [name, value] of Object.entries(props)) {
    if (name === "children") continue;
    if (name === "style") {
      for (let [k, v] of Object.entries(value)) {
        k = toKebabCase(k);
        if (!memoized.style || memoized.style[k] !== v) {
          context.emit(() => {
            record.node.style[k] = v;
          });
        }
      }
    } else {
      if (value !== memoized[name]) {
        context.emit(() => {
          record.node[name] = value;
        });
      }
    }
  }
  if (record.type === "text" || record.type === "comment") {
    context.emit(() => {
      record.node.textContent = props.children;
    });
    return;
  }
  if (!Array.isArray(props.children)) {
    props.children = [["text", {}, props.children]]; // p('hello') -> p([ text('hello') ])
  }
  context.stack.push(context.cursor);
  context.cursor = new ActivationRecord("level-anchor");
  context.cursor.node = record.node.firstChild;

  yield;

  yield* reconcileChildren(record, props.children, context);
  context.cursor = context.stack.pop();
}

function* reconcileChildren(parent, elements, context) {
  let lastIndex = -1;
  let oldChildren = parent.children;
  parent.children = new Map();
  for (let [index, element] of elements.entries()) {
    element = element || ["comment", {}, "[slot]"];
    const [type, props, children] = element;
    const key = props.key ?? index;
    props.children = children;
    let record;
    if (oldChildren.has(key) && oldChildren.get(key).type === type) {
      // Reuse existing record
      record = oldChildren.get(key).clone(parent, context);
      oldChildren.delete(key);
      if (record.index < lastIndex) {
        record.insertAfter(context.cursor);
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
