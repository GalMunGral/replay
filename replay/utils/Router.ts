import {
  Arguments,
  DynamicScope,
  Quasiquote,
  RenderFunction,
} from "../core/Renderer";
import { decorator } from "./Decorator";

interface Route {
  regex: RegExp;
  validate: RouteValidator;
}

type RouteTable = Map<string, Route>;

type RouteValidator = (params: RouteMatchParams) => boolean;

interface RouteMatchParams {
  [key: string]: string;
}

interface RouteMatch {
  path: string;
  params: RouteMatchParams;
}

interface RouteProps extends Arguments {
  path: string;
  validate?: RouteValidator;
}

interface RouteElement extends Quasiquote {
  0: "route";
  1: RouteProps;
  2: Quasiquote[];
}

interface RouterProps extends Arguments {
  children: RouteElement[];
}

interface RouterScope extends DynamicScope {
  route: RouteMatch;
}

interface LinkProps extends Arguments {
  to: string;
  className: string; // supplied by decorator
  children: Quasiquote[];
}

interface RedirectProps extends Arguments {
  to: string;
}

function compileRegExp(pattern: string): RegExp {
  return new RegExp(
    "^" +
      pattern
        .split("/")
        .map((s) => {
          return s === "*"
            ? ".*?"
            : s.startsWith(":")
            ? `(?<${s.slice(1)}>[\\w-]+)`
            : s;
        })
        .join("\\/") +
      "$"
  );
}

function matchPath(routeTable: RouteTable): RouteMatch {
  for (let [path, route] of routeTable.entries()) {
    const { regex, validate } = route;
    const match = location.pathname.match(regex);
    if (!match) continue;
    const params: RouteMatchParams = match.groups;
    if (!validate || (params && validate(params))) {
      return { path, params };
    }
  }
  return { path: null, params: null };
}

export function navigate(path: string): void {
  window.history.pushState(null, "", path);
  window.dispatchEvent(new Event("popstate"));
}

export function redirect(path: string): void {
  window.history.replaceState(null, "", path);
  window.dispatchEvent(new Event("popstate"));
}

export const Link: RenderFunction = decorator(
  ({ to: path, className, children }: LinkProps) => {
    if (!Array.isArray(children) || !children.length) return [null];
    const child = children[0];
    const onclick = child[1].onclick;
    child[1].onclick = (e) => {
      if (typeof onclick == "function") {
        (onclick as Function)(e);
      }
      navigate(path);
    };
    child[1].className = [className, child[1].className].join(" ");
    return [child];
  }
)`
  cursor: pointer;
`;

export const Redirect: RenderFunction = (
  { to: path }: RedirectProps,
  {},
  context
) => {
  // `redirect` dispatches "popstate" event
  // -> `window.onpopstate` (sync) <---- EDGE CASE: this is undefined during initial render
  // -> `route` updated, set trap triggered
  // -> `Scheduler.requestUpdate`
  // -> (in microtask) current rendering is aborted

  // context.emit(() => redirect(path)); // Defer calls to `redirect` until the commit phase (after `window.onpopstate` is set)
  redirect(path);
  return [];
};

export const Router: RenderFunction = (
  { children }: RouterProps,
  { route }: RouterScope
) => {
  if (!Array.isArray(children)) return [null];
  return children
    .filter((child) => child[1].path === route.path)
    .filter((child) => Array.isArray(child[2][0]))
    .map((child) => child[2][0] as Quasiquote);
};

Router.init = (props: RouterProps, _this: RouterScope, context) => {
  const routeTable: RouteTable = new Map(
    props.children
      .filter((child) => child[0] === "route")
      .map((route) => {
        const { path, validate } = route[1];
        const regex = compileRegExp(path);
        return [path, { regex, validate }];
      })
  );

  window.onpopstate = () => {
    Object.assign(_this.route, matchPath(routeTable));
  };

  return {
    route: matchPath(routeTable),
    deinit() {
      window.onpopstate = null;
    },
  };
};
