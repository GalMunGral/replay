var styleSheet;

function* handleEffects(generator) {
  var done, value;
  while (({ value, done } = generator.next()) && !done) {
    switch (value.type) {
      case "ADD_CSS_RULE": {
        if (!styleSheet) {
          styleSheet = {}; // Placeholder;
          yield () => {
            const styleEl = document.createElement("style");
            document.head.append(styleEl);
            styleSheet = styleEl.sheet;
          };
        }
        const cssRule = value.payload;
        yield () => styleSheet.insertRule(cssRule);
      }
    }
  }
  return value;
}

export { handleEffects };
