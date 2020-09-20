import { decorator as $$ } from "replay/utils";

const EditorInput = (
  { value, setValue, label, placeholder },
  { focused, onfocus, onblur }
) => {
  const activated = focused || value;
  const oninput = (e) => setValue(e.target.value);
  return [
    <InputBox>
      {activated ? <label>{label}</label> : null}
      <input
        placeholder={activated ? "" : placeholder}
        value={value}
        oninput={oninput}
        onfocus={onfocus}
        onblur={onblur}
      />
    </InputBox>,
  ];
};

EditorInput.init = ({}, $this) => ({
  focused: false,
  onfocus() {
    $this.focused = true;
  },
  onblur() {
    $this.focused = false;
  },
});

export default EditorInput;

const InputBox = $$.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  line-height: 1rem;
  font-size: 1rem;
  margin: 0 20px;
  padding: 0;
  border-bottom: 1px solid var(--light-gray);

`.$` > label {
    color: gray;
    margin-right: 5px;
  }
`.$` > input {
    flex: 1 1 auto;
    line-height: 1rem;
    font-size: 1rem;
    padding: 8px 0;
    border: none;
    outline: none;
    background: white;
    font-family: inherit;
  }
`;
