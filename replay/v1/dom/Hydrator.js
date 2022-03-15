import { normalize, isGeneratorFunction } from "@replay/common/Utilities";
import { requestRender } from "./Scheduler";
import { DOMComponent, isComposite } from "./Component";
import { State, observe, setRenderingComponent } from "./Observer";
import { getCursor, setCursor, pushCursor, popCursor } from "./Runner";
import { handleEffects } from "./EffectHandler";

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
    component = yield* DOMComponent(type, () => getCursor().nextSibling);
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
  component.__memoized_props__ = props;
  component.__memoized_children__ = children;

  if (isComposite(component)) {
    component.__state__.notify("beforerender", {
      nextProps: props,
      nextChildren: children,
    });
    // Render
    let rendered;
    setRenderingComponent(component);
    if (isGeneratorFunction(component)) {
      rendered = yield* handleEffects(component(props, children));
    } else {
      rendered = component(props, children);
    }
    setRenderingComponent(null);

    yield () => pushCursor(getCursor());
    yield* instantiateChildren(component, rendered, context, depth);
    yield () => {
      component.__$last__ = getCursor();
      popCursor();
      component.__$first__ = getCursor().nextSibling;
      component.__state__.notify("mounted");
    };
  } else {
    // Render
    yield* component(props);

    if (!Array.isArray(children)) {
      yield () => {
        component.__$node__.textContent = String(children);
      };
      component.__cache__.isText = true;
    } else {
      yield () => pushCursor(component.__$first_child__);
      yield* instantiateChildren(component, children, context, children);
      yield () => popCursor();
    }
  }
}

function* instantiateChildren(component, elements, context, depth) {
  elements = elements.filter((e) => e).map(normalize);
  for (let element of elements) {
    const comp = yield* instantiateComponent(element, context, depth + 1);
    yield () => {
      setCursor(isComposite(comp) ? comp.__$last__ : comp.__$node__);
    };
    component.__cache__.push(comp);
  }
}

function hydrate(element, container, context) {
  console.debug("---HYDRATE---");
  element = normalize(element);
  requestRender(
    (function* renderTask() {
      const entryPoint = container.firstChild;
      yield () => setCursor(entryPoint);
      yield* instantiateComponent(element, context, 0);
    })()
  );
}

export { hydrate };
