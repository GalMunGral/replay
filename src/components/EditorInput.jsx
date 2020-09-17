import { observer, observable, decorator as $$ } from "replay/utils";

const EditorInput = observer(
  ({ value, setValue, label, placeholder }, { self }) => {
    const activated = self.focused || value;
    return [
      <InputBox>
        {activated && <label>{label}</label>}
        <input
          placeholder={!activated ? placeholder : ""}
          value={value}
          oninput={(e) => setValue(e.target.value)}
          onfocus={() => (self.focused = true)}
          onblur={() => (self.focused = false)}
        />
      </InputBox>,
    ];
  }
);

EditorInput.init = () => ({
  self: observable({
    focused: false,
  }),
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
