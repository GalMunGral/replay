import { InputBox } from "./Editor.decor";

const init = () => {
  return {
    $self: observable({
      focused: false,
    }),
  };
};

const EditorInput = ({ value, setValue, label, placeholder }, context) => {
  const { $self } = context;
  const activated = $self.focused || value;

  return (
    // use-transform
    InputBox([
      activated && label(label),
      input(
        (value = value),
        (placeholder = !activated ? placeholder : ""),
        (onfocus = () => ($self.focused = true)),
        (onblur = () => ($self.focused = false)),
        (onchange = (e) => setValue(e.target.value))
      ),
    ])
  );
};

EditorInput.init = init;

export default EditorInput;
