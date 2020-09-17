import { Scheduler } from "./Scheduler";
import {
  Quasiquote,
  ActivationRecord,
  getHostRenderFunction,
} from "./Component";

export { lazy } from "./Component";

export function render(elements: Quasiquote[], container: HTMLElement): void {
  // Hack: Rendering `elements` under `container` is equivalent to rendering `[container, null, elements]`
  // Hack: Simulate an imaginary previous render of `[container, null, null]`
  const type = container.tagName.toLowerCase();
  const entry = new ActivationRecord(type, null);
  entry.node = container;
  container.innerHTML = "";
  container.append(new Text());

  // Hack: Use memoized props to simulate props passed in as arguments. Use dirty bit to trigger re-render.
  entry.renderFunction = getHostRenderFunction("body");
  entry.props = { children: elements };
  entry.dirty = true;
  Scheduler.instance.requestUpdate(new Set([entry]));
}
