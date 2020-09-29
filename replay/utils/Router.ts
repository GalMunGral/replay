import { __STEP_OVER__, hostContexts } from "../core/Renderer";
import { Arguments, DynamicScope, RenderFunction } from "../core/Record";
import { decorator } from "./Decorator";

interface RouteDef {
  path: string;
  validate: RouteValidator;
  component: RenderFunction;
}

interface Route {
  regex: RegExp;
  validate: RouteValidator;
  component: RenderFunction;
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

interface RouterScope extends DynamicScope {
  route: RouteMatch;
}

interface LinkProps extends Arguments {
  to: string;
  className: string; // supplied by decorator
  children: ((...arg: any) => any)[];
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

export const Link: RenderFunction = decorator(function Link({
  to: path,
  className,
  children,
}: LinkProps) {
  hostContexts.push([]);
  const render = children[0];
  if (typeof render == "function") render();
  const nodes = hostContexts.pop();
  nodes.forEach((node: HTMLElement) => {
    node.className = node.className + " " + className;
    node.onclick = () => navigate(path);
    hostContexts.top().push(node);
  });
})`
  cursor: pointer;
`;

export const Redirect: RenderFunction = ({ to: path }: RedirectProps) => {
  queueMicrotask(() => redirect(path));
};

export class Router {
  private routeTable: RouteTable;
  public RouterView: RenderFunction;

  constructor(routes: RouteDef[]) {
    this.routeTable = new Map(
      routes.map(({ path, validate, component }) => {
        const regex = compileRegExp(path);
        return [path, { regex, validate, component }];
      })
    );

    this.RouterView = ({}, { route }: RouterScope) => {
      const matchedPath = route.path;
      const matchedRoute = this.routeTable.get(matchedPath);
      __STEP_OVER__(matchedRoute.component);
    };

    this.RouterView.init = ({}, $this: RouterScope) => {
      window.onpopstate = () => {
        Object.assign($this.route, matchPath(this.routeTable));
      };
      return {
        route: matchPath(this.routeTable),
        deinit() {
          window.onpopstate = null;
        },
      };
    };
  }
}
