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
) => (segments: string[], ...fns: StringRenderer[]) => StyledWrapper = (
  type
) => (segments, ...fns) => {
  const renderCSS = parseTemplateCSS(segments, ...fns);
  const subruleRenderers: StringRenderer[] = [];
  const Styled: StyledWrapper = (props, _scope, context) => {
    const declaration: string = renderCSS(props);
    let className: string;
    if (!usedDeclarations.has(declaration)) {
      className = `s-${uid()}`;
      context.emit(() => {
        styleEl.sheet.insertRule(`.${className} { ${declaration} }`);
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
    subruleRenderers.push(parseTemplateCSS(segments, ...fns));
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
