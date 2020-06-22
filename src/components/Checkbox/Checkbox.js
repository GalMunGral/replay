import { Clickable, Background, CheckMark } from "./Checkbox.decor";

const Checkbox = ({ checked, onchange }) =>
  // use-transform
  Clickable(
    (onclick = onchange),
    (onmousedown = (e) => e.stopPropagation()),
    (onmouseup = (e) => e.stopPropagation()),
    [
      div([
        Background((checked = checked)),
        CheckMark((checked = checked), [
          // prettier-ignore
          i((className = "fas fa-check")),
        ]),
        input((type = "checkbox"), (checked = checked)),
      ]),
    ]
  );

export default Checkbox;
