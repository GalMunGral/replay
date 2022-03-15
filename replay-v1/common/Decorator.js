import uid from "uid";
import htmlTags from "html-tags";

const classCache = new Map();
const ruleCache = new Set();

const compileCSS = (segments, ...fns) => (props) => {
  const computed = [segments[0]];
  for (let i = 0; i < fns.length; i++) {
    computed.push(fns[i](props));
    computed.push(segments[i + 1]);
  }
  return computed.join("");
};

const decor = (component) => (...args) => {
  const declarations = compileCSS(...args);
  const rules = [];

  const StyleWrapper = () =>
    function* (props, children) {
      const computedDeclarations = declarations(props);

      let className;
      if (!classCache.has(computedDeclarations)) {
        className = "s-" + uid();
        const rule = "." + className + " { " + computedDeclarations + " } ";
        yield { type: "ADD_CSS_RULE", payload: rule };
        classCache.set(computedDeclarations, className);
      } else {
        className = classCache.get(computedDeclarations);
      }

      for (let rule of rules) {
        const computedRule = "." + className + rule(props);
        if (!ruleCache.has(computedRule)) {
          yield { type: "ADD_CSS_RULE", payload: computedRule };
          ruleCache.add(computedRule);
        }
      }

      return [
        [
          component,
          {
            ...props,
            className:
              className + (props.className ? " " + props.className : ""),
          },
          children,
        ],
      ];
    };

  StyleWrapper.and = function attachRules(...args) {
    rules.push(compileCSS(...args));
    return this;
  };

  return StyleWrapper;
};

htmlTags.forEach((tag) => (decor[tag] = decor(tag)));

export default decor;
