import {
  Quasiquote,
  ActivationRecord,
  Arguments,
  RenderFunction,
  AsyncRenderFunction,
  getHostRenderFunction,
  isHostType,
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

export function* update(
  record: ActivationRecord,
  props: Arguments,
  context: RenderTask
): Generator<AsyncRenderFunction, ChildNode[], RenderFunction> {
  props = props ?? record.props;

  if (shallowEquals(props, record.props) && !record.dirty) {
    context.emit(() => {
      record.children.forEach((child) => {
        child.parent = record;
      });
    });
    return isHostType(record.type) ? [record.node] : record.nodes;
  }

  let elements: string | Quasiquote[] = record.renderFunction.apply(record, [
    props,
    record.scope,
    context,
  ]);

  // Only Text and Comment nodes are allowed to have non-array children
  if (record.type === "text" || record.type === "comment") {
    context.emit(() => {
      (record.node as HTMLElement).textContent = elements as string;
    });
    return [record.node];
  }

  // The elements array must not be empty. There must be at least a placeholder
  // for the next component to attach itself to due to the way the current algorithm works
  if (elements.length == 0) {
    elements = [["comment", {}, "[slot]"]];
  }

  yield;

  let lastIndex = -1;
  let oldChildren = record.children;
  record.children = new Map();

  // if (isHostType(record.type)) {
  //   context.stack.push(context.cursor);
  //   const dummy = new ActivationRecord("_");
  //   context.emit(() => {
  //     dummy.node = record.node.firstChild;
  //   });
  //   context.cursor = dummy;
  // }

  // const original = context.effects;
  // context.effects = [];
  record.nodes = [];
  for (let [index, element] of (elements as Quasiquote[]).entries()) {
    if (!element) element = ["comment", {}, "[slot]"];
    if (!Array.isArray(element)) element = ["text", {}, String(element)];
    const [type, props, children] = element;
    const key = props.key ?? String(index);
    props.children = children;
    let child: ActivationRecord;

    if (oldChildren.has(key) && oldChildren.get(key).type === type) {
      // Reuse existing record
      child = oldChildren.get(key).clone(record, context);
      oldChildren.delete(key);
      if (child.index < lastIndex) {
        // const cursor = context.cursor;
        // context.emit(() => child.insertAfter(cursor));
      } else {
        lastIndex = child.index;
      }
      /***********************************/
      record.nodes.push(...(yield* update(child, props, context)));
      /***********************************/
    } else {
      // Create a new record
      child = new ActivationRecord(type, record);
      // Resolve render functions
      child.renderFunction =
        typeof type == "string"
          ? getHostRenderFunction(type)
          : typeof type == "object"
          ? yield type
          : type;
      child.name = child.renderFunction.name;
      const init = child.renderFunction.init;
      if (typeof init == "function") {
        Object.assign(child.scope, init(props, child.scope, context));
      }
      /***********************************/
      record.nodes.push(...(yield* update(child, props, context)));
      /***********************************/
      // if (isHostType(type)) {
      //   const cursor = context.cursor;
      //   context.emit(() => child.insertAfter(cursor));
      // }
    }
    if (index === 0) record.firstChild = child;
    if (index === elements.length - 1) record.lastChild = child;
    record.children.set(key, child);
    child.key = key;
    child.index = index;
    // context.cursor = child.lastHostRecord;
  }

  // const tail = context.effects;
  // context.effects = original;
  // Delete old records
  oldChildren.forEach((child) => {
    context.emit(() => child.removeNodes());
    child.deinitSubtree(context);
  });
  oldChildren.clear();

  // context.effects = context.effects.concat(tail);

  record.dirty = false;
  record.props = props;

  if (isHostType(record.type)) {
    // context.cursor = context.stack.pop();
    context.emit(() => {
      let cur = record.node.firstChild;
      record.nodes.forEach((n) => {
        // console.log(cur, n);
        if (n.previousSibling !== cur) {
          cur.after(n);
        }
        cur = n;
      });
    });
    return [record.node];
  } else {
    return record.nodes;
  }
}
