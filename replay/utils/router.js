import { decorator } from "./decorator";
import { Observable, Observer } from "./observable";

function compileRegExp(pattern) {
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

function matchPath(routeTable) {
  for (let [path, route] of routeTable.entries()) {
    const { regex, validate } = route;
    const match = location.pathname.match(regex);
    if (match && (!validate || (match.groups && validate(match.groups)))) {
      return { path, params: match.groups };
    }
  }
  return { path: null, params: null };
}

export function navigate(path) {
  window.history.pushState(null, "", path);
  window.dispatchEvent(new Event("popstate"));
}

export function redirect(path) {
  window.history.replaceState(null, "", path);
  window.dispatchEvent(new Event("popstate"));
}

export const Link = ({ to: path, children }) => {
  if (!Array.isArray(children) || !children.length) return children;
  const child = children[0];
  child[0] = decorator(child[0])`cursor: pointer;`;
  const onclick = child[1].onclick;
  child[1].onclick = (e) => {
    if (onclick) onclick(e);
    navigate(path);
  };
  return [child];
};

export const Redirect = ({ to: path }, __, context) => {
  // `redirect` dispatches "popstate" event
  // -> `window.onpopstate` (sync) <---- EDGE CASE: UNDEFINED DURING FIRST RENDER
  // -> `$route` updated, set trap triggered
  // -> `Scheduler.requestUpdate`
  // -> (in microtask) current rendering is aborted

  // Defer calls to `redirect` until the commit phase (after `window.onpostate` is set)
  context.emit(() => redirect(path));
  return [];
};

export const Router = Observer(({ children }, { $route }) => {
  return children
    .filter((child) => child[1].path === $route.path)
    .map((child) => child[2][0]);
});

Router.init = (props, scope, context) => {
  const routeTable = new Map(
    props.children
      .filter((child) => child[0] === "route")
      .map((route) => {
        const { path, validate } = route[1];
        const regex = compileRegExp(path);
        return [path, { regex, validate }];
      })
  );

  scope.$route = new Observable(matchPath(routeTable));

  context.emit(() => {
    window.onpopstate = () => {
      Object.assign(scope.$route, matchPath(routeTable));
    };
    scope.deinit = () => {
      console.log("Router deinit");
      window.onpopstate = null;
    };
  });
};
