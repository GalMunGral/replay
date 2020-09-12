import uid from "uid";
import htmlTags from "html-tags";
import { Arguments, RenderFunction } from "../core/component";

type StringRenderer = (props: Arguments) => string;

interface StyleWrapper extends RenderFunction {
  $: (segments: string[], ...fns: StringRenderer[]) => StyleWrapper;
}

const usedDeclarations = new Map<string, string>();
const usedRules = new Set<string>();
const styleEl = document.createElement("style");
document.head.append(styleEl);

function parseTemplateCSS(
  segments: string[],
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
) => (segments: string[], ...fns: StringRenderer[]) => StyleWrapper = (
  type
) => (segments, ...fns) => {
  const subruleRenderers: StringRenderer[] = [];

  const renderCSS = parseTemplateCSS(segments, ...fns);
  const Styled: StyleWrapper = (props, _scope, context) => {
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

    return [[type, props, props.children]];
  };

  Styled.$ = (segments: string[], ...fns: StringRenderer[]): StyleWrapper => {
    const renderer = parseTemplateCSS(segments, ...fns);
    subruleRenderers.push(renderer);
    return Styled;
  };

  return Styled;
};

htmlTags.forEach((tag) => {
  // Create shorthands for DOM components, e.g. `decorator('div')`
  // can be written as `decorator['div']` or simply `decorator.div`
  decorator[tag] = decorator(tag);
});

export { decorator };
