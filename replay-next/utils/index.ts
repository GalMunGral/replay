import { RenderFunction } from "../core/Record";

export { decorator } from "./Decorator";
export { Router, Link, Redirect, navigate, redirect } from "./Router";
export { createStore, thunkMiddleware } from "./Store";

export const Fragment: RenderFunction = ({ children }) => {
  children.forEach((render) => render());
};

type EventModifier = (f: EventListener) => EventListener;

export const prevent: EventModifier = (listener) => (e) => {
  e.preventDefault();
  if (typeof listener == "function") {
    listener(e);
  }
};

export const stop: EventModifier = (listener) => (e) => {
  e.stopPropagation();
  if (typeof listener == "function") {
    listener(e);
  }
};

export const stopImmediate: EventModifier = (listener) => (e) => {
  e.stopImmediatePropagation();
  if (typeof listener == "function") {
    listener(e);
  }
};
