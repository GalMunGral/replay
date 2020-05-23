import { withContext, Observable } from "lib";
import { InputBox } from "../elements/Editor";

const context = () => ({
  state$: Observable({
    focused: false,
  }),
});

const EditorInput = ({ label, value, setValue, placeholder }, { state$ }) =>
  // use-transform
  InputBox([
    state$.focused || value ? label(label) : null,
    input(
      (key = "input"),
      (value = value),
      (placeholder = !state$.focused && !value ? placeholder : ""),
      (onfocus = () => (state$.focused = true)),
      (onblur = () => (state$.focused = false)),
      (onchange = (e) => setValue(e.target.value))
    ),
  ]);

export default withContext(context)(EditorInput);
