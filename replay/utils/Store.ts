import { observable } from "replay/utils";

interface ModuleStateLinkage {
  [module: string]: State<any>;
}

type State<T extends Object> = T & ModuleStateLinkage;

interface HistorySnapshot<T extends Object> {
  current: T;
  past: T[];
  future: T[];
}

interface StateReference<T extends Object> {
  current: HistorySnapshot<T>;
}

type ActionType = string;

interface Action {
  type: ActionType;
  payload: any;
}

type ActionThunk = (dispatch: Dispatcher) => void;

type Reducer<T extends Object> = (state: T, action: Action) => T;

type Dispatcher = (action: ActionType | ActionThunk, ...args: any[]) => void;

type Middleware<T extends Object> = (
  store: Store<T>
) => (next: Dispatcher) => Dispatcher;

interface StoreConfig<T extends Object> {
  reducer?: Reducer<T>;
  initialState?: T;
  mutableState?: T;
  modules?: { [key: string]: Store<any> };
  middlewares?: Middleware<T>[];
}

interface Store<T extends Object> {
  readonly state: State<T>;
  getSnapshot(): State<T>;
  dispatch: Dispatcher;
  mapDispatch(
    namespace: string,
    actions: string[]
  ): { [method: string]: (...args: any[]) => void };
}

function immutable<T extends Object>(obj: T): T {
  if (typeof obj != "object" || obj == null) return obj;
  return new Proxy(obj, {
    get(target, key, receiver) {
      const value = Reflect.get(target, key, receiver);
      return immutable(value);
    },
    set() {
      console.warn("Cannot set properties on an immutable object");
      return true; // Silently fail
    },
  });
}

function dataonly<T extends Object>(obj: T): T {
  return new Proxy(obj, {
    get(target, key, receiver) {
      const value = Reflect.get(target, key, receiver);
      if (typeof value == "function") {
        console.warn("Cannot access methods on a data-only object");
        return undefined;
      }
      return value;
    },
    ownKeys(target) {
      return Reflect.ownKeys(target).filter(
        (key) => typeof target[key] != "function"
      );
    },
  });
}

function withHistory<T>(reducer: Reducer<T>): Reducer<HistorySnapshot<T>> {
  return (state, action) => {
    switch (action.type) {
      case "undo":
        if (state.past.length === 0) return state;
        return {
          past: state.past.slice(1),
          current: state.past[0],
          future: [state.current, ...state.future],
        };
      case "redo":
        if (state.future.length === 0) return state;
        return {
          past: [state.current, ...state.past],
          current: state.future[0],
          future: state.future.slice(1),
        };
      case "reset":
        return {
          past: [],
          current: action.payload,
          future: [],
        };
      default:
        return {
          past: [state.current, ...state.past],
          current: reducer(state.current, action),
          future: [],
        };
    }
  };
}

export const thunkMiddleware: Middleware<any> = () => (next) => (
  action,
  ...args
) => {
  if (typeof action == "function") {
    action(next);
  } else {
    next(action, ...args);
  }
};

export function createStore<T extends Object>({
  reducer,
  initialState = {} as T,
  mutableState = {} as T,
  modules = {},
  middlewares = [thunkMiddleware],
}: StoreConfig<T>): Store<T> {
  let stateRef: StateReference<T>, dispatch: Dispatcher;
  if (typeof reducer == "function") {
    stateRef = observable({
      current: {
        current: initialState,
        past: [] as T[],
        future: [] as T[],
      } as HistorySnapshot<T>,
    });
    dispatch = (action, payload) => {
      // `set` trap of `state` proxy handles notifications automatically
      stateRef.current = withHistory(reducer)(stateRef.current, {
        type: String(action),
        payload,
      });
    };
  } else {
    // Raw observable/mutable state object is only available in this scope
    // Only methods invoked on this object directly can mutate its state
    // Both access to methods and mutations are blocked from the outside

    const protectedState = observable(mutableState);
    stateRef = {
      current: { current: dataonly(protectedState) } as HistorySnapshot<T>,
    };
    dispatch = (action, ...args) => {
      action = String(action);
      if (typeof protectedState[action] == "function") {
        protectedState[action](...args);
      } else if (action.startsWith("set")) {
        const key = action[3].toLowerCase() + action.slice(4);
        const value = args[0];
        protectedState[key] = value;
      } else {
        console.warn(`Action '${action}' is undefined`);
      }
    };
  }

  const store: Store<T> = {
    get state() {
      return new Proxy(stateRef.current.current, {
        get(target, key, receiver) {
          return Reflect.has(target, key)
            ? immutable(Reflect.get(target, key, receiver))
            : modules.hasOwnProperty(key)
            ? modules[String(key)].state
            : undefined;
        },
        ownKeys(target) {
          return [...Reflect.ownKeys(target), ...Object.keys(modules)];
        },
      }) as State<T>;
    },
    getSnapshot() {
      const snapshot: State<T> = { ...stateRef.current.current };
      Object.entries(modules).forEach(([key, module]) => {
        (snapshot as ModuleStateLinkage)[key] = module.getSnapshot();
      });
      return snapshot;
    },
    dispatch(action, ...args) {
      if (typeof action != "string") {
        console.warn("[Store] action type must be a string");
        return;
      }
      if (action[0] == "/") action = action.slice(1);
      const path = action.split("/");
      if (path.length == 1) {
        dispatch(action, ...args);
      } else if (modules.hasOwnProperty(path[0])) {
        action = path.slice(1).join("/");
        modules[path[0]].dispatch(action, ...args);
      } else {
        console.warn(`[Store] action type '${action}' is undefined`);
      }
    },
    mapDispatch(namespace: string = "", actions: string[]) {
      const methods: { [method: string]: (...args: any[]) => void } = {};
      actions.forEach((action) => {
        const name = action
          .split("/")
          .map((s, i) => (i == 0 ? s : s[0].toUpperCase() + s.slice(1)))
          .join("");
        methods[name] = (...args) => {
          (this as Store<T>).dispatch(namespace + "/" + action, ...args);
        };
      });
      return methods;
    },
  };
  store.dispatch = middlewares.reduceRight(
    (next, middleware) => middleware(store)(next),
    store.dispatch
  );
  return store;
}
