import { InputBox } from "./Editor.decor";

const context = () => {
  return {
    $self: observable({
      focused: false,
    }),
  };
};

const EditorInput = ({ label, value, setValue, placeholder }, { $self }) =>
  // use-transform
  InputBox([
    ($self.focused || value) && label(label),
    input(
      (key = "input"),
      (value = value),
      (placeholder = !$self.focused && !value ? placeholder : ""),
      (onfocus = () => ($self.focused = true)),
      (onblur = () => ($self.focused = false)),
      (onchange = (e) => setValue(e.target.value))
    ),
  ]);

EditorInput.context = context;

export default EditorInput;
