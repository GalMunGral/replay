import uid from "uid";
import htmlTags from "html-tags";
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

const decorator: (
  type: string | RenderFunction
) => (
  segments: TemplateStringsArray,
  ...fns: StringRenderer[]
) => StyleWrapper = (type) => (segments, ...fns) => {
  const subruleRenderers: StringRenderer[] = [];
  const renderCSS = parseTemplateCSS(segments, ...fns);
  const wrappedRenderFunction =
    typeof type == "string" ? getHostRenderFunction(type) : type;
  const Styled: StyleWrapper = function (props, scope, context) {
    const declaration = renderCSS(props);
    let className: string;
    if (!usedDeclarations.has(declaration)) {
      className = `s-${uid()}`;
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
    // return [[type, props, props.children]];
  };

  Styled.$ = function (
    segments: TemplateStringsArray,
    ...fns: StringRenderer[]
  ): StyleWrapper {
    const renderer = parseTemplateCSS(segments, ...fns);
    subruleRenderers.push(renderer);
    return this;
  };

  return new Proxy(Styled, {
    get(target, key, receiver) {
      if (key === "name" || key === $$isHostRenderFunction) {
        // console.log(key, wrappedRenderFunction[key]);
        return wrappedRenderFunction[key];
      }
      return Reflect.get(target, key, receiver);
    },
  });
};

htmlTags.forEach((tag) => {
  // Create shorthands for DOM components, e.g. `decorator('div')`
  // can be written as `decorator['div']` or simply `decorator.div`
  decorator[tag] = decorator(tag);
});

export { decorator };
