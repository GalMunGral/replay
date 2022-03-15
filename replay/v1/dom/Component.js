import { isVoidElement, toKebabCase } from "@replay/common/Utilities";
import { getCursor } from "./Runner";

function isComposite(component) {
  return typeof component.__type__ === "function";
}

function getComponentName(component) {
  return isComposite(component) ? component.__type__.name : component.__type__;
}

function* DOMComponent(tag, nodeThunk) {
  var element;
  yield () => {
    element =
      nodeThunk && typeof nodeThunk == "function"
        ? nodeThunk()
        : document.createElement(tag);
  };
  const __cache__ = { style: {} };

  function* component(props) {
    for (let [name, value] of Object.entries(props)) {
      if (name === "style") {
        for (let [styleName, styleValue] of Object.entries(value)) {
          styleName = toKebabCase(styleName);
          if (styleValue !== __cache__.style[styleName]) {
            yield () => {
              element.style[styleName] = styleValue;
            };
            __cache__.style[styleName] = styleValue;
          }
        }
      } else {
        if (value !== __cache__[name]) {
          yield () => {
            element[name] = __cache__[name] = value;
          };
        }
      }
    }
  }
  yield () => {
    component.__$node__ = element;
    if (!nodeThunk && !isVoidElement(tag)) {
      component.__$node__.append(new Comment());
    }
    component.__$first_child__ = component.__$node__.firstChild;
  };

  return component;
}

function* mountComponent(component) {
  yield () => getCursor().after(component.__$node__);
}

function* moveComponent(component) {
  if (isComposite(component)) {
    yield () => {
      const prev = getCursor();
      let cur = component.__$first__;
      while (cur !== component.__$last__) {
        prev.after(cur);
        prev = prev.nextSibling;
        cur = cur.nextSibling;
      }
      prev.after(cur);
    };
  } else {
    yield () => {
      getCursor().after(component.__$node__);
    };
  }
}

function* unmountComponent(component) {
  if (isComposite(component)) {
    yield () => {
      let cur = component.__$first__;
      while (cur !== component.__$last__) {
        let next = cur.nextSibling;
        cur.remove();
        cur = next;
      }
      cur.remove();
    };
  } else {
    yield () => {
      component.__$node__.remove();
    };
  }
}

export {
  isComposite,
  getComponentName,
  DOMComponent,
  mountComponent,
  moveComponent,
  unmountComponent,
};
