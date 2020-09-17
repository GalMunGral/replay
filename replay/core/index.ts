import { Quasiquote, ActivationRecord } from "./Component";
import { Scheduler } from "./Scheduler";

export { lazy } from "./Component";

export function render(elements: Quasiquote[], container: HTMLElement): void {
  // Hack: Rendering `elements` under `container` is equivalent to rendering `[container, null, elements]`
  // Hack: Simulate an imaginary previous render of `[container, null, null]`
  const type = container.tagName.toLowerCase();
  const entry = new ActivationRecord(type, null);
  entry.node = container;
  container.innerHTML = "";
  container.append(new Text());

  // Hack: Use memoized props to simulate passing in props as arguments,
  // and use dirty bit to trigger re-render
  entry.props = { children: elements };
  entry.dirty = true;
  Scheduler.instance.requestUpdate(new Set([entry]));
}
