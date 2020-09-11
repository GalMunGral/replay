import { decorator as $$ } from "@replay/utils";
import $editor from "@observables/editor";
import { Observable } from "@replay/core";
import IconButton from "@components/IconButton";
import Space from "@components/Space";

const Window = $$.div`
  border: none;
  position: fixed;
  bottom: 0;
  right: 100px;
  background: white;
  border-top-left-radius: 10px;
  border-top-right-radius: 10px;
  overflow: hidden;
  box-shadow: 0 0 20px 5px var(--gray);
  z-index: 998;
  transition: width 0.2s;
`;

const Header = $$.header`
  height: auto;
  padding: 12px 15px;
  line-height: 1rem;
  font-size: 1rem;
  background: var(--dark-gray);
  color: white;
  font-weight: 600;
  cursor: pointer;
`;

const CloseButton = $$.button`
  --size: 1rem;
  float: right;
  border: none;
  background: none;
  padding: 0;
  margin: 0;
  outline: none;
  width: var(--size);
  height: var(--size);
  line-height: var(--size);
  font-size: var(--size);
  color: white;
  cursor: pointer;
  transition: all 0.2s;

`.and`:hover {
    color: var(--light-gray);
    transform: scale(1.2);
  }
`;

const Body = $$.section`
  height: ${({ minimized }) => (minimized ? 0 : "60vh")};
  width: ${({ minimized }) => (minimized ? "300px" : "40vw")};
  display: flex;
  flex-direction: column;
  transition: all 0.2s;
`;

const InputBox = $$.div`
  line-height: 1rem;
  font-size: 1rem;
  margin: 0 20px;
  padding: 0;
  border-bottom: 1px solid var(--light-gray);

`.and` > label {
    color: gray;
    margin-right: 5px;
  }
`.and` > input {
    line-height: 1rem;
    font-size: 1rem;
    padding: 8px 0;
    border: none;
    outline: none;
    background: white;
    font-family: inherit;
  }
`;

const TextArea = $$.textarea`
  --horizontal-margin: 20px;
  flex: 1 1 auto;
  margin: 0 var(--horizontal-margin);
  padding-top: 10px;
  width: calc(100% - 2 * var(--horizontal-margin));
  resize: none;
  border: none;
  outline: none;
  font-size: 1rem;
  font-family: inherit;
`;

const ButtonGroup = $$.div`
  margin: 15px 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const SendButton = $$.button`
  line-height: 1rem;
  font-size: 1rem;
  padding: 10px 22px;
  background: var(--blue);
  border-radius: 3px;
  color: white;
  font-weight: 600;
  margin-right: 10px;
  border: none;
  outline: none;
  cursor: pointer;
  transition: all 0.1s;

`.and`:hover {
    filter: brightness(1.2);
    box-shadow: 0 0 3px 0 var(--blue);
  }
`;

const EditorInput = ({ value, setValue, label, placeholder }, { $self }) => {
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

EditorInput.init = () => ({
  $self: new Observable({
    focused: false,
  }),
});

const Editor = () => {
  const { minimized } = $editor;
  const { recipientEmail, subject, content } = $editor;

  if (!$editor.open) return [null];

  return (
    // use-transform
    Window([
      Header((onclick = () => ($editor.minimized = !minimized)), [
        span("New Message"),
        CloseButton(
          (onclick = () => {
            $editor.saveDraft();
            $editor.open = false;
          }),
          [i((className = "fas fa-times"))]
        ),
      ]),
      Body({ minimized }, [
        EditorInput(
          (label = "To:"),
          (placeholder = "Recipient"),
          (value = recipientEmail),
          (setValue = (v) => ($editor.recipientEmail = v))
        ),
        EditorInput(
          (label = "Subject:"),
          (placeholder = "Subject"),
          (value = subject),
          (setValue = (v) => ($editor.subject = v))
        ),
        TextArea(
          (value = content),
          (oninput = (e) => $editor.updateHistory(e.target.value))
        ),
        ButtonGroup([
          SendButton(
            (onclick = () => {
              $editor.sendMail();
              $editor.open = false;
            }),
            "Send"
          ),
          IconButton((type = "undo"), (onclick = () => $editor.undo())),
          IconButton((type = "redo"), (onclick = () => $editor.redo())),
          Space(),
        ]),
      ]),
    ])
  );
};

export default Editor;
