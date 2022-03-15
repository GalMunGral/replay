import { InputBox } from "./EditorComponents";

const EditorInput = (state) => {
  state.focused = false;

  return ({ label, value, setValue, placeholder }) => {
    return (
      // use-transform
      // prettier-ignore
      InputBox([
        state.focused || value ? label(label) : null,
        input(
          key="input", // If key is not specified, input will get recreated every time because its index changes 1 -> 0 -> 1
          value=value,
          placeholder=!state.focused && !value ? placeholder : "",
          onfocus=() => (state.focused = true),
          onblur=() => (state.focused = false),
          onchange=(e) => setValue(e.target.value)
        ),
      ])
    );
  };
};

export default EditorInput;
