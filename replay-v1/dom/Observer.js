import { update } from "./Renderer";

var renderingComponent;
function setRenderingComponent(comp) {
  renderingComponent = comp;
}

window.getRenderingComponent = () => renderingComponent;

class State extends EventTarget {
  on(eventType, listener) {
    return this.addEventListener(eventType, (e) => {
      listener(e.detail);
    });
  }
  notify(eventType, detail) {
    return this.dispatchEvent(new CustomEvent(eventType, { detail }));
  }
}

var dirty = false;
var updateQueue = new Set();

function flushUpdateQueue() {
  for (let component of updateQueue) {
    update(component);
  }
  updateQueue.clear();
  dirty = false;
}

function observe(component, state, context) {
  observeState: {
    for (let [key, value] of Object.entries(state)) {
      const fieldName = `__${key}__`;
      state[fieldName] = value;
      Object.defineProperty(state, key, {
        get() {
          return state[fieldName];
        },
        set(newValue) {
          state[fieldName] = newValue;
          component.__dirty__ = true;
          updateQueue.add(component);
          if (!dirty) {
            dirty = true;
            window.queueMicrotask(flushUpdateQueue);
          }
        },
      });
    }
  }

  observeContext: {
    Object.getOwnPropertySymbols(context).forEach((key) => {
      let value = context[key];
      let stateChangeCounter = 0;
      const observers = new Set();

      Object.defineProperty(context, key, {
        get() {
          if (renderingComponent && !observers.has(renderingComponent)) {
            // IMPORTANT: MAKE A COPY OF THE COMPONENT BECAUSE `renderingComponent` changes
            const component = renderingComponent;
            observers.add(component);
            component.__subscriptions__.push({
              observers,
              context,
              key,
              cancel: () => {
                observers.delete(component);
              },
            });
          }
          return value;
        },
        set(newValue) {
          value = newValue;
          for (let observer of observers) {
            observer.__dirty__ = true;
            updateQueue.add(observer);
          }
          if (!dirty) {
            dirty = true;
            window.queueMicrotask(flushUpdateQueue);
          }
        },
      });
    });
  }

  // state.notify("init");
}

export { State, observe, setRenderingComponent };
