import { withContext, Observable } from "lib";
import { InputBox } from "../elements/Editor";

const context = () => ({
  self$: Observable({
    focused: false,
  }),
});

const EditorInput = ({ label, value, setValue, placeholder }, { self$ }) =>
  // use-transform
  InputBox([
    (self$.focused || value) && label(label),
    input(
      (key = "input"),
      (value = value),
      (placeholder = !self$.focused && !value ? placeholder : ""),
      (onfocus = () => (self$.focused = true)),
      (onblur = () => (self$.focused = false)),
      (onchange = (e) => setValue(e.target.value))
    ),
  ]);

export default withContext(context)(EditorInput);
