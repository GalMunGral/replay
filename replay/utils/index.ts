import { RenderFunction } from "../core/component";

export { decorator } from "./decorator";
export { Observer, Observable } from "./observable";
export { Router, Link, Redirect, navigate, redirect } from "./router.js";

export const Fragment: RenderFunction = ({ children }) => {
  return Array.isArray(children) ? children : [null];
};
