import { Observer, decorator as $$ } from "replay/utils";

const EditorInput = Observer(
  ({ value, setValue, label, placeholder }, { $self }) => {
    const activated = $self.focused || value;
    return [
      <InputBox>
        {activated && <label>{label}</label>}
        <input
          value={value}
          placeholder={!activated ? placeholder : ""}
          onfocus={() => ($self.focused = true)}
          onblur={() => ($self.focused = false)}
          onchange={(e) => setValue(e.target.value)}
        />
      </InputBox>,
    ];
  }
);

export default EditorInput;

const InputBox = $$.div`
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
    line-height: 1rem;
    font-size: 1rem;
    padding: 8px 0;
    border: none;
    outline: none;
    background: white;
    font-family: inherit;
  }
`;
