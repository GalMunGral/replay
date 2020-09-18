import {
  $$isHostRenderFunction,
  Arguments,
  getHostRenderFunction,
  RenderFunction,
} from "../core/Component";

type StringRenderer = (props: Arguments) => string;

interface StyleWrapper extends RenderFunction {
  $: (segments: TemplateStringsArray, ...fns: StringRenderer[]) => StyleWrapper;
  [$$isHostRenderFunction]?: boolean;
}

type Decorator = (
  type: string | RenderFunction
) => (segments: TemplateStringsArray, ...fns: StringRenderer[]) => StyleWrapper;

var nextClassId = 0;
// TODO CHECK
const usedDeclarations = new Map<string, string>();
const usedRules = new Set<string>();

const styleEl = document.createElement("style");
document.head.append(styleEl);

function parseTemplateCSS(
  segments: TemplateStringsArray,
  ...fns: StringRenderer[]
): StringRenderer {
  return (props: Arguments) => {
    const result = [segments[0]];
    for (let i = 0; i < fns.length; i++) {
      result.push(fns[i](props));
      result.push(segments[i + 1]);
    }
    return result.join("");
  };
}

const decorator: Decorator = (type) => {
  const wrappedRenderFunction =
    typeof type == "string" ? getHostRenderFunction(type) : type;
  return (segments, ...fns) => {
    const subruleRenderers: StringRenderer[] = [];
    const renderCSS = parseTemplateCSS(segments, ...fns);

    const StyledComponent: StyleWrapper = function (props, scope, context) {
      const declaration = renderCSS(props);
      let className: string;
      if (!usedDeclarations.has(declaration)) {
        className = "s-" + (nextClassId++).toString(16);
        context.emit(() => {
          styleEl.sheet.insertRule(`.${className}{${declaration}}`);
          usedDeclarations.set(declaration, className);
        });
      } else {
        className = usedDeclarations.get(declaration);
      }
      for (let renderRule of subruleRenderers) {
        const rule = `.${className}${renderRule(props)}`;
        if (!usedRules.has(rule)) {
          context.emit(() => {
            styleEl.sheet.insertRule(rule);
            usedRules.add(rule);
          });
        }
      }
      props = {
        ...props,
        className: props.className
          ? [className, props.className].join(" ")
          : className,
      };
      return wrappedRenderFunction.apply(this, [props, scope, context]);
    };

    StyledComponent.$ = function (
      segments: TemplateStringsArray,
      ...fns: StringRenderer[]
    ): StyleWrapper {
      const renderer = parseTemplateCSS(segments, ...fns);
      subruleRenderers.push(renderer);
      return this;
    };

    return new Proxy(StyledComponent, {
      get(target, key, receiver) {
        if (key === "name" || key === $$isHostRenderFunction) {
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
