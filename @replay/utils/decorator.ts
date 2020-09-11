import uid from "uid";
import htmlTags from "html-tags";
import { Arguments, RenderFunction } from "../core/component";

type StringRenderer = (props: Arguments) => string;

interface StyledWrapper extends RenderFunction {
  and: (segments: string[], ...fns: StringRenderer[]) => StyledWrapper;
}

const usedDeclarations = new Map<string, string>();
const usedRules = new Set<string>();
const styleEl = document.createElement("style");
document.head.append(styleEl);

function parseTemplate(
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
) => (segments: string[], ...fns: StringRenderer[]) => StyledWrapper = (
  type
) => (segments, ...fns) => {
  const renderCSS = parseTemplate(segments, ...fns);
  const subruleRenderers: StringRenderer[] = [];
  const Styled: StyledWrapper = (props, _scope, context) => {
    const declaration: string = renderCSS(props);
    let className: string;
    if (!usedDeclarations.has(declaration)) {
      className = `s-${uid()}`;
      const rule = `.${className} { ${declaration} }`;
      context.emit(() => {
        styleEl.sheet.insertRule(rule);
        usedDeclarations.set(declaration, className);
      });
    } else {
      className = usedDeclarations.get(declaration);
    }
    for (let rule of subruleRenderers) {
      const computedRule = "." + className + rule(props);
      if (!usedRules.has(computedRule)) {
        context.emit(() => {
          styleEl.sheet.insertRule(computedRule);
          usedRules.add(computedRule);
        });
      }
    }
    const mergedClassName = props.className
      ? className + " " + props.className
      : className;
    props = {
      ...props,
      className: mergedClassName,
    };
    return [[type, props, props.children]];
  };

  Styled.and = (
    segments: string[],
    ...fns: StringRenderer[]
  ): StyledWrapper => {
    subruleRenderers.push(parseTemplate(segments, ...fns));
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
