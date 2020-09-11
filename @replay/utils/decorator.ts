import uid from "uid";
import htmlTags from "html-tags";

var styleSheet: CSSStyleSheet;
const declarationToClassName = new Map<string, string>();
const addedRules = new Set<string>();

function insertRule(rule: string): void {
  if (!styleSheet) {
    const styleEl = document.createElement("style");
    document.head.append(styleEl);
    styleSheet = styleEl.sheet;
  }
  styleSheet.insertRule(rule);
}

function compileCSS(segments, ...fns) {
  return (props) => {
    const result = [segments[0]];
    for (let i = 0; i < fns.length; i++) {
      result.push(fns[i](props));
      result.push(segments[i + 1]);
    }
    return result.join("");
  };
}

const decorator = (component) => (segments, ...fns) => {
  const declarations = compileCSS(segments, ...fns);
  const rules = [];
  const StyleWrapper = (props, __, context) => {
    const computedDeclarations = declarations(props);
    let className;
    if (!declarationToClassName.has(computedDeclarations)) {
      className = "s-" + uid();
      const rule = "." + className + " { " + computedDeclarations + " } ";
      context.emit(() => {
        insertRule(rule);
        declarationToClassName.set(computedDeclarations, className);
      });
    } else {
      className = declarationToClassName.get(computedDeclarations);
    }
    for (let rule of rules) {
      const computedRule = "." + className + rule(props);
      if (!addedRules.has(computedRule)) {
        context.emit(() => {
          insertRule(computedRule);
          addedRules.add(computedRule);
        });
      }
    }
    const mergedClassName = props.className
      ? className + " " + props.className
      : className;
    return [
      [
        component,
        {
          ...props,
          className: mergedClassName,
        },
        props.children,
      ],
    ];
  };
  StyleWrapper.and = (segments, ...fns) => {
    rules.push(compileCSS(segments, ...fns));
    return StyleWrapper;
  };
  return StyleWrapper;
};

htmlTags.forEach((tag) => (decorator[tag] = decorator(tag)));

export { decorator };
