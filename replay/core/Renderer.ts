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

export const stats = {
  renderCount: 0,
  reuseCount: 0,
  birthCount: 0,
  deathCount: 0,
  maxDepth: 0,
  get reuseRate() {
    return this.reuseCount / this.renderCount;
  },
  get deathRate() {
    return this.deathCount / this.birthCount;
  },
};

function shallowEquals(a: any, b: any): boolean {
  if (typeof a != typeof b) return false;
  if (typeof a != "object" || a == null) return a == b;
  if (Object.keys(a).length != Object.keys(b).length) return false;
  for (let key of Object.keys(a)) {
    if (a[key] !== b[key]) return false;
  }
  return true;
}

function* init(
  element: Quasiquote,
  parent: ActivationRecord,
  context: RenderTask
) {
  let [type, props, children] = element;
  props.children = children;
  const record = new ActivationRecord(type, parent);

  // Resolve render functions
  record.renderFunction =
    typeof type == "string"
      ? getHostRenderFunction(type)
      : typeof type == "object"
      ? yield type
      : type;

  record.name = record.renderFunction.name;
  const init = record.renderFunction.init;
  if (typeof init == "function") {
    Object.assign(record.scope, init(props, record.scope, context));
  }
  return record;
}

function deinit(record: ActivationRecord, context: RenderTask): void {
  context.emit(() => record.removeNodes());
  record.deinitSubtree(context);
}

export function* evaluate(
  record: ActivationRecord,
  props: Arguments,
  context: RenderTask
): Generator<AsyncRenderFunction, void, RenderFunction> {
  props = props ?? record.props;
  if (shallowEquals(props, record.props) && !record.dirty) {
    context.emit(() => {
      record.children.forEach((child) => {
        child.parent = record;
      });
    });
  } else {
    const elements: string | Quasiquote[] = record.renderFunction.apply(
      record,
      [props, record.scope, context]
    );
    // Only Text and Comment nodes are allowed to have non-array children
    if (record.type === "text" || record.type === "comment") {
      context.emit(() => {
        (record.node as HTMLElement).textContent = elements as string;
      });
      return;
    }
    if (isHostType(record.type)) {
      context.stack.push(context.cursor);
      const dummy = new ActivationRecord("_");
      context.emit(() => {
        dummy.node = record.node.firstChild;
      });
      context.cursor = dummy;
    }

    yield* diff(record, elements as Quasiquote[], context);

    if (isHostType(record.type)) {
      context.cursor = context.stack.pop();
    }
    record.dirty = false;
    record.props = props;
  }
}

function* diff(
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
        const cursor = context.cursor;
        context.emit(() => record.insertAfter(cursor));
      } else {
        lastIndex = record.index;
      }
      yield* evaluate(record, props, context);
    } else {
      // Create a new record
      record = yield* init(element, parent, context);
      yield* evaluate(record, props, context);
      if (isHostType(type)) {
        const cursor = context.cursor;
        context.emit(() => record.insertAfter(cursor));
      }
    }
    if (index === 0) parent.firstChild = record;
    if (index === elements.length - 1) parent.lastChild = record;
    parent.children.set(key, record);
    record.key = key;
    record.index = index;
    context.cursor = record.lastHostRecord;
  }
  // Delete old records
  oldChildren.forEach((record) => {
    deinit(record, context);
  });
  oldChildren.clear();
}
