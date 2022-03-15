import {
  normalize,
  equals,
  isGeneratorFunction,
} from "@replay/common/Utilities";
import { requestRender } from "./Scheduler";
import { getCursor, setCursor, pushCursor, popCursor } from "./Runner";
import { State, observe, setRenderingComponent } from "./Observer";
import { handleEffects } from "./EffectHandler";
import {
  isComposite,
  DOMComponent,
  mountComponent,
  unmountComponent,
  moveComponent,
} from "./Component";

function* instantiateComponent(element, context, depth) {
  const [type, props, children] = element;
  let component;

  if (typeof type === "function") {
    const state = new State();
    context = Object.create(context, { component: { value: type } });
    if (isGeneratorFunction(type)) {
      component = yield* handleEffects(type(state, context));
    } else {
      component = type(state, context);
    }
    observe(component, state, context);
    component.__state__ = state;
    component.__subscriptions__ = [];
    component.__requests__ = [];
  } else {
    component = yield* DOMComponent(type);
    yield* mountComponent(component);
  }

  component.__type__ = type;
  component.__key__ = props.key;
  component.__context__ = context;
  component.__cache__ = [];
  component.__depth__ = depth;

  yield* renderComponent(component, props, children, context, depth);

  return component;
}

function* renderComponent(component, props, children, context, depth) {
  const isFirstRender =
    !component.__memoized_props__ && !component.__memoized_children__;

  if (
    equals(props, component.__memoized_props__) &&
    equals(children, component.__memoized_children__) &&
    !component.__dirty__
  ) {
    return;
  }

  component.__memoized_props__ = props;
  component.__memoized_children__ = children;
  component.__dirty__ = false;

  if (isComposite(component)) {
    component.__state__.notify(
      isFirstRender ? "beforerender" : "beforeupdate",
      {
        nextProps: props,
        nextChildren: children,
      }
    );
  }

  if (isComposite(component)) {
    setRenderingComponent(component);
    let rendered;
    if (isGeneratorFunction(component)) {
      rendered = yield* handleEffects(component(props, children)); // Render
    } else {
      rendered = component(props, children); // Render
    }
    setRenderingComponent(null);

    yield () => pushCursor(getCursor());
    yield* reconcileChildren(component, rendered, context, depth);
    yield () => {
      component.__$last__ = getCursor();
      popCursor();
      component.__$first__ = getCursor().nextSibling;
      component.__state__.notify(isFirstRender ? "mounted" : "updatecommited");
    };
  } else {
    yield* component(props); // Render

    if (!Array.isArray(children)) {
      for (let child of component.__cache__) {
        if (isComposite(child)) {
          child.__state__.notify("beforeunmount");
        }
        destroyComponent(child);
      }
      component.__cache__ = [];
      component.__cache__.isText = true;
      yield () => {
        component.__$node__.textContent = String(children);
      };
    } else {
      yield () => pushCursor(component.__$first_child__);
      yield* reconcileChildren(component, children, context, depth);
      yield () => popCursor();
    }
  }
}

function* reconcileChildren(component, elements, context, depth) {
  if (component.__cache__.length === 0 && component.__cache__.isText) {
    if (isComposite(component))
      throw "A composite component must not render to text!";
    yield () => {
      component.__$node__.innerHTML = "";
      component.__$node__.append(component.__$first_child__);
    };
  }

  elements = elements.filter((e) => e).map(normalize);
  const newChildren = [];
  const oldChildren = component.__cache__;

  const childMap = {};
  for (let [i, child] of oldChildren.entries()) {
    childMap[child.__key__] = i;
  }

  let lastIndex = -1;
  for (let element of elements) {
    const [type, props, children] = element;
    let comp;
    let j;
    if (
      (j = childMap[props.key]) !== undefined &&
      (comp = oldChildren[j]).__type__ === type
    ) {
      delete childMap[props.key];
      if (j < lastIndex) {
        yield* moveComponent(comp);
      } else {
        lastIndex = j;
      }
      // When re-rendering, the cursor is not necessarily the previous settled element.
      yield () => {
        setCursor(
          isComposite(comp)
            ? comp.__$first__.previousSibling
            : comp.__$node__.previousSibling
        );
      };
      yield* renderComponent(
        comp,
        props,
        children,
        comp.__context__,
        depth + 1
      );
    } else {
      comp = yield* instantiateComponent(element, context, depth + 1);
    }
    yield () => {
      setCursor(isComposite(comp) ? comp.__$last__ : comp.__$node__);
    };
    newChildren.push(comp);
  }
  for (let i of Object.values(childMap)) {
    destroyComponent(oldChildren[i]);
    yield* unmountComponent(oldChildren[i]);
  }
  component.__cache__ = newChildren;
  component.__cache__.isText = false;
}

function destroyComponent(component) {
  if (component.__DESTROYED__) throw "Already destroyed!";
  component.__DESTROYED__ = true;

  if (isComposite(component)) {
    component.__state__.notify("beforeunmount");
    component.__subscriptions__.forEach((subscription) => {
      subscription.cancel();
    });
    component.__requests__.forEach((task) => {
      task.canceled = true;
    });
  }
  for (let child of component.__cache__) {
    destroyComponent(child);
  }
}

function render(element, container, context) {
  element = normalize(element);
  container.innerHTML = "";
  container.append(new Comment());
  requestRender(
    (function* renderTask() {
      const entryPoint = container.firstChild;
      yield () => setCursor(entryPoint);
      yield* instantiateComponent(element, context, 0);
    })()
  );
}

function update(component) {
  const renderTask = (function* renderTask() {
    const entryPoint = component.__$first__.previousSibling;
    yield () => setCursor(entryPoint);
    yield* renderComponent(
      component,
      component.__memoized_props__,
      component.__memoized_children__,
      component.__context__,
      component.__depth__
    );
  })();

  renderTask.canceled = false;
  renderTask.sender = component;

  component.__requests__.push(renderTask);
  requestRender(renderTask);
}

export { render, update };
