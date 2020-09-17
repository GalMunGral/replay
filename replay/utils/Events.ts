type EventModifier = (f: EventListener) => EventListener;

export const prevent: EventModifier = (listener) => (e) => {
  e.preventDefault();
  if (typeof listener == "function") {
    listener(e);
  }
};

export const stop: EventModifier = (listener) => (e) => {
  e.stopPropagation();
  if (typeof listener == "function") {
    listener(e);
  }
};

export const stopImmediate: EventModifier = (listener) => (e) => {
  e.stopImmediatePropagation();
  if (typeof listener == "function") {
    listener(e);
  }
};
