import { RenderFunction } from "../core/Component";

export { decorator } from "./Decorator";
export { observer, observable, DefaultMap } from "./Observable";
export { Router, Link, Redirect, navigate, redirect } from "./Router";
export { createStore, thunkMiddleware } from "./Store";
export { stop, prevent } from "./Event";

export const Fragment: RenderFunction = ({ children }) => {
  return Array.isArray(children) ? children : [null];
};
