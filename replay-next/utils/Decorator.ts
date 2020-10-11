import { $$isHostRenderer, getHostRenderFunction } from "../core/Renderer";
import { Arguments, RenderFunction } from "../core/Record";

type StringRenderer = (props: Arguments) => string;

interface StyleWrapper extends RenderFunction {
  $: (segments: TemplateStringsArray, ...fns: StringRenderer[]) => StyleWrapper;
  [$$isHostRenderer]?: boolean;
}

type Decorator = (
  type: string | RenderFunction
) => (segments: TemplateStringsArray, ...fns: StringRenderer[]) => StyleWrapper;

const addedClasses = new Set<string>();
const styleEl = document.createElement("style");
styleEl.dataset.decorator = "";
document.head.append(styleEl);

function parseTemplateCSS(
  segments: TemplateStringsArray,
  ...fns: StringRenderer[]
): StringRenderer {
  return (props: Arguments) => {
    return fns.reduce(
      (str, fn, i) => str + fn(props) + segments[i + 1],
      segments[0]
    );
  };
}

function generateHash(styleString: string): string {
  return styleString
    .split("")
    .reduce((hash, char) => {
      return ((hash << 5) - hash + char.charCodeAt(0)) | 0;
    }, 0)
    .toString(16);
}

const decorator: Decorator = (type) => {
  const wrappedRenderFunction =
    typeof type == "string" ? getHostRenderFunction(type) : type;

  return (segments, ...fns) => {
    const nestedRuleCompilers: StringRenderer[] = [];
    const compileCSS = parseTemplateCSS(segments, ...fns);

    const StyledComponent: StyleWrapper = function (props, scope) {
      const nestedRules = nestedRuleCompilers.map((fn) => fn(props));
      const rules = [" {" + compileCSS(props) + "}", ...nestedRules];
      const hash = generateHash(rules.join("\n"));
      const className = wrappedRenderFunction.name + "-" + hash;

      if (!addedClasses.has(className)) {
        rules.forEach((rule) => {
          // styleEl.sheet.insertRule("." + className + rule);
          styleEl.appendChild(new Text("." + className + rule + "\n"));
        });
        addedClasses.add(className);
      }

      props = {
        ...props,
        className: props.className
          ? props.className + " " + className
          : className,
      };

      return wrappedRenderFunction.apply(this, [props, scope]);
    };

    StyledComponent.$ = function (
      segments: TemplateStringsArray,
      ...fns: StringRenderer[]
    ): StyleWrapper {
      const fn = parseTemplateCSS(segments, ...fns);
      nestedRuleCompilers.push(fn);
      return this;
    };

    return new Proxy(StyledComponent, {
      get(target, key, receiver) {
        if (key === "name" || key === $$isHostRenderer) {
          return wrappedRenderFunction[key];
        }
        return Reflect.get(target, key, receiver);
      },
    });
  };
};

const decoratorAPI: Decorator = new Proxy(decorator, {
  get(target, key, receiver) {
    // Create shorthands for DOM components, e.g. `decorator('div')`
    // can be written as `decorator['div']` or simply `decorator.div`
    if (typeof key == "string" && !Reflect.has(target, key)) {
      target[key] = target(key);
    }
    return Reflect.get(target, key, receiver);
  },
});

export { decoratorAPI as decorator };
