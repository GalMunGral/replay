/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "/build";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = "./src/index.js");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./src/components/App.js":
/*!*******************************!*\
  !*** ./src/components/App.js ***!
  \*******************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
// import useStoreAsync from "../hooks/store";
// import useSelection from "../hooks/selection";
// import usePagination from "../hooks/pagination";
// import useEditor from "../hooks/editor";
// import useRoute from "../hooks/route";
// import AppBar from "./AppBar";
// import Mailbox from "./Mailbox";
// import Sidebar from "./Sidebar";
// import Editor from "./Editor";
// import Detail from "./Detail";
// import { Container } from "./AppComponents";
// const App = (state, context) => {
//   context.store = useStoreAsync(context);
//   context.editor = useEditor(context, context.store);
//   context.route = useRoute(context);
//   context.selection = useSelection(context);
//   context.pagination = usePagination(context, 50, {
//     store: context.store,
//     route: context.route,
//     selection: context.selection,
//   });
//   state.collapsed = false;
//   return () => {
//     const mailId = context.route.getMailId();
//     const editing = context.editor.getEditing();
//     return (
//       // use-transform
//       // prettier-ignore
//       Container([
//         AppBar(toggle=() => { state.collapsed = !state.collapsed }),
//         Sidebar(
//           collapsed=state.collapsed,
//           setCollapse=(v) => state.setCollapse(v)
//         ),
//         mailId ? Detail(mailId=mailId) : Mailbox(),
//         editing ? Editor() : null,
//       ])
//     );
//   };
// };
// export default App;
/* harmony default export */ __webpack_exports__["default"] = ((props, state, setState) => // use-transform
[["p", {}, ["text", {}, "hello word!"]]]);

/***/ }),

/***/ "./src/index.js":
/*!**********************!*\
  !*** ./src/index.js ***!
  \**********************/
/*! no exports provided */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var lib__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! lib */ "./src/lib/index.js");
/* harmony import */ var _components_App__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./components/App */ "./src/components/App.js");


const f = true ? lib__WEBPACK_IMPORTED_MODULE_0__["render"] : undefined;
f([_components_App__WEBPACK_IMPORTED_MODULE_1__["default"]], document.querySelector("#app"), {});

/***/ }),

/***/ "./src/lib/index.js":
/*!**************************!*\
  !*** ./src/lib/index.js ***!
  \**************************/
/*! exports provided: render */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _renderer__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./renderer */ "./src/lib/renderer.js");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "render", function() { return _renderer__WEBPACK_IMPORTED_MODULE_0__["render"]; });



/***/ }),

/***/ "./src/lib/instance.js":
/*!*****************************!*\
  !*** ./src/lib/instance.js ***!
  \*****************************/
/*! exports provided: createInstance, getFirstNode, getLastNode, getParentNode, insertAfter, appendChild */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "createInstance", function() { return createInstance; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "getFirstNode", function() { return getFirstNode; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "getLastNode", function() { return getLastNode; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "getParentNode", function() { return getParentNode; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "insertAfter", function() { return insertAfter; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "appendChild", function() { return appendChild; });
function createInstance(type, parent) {
  return {
    type,
    props: {},
    state: {},
    children: {},
    firstChild: null,
    lastChild: null,
    node: null,
    parent,
    index: -1
  };
}

function getFirstNode(instance) {
  if (typeof instance.type === "string") {
    return instance.node;
  }

  return getFirstNode(instance.firstChild);
}

function getLastNode(instance) {
  if (typeof instance.type === "string") {
    return instance.node;
  }

  return getLastNode(instance.lastChild);
}

function getParentNode(instance) {
  if (typeof instance.type === "string") {
    return instance.node;
  }

  return getParentNode(instance.parent);
}

function insertAfter(previouSibling, instance) {
  const lastNode = getLastNode(instance);
  let curNode = getFirstNode(instance);
  let prevNode = getLastNode(previouSibling);

  while (curNode !== lastNode) {
    prevNode.after(curNode);
    prevNode = curNode;
    curNode = curNode.nextSibling;
  }

  prevNode.after(curNode);
}

function appendChild(parent, instance) {
  const parentNode = getParentNode(parent);
  parentNode.append(instance.node);
}



/***/ }),

/***/ "./src/lib/renderer.js":
/*!*****************************!*\
  !*** ./src/lib/renderer.js ***!
  \*****************************/
/*! exports provided: render */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "render", function() { return render; });
/* harmony import */ var _instance__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./instance */ "./src/lib/instance.js");
/* harmony import */ var _scheduler__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./scheduler */ "./src/lib/scheduler.js");
/* harmony import */ var _util__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./util */ "./src/lib/util.js");




function setState(update) {
  this.state = { ...this.state,
    ...update
  };
  Object(_scheduler__WEBPACK_IMPORTED_MODULE_1__["request"])(renderComponent(this, this.props));
}

function* renderComponent(instance, props) {
  // if (equals(props, instance.props)) return;
  if (typeof instance.type === "string") {
    yield* renderDOMComponent(instance, props);
  } else {
    yield* renderCompositeComponent(instance, props);
  }

  instance.props = props;
}

function* renderCompositeComponent(instance, props) {
  const {
    type,
    state
  } = instance;
  const elements = type(props, state, setState.bind(instance));
  yield* reconcileChilren(instance, elements);
}

function* renderDOMComponent(instance, props) {
  const effects = [];
  const memoized = instance.props;

  for (let [name, value] of Object.entries(props)) {
    if (name === "children") continue;

    if (name === "style") {
      for (let [k, v] of Object.entries(value)) {
        k = Object(_util__WEBPACK_IMPORTED_MODULE_2__["toKebabCase"])(k);

        if (!memoized.style || memoized.style[k] !== v) {
          effects.push(() => {
            instance.node.style[k] = v;
          });
        }
      }
    } else {
      if (value !== memoized[name]) {
        effects.push(() => {
          instance.node[name] = value;
        });
      }
    }
  }

  yield effects;

  if (instance.type === "text") {
    yield () => {
      instance.node.textContent = props.children;
    };
  } else {
    yield* reconcileChilren(instance, props.children);
  }
}

function* reconcileChilren(instance, elements) {
  const newChildren = {};
  const oldChildren = instance.children;
  let firstChild, lastChild, prevChild;
  let lastIndex = -1;

  for (let [index, element] of elements.entries()) {
    const [type, props, children] = element;
    const key = props.key != null ? props.key : index;
    let child;

    if (oldChildren.hasOwnProperty(key) && oldChildren[key].type === type) {
      child = oldChildren[key];
      delete oldChildren[key];

      if (child.index < lastIndex) {
        const _prevChild = prevChild;
        const _child = child;
        yield () => {
          Object(_instance__WEBPACK_IMPORTED_MODULE_0__["insertAfter"])(_prevChild, _child);
        };
      } else {
        lastIndex = child.index;
      }

      props.children = children;
      yield* renderComponent(child, props);
    } else {
      child = yield* mountComponent(element, instance, prevChild);
    }

    child.index = index;
    newChildren[key] = child;
    if (!firstChild) firstChild = child;
    lastChild = prevChild = child;
  }

  for (let child of Object.values(oldChildren)) {
    yield* unmountComponent(child);
  }

  instance.children = newChildren;
  instance.firstChild = firstChild;
  instance.lastChild = lastChild;
}

function* mountComponent(element, parent, previousSibling) {
  const [type, props, children] = element;
  props.children = children;
  const instance = Object(_instance__WEBPACK_IMPORTED_MODULE_0__["createInstance"])(type, parent);

  if (typeof type === "string") {
    yield () => {
      instance.node = type === "text" ? new Text() : document.createElement(type);
    };
    yield* renderComponent(instance, props);
    yield () => {
      if (previousSibling) {
        Object(_instance__WEBPACK_IMPORTED_MODULE_0__["insertAfter"])(previousSibling, instance);
      } else {
        Object(_instance__WEBPACK_IMPORTED_MODULE_0__["appendChild"])(parent, instance);
      }
    };
  } else {
    yield* renderComponent(instance, props);
  }

  instance.props = props;
  return instance;
}

function* unmountComponent(instance) {
  for (let child of Object.values(instance.children)) {
    yield* unmountComponent(child);
  }

  if (typeof instance.type === "string") {
    instance.node.remove();
  }
}

function render(element, container) {
  const root = Object(_instance__WEBPACK_IMPORTED_MODULE_0__["createInstance"])(container.tagName.toLowerCase(), null);
  root.node = container;
  Object(_scheduler__WEBPACK_IMPORTED_MODULE_1__["request"])(reconcileChilren(root, [element]));
  window.root = root;
}



/***/ }),

/***/ "./src/lib/scheduler.js":
/*!******************************!*\
  !*** ./src/lib/scheduler.js ***!
  \******************************/
/*! exports provided: request */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "request", function() { return request; });
var currentTask = null;
var pendingTasks = [];
var effects = [];

function request(task) {
  if (currentTask) {
    pendingTasks.push(task);
  } else {
    currentTask = task;
    window.requestIdleCallback(doWork);
  }
}

function doWork(deadline) {
  while (deadline.timeRemaining() > 5) {
    const {
      done,
      value
    } = currentTask.next();

    if (done) {
      return window.requestAnimationFrame(commit);
    } else {
      if (Array.isArray(value)) {
        effects.push(...value);
      } else {
        effects.push(value);
      }
    }
  }

  window.requestIdleCallback(doWork);
}

function commit() {
  for (let effect of effects) effect();

  effects = [];
  currentTask = pendingTasks.shift();

  if (currentTask) {
    window.requestIdleCallback(doWork);
  }
}



/***/ }),

/***/ "./src/lib/util.js":
/*!*************************!*\
  !*** ./src/lib/util.js ***!
  \*************************/
/*! exports provided: equals, toKebabCase */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "equals", function() { return equals; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "toKebabCase", function() { return toKebabCase; });
function equals(a, b) {
  if (a == null && b == null) return true;
  if (a == null || b == null) return false;
  if (typeof a != typeof b) return false;
  if (/number|string|boolean|symbol|function/.test(typeof a)) return a == b;

  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length != b.length) return false;

    for (let i = 0; i < a.length; i++) {
      if (!equals(a[i], b[i])) return false;
    }

    return true;
  }

  if (Array.isArray(a) || Array.isArray(b)) return false;
  if (Object.keys(a).length != Object.keys(b).length) return false;

  for (let key of Object.keys(a)) {
    if (!b.hasOwnProperty(key)) return false;
    if (!equals(a[key], b[key])) return false;
  }

  return true;
}

function toKebabCase(s) {
  return s.replace(/[A-Z]/g, c => "-" + c.toLowerCase());
}



/***/ })

/******/ });
//# sourceMappingURL=main.js.map