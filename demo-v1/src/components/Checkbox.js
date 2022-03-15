import { Clickable, Background, CheckMark } from "./CheckboxComponent";

const Checkbox = () => ({ checked, onchange }) =>
  // use-transform
  // prettier-ignore
  Clickable(
    onmousedown=(e) => e.stopPropagation(),
    onmouseup=(e) => e.stopPropagation(),
    onclick=onchange,
    [
      div([
        Background(checked=checked),
        CheckMark(checked=checked, [
          i(className="fas fa-check")
        ]),
        input(type="checkbox", checked=checked),
      ]),
    ]
  );

export default Checkbox;
