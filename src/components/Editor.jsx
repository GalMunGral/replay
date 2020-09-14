import { Observer, Observable, decorator as $$ } from "replay/utils";
import $editor from "../observables/editor";
import IconButton from "./IconButton";
import EditorInput from "./EditorInput";
import Space from "./Space";

const Editor = Observer(() => {
  const { minimized } = $editor;
  const { recipientEmail, subject, content } = $editor;
  return [
    $editor.open && (
      <Window>
        <Header onclick={() => ($editor.minimized = !minimized)}>
          <span>New Message</span>
          <CloseButton
            onclick={() => {
              $editor.saveDraft();
              $editor.open = false;
            }}
          >
            <i className="fas fa-times" />
          </CloseButton>
        </Header>
        <Body minimized={minimized}>
          <EditorInput
            label="To:"
            placeholder="Recipient"
            value={recipientEmail}
            setValue={(v) => ($editor.recipientEmail = v)}
          />
          <EditorInput
            label="Subject:"
            placeholder="Subject"
            value={subject}
            setValue={(v) => ($editor.subject = v)}
          />
          <TextArea
            value={content}
            oninput={(e) => $editor.updateHistory(e.target.value)}
          />
          <ButtonGroup>
            <SendButton
              onclick={() => {
                $editor.sendMail();
                $editor.open = false;
              }}
            >
              Send
            </SendButton>
            <IconButton type="undo" onclick={() => $editor.undo()} />
            <IconButton type="redo" onclick={() => $editor.redo()} />
            <Space />
          </ButtonGroup>
        </Body>
      </Window>
    ),
  ];
});

EditorInput.init = () => ({
  $self: new Observable({
    focused: false,
  }),
});

export default Editor;

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

`.$`:hover {
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

`.$`:hover {
    filter: brightness(1.2);
    box-shadow: 0 0 3px 0 var(--blue);
  }
`;
