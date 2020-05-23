import { Clickable, Background, CheckMark } from "../elements/Checkbox";

const Checkbox = ({ checked, onchange }) =>
  // use-transform
  Clickable(
    (onmousedown = (e) => e.stopPropagation()),
    (onmouseup = (e) => e.stopPropagation()),
    (onclick = onchange),
    [
      div([
        Background({ checked }),
        CheckMark({ checked }, [i((className = "fas fa-check"))]),
        input((type = "checkbox"), { checked }),
      ]),
    ]
  );

export default Checkbox;
