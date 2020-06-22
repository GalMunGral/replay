import uid from "uid";
import htmlTags from "html-tags";

var styleSheet;
const classCache = new Map();
const ruleCache = new Set();

const addCSSRule = (rule) => {
  if (!styleSheet) {
    const styleEl = document.createElement("style");
    document.head.append(styleEl);
    styleSheet = styleEl.sheet;
  }
  styleSheet.insertRule(rule);
};

const compileCSS = (segments, ...fns) => (props) => {
  const result = [segments[0]];
  for (let i = 0; i < fns.length; i++) {
    result.push(fns[i](props));
    result.push(segments[i + 1]);
  }
  return result.join("");
};

const decor = (component) => (...args) => {
  const declarations = compileCSS(...args);
  const rules = [];

  const StyleWrapper = function* (props) {
    const computedDeclarations = declarations(props);

    let className;
    if (!classCache.has(computedDeclarations)) {
      className = "s-" + uid();
      const rule = "." + className + " { " + computedDeclarations + " } ";
      yield () => addCSSRule(rule);
      classCache.set(computedDeclarations, className);
    } else {
      className = classCache.get(computedDeclarations);
    }

    for (let rule of rules) {
      const computedRule = "." + className + rule(props);
      if (!ruleCache.has(computedRule)) {
        yield () => addCSSRule(computedRule);
        ruleCache.add(computedRule);
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

  StyleWrapper.and = (...args) => {
    rules.push(compileCSS(...args));
    return StyleWrapper;
  };

  return StyleWrapper;
};

htmlTags.forEach((tag) => (decor[tag] = decor(tag)));

export { decor };
