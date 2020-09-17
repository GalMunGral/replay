import { observer, decorator as $$, stop } from "replay/utils";
import IconButton from "./IconButton";
import EditorInput from "./EditorInput";
import Space from "./Space";

const Editor = observer((__, { store }) => {
  const {
    open,
    minimized,
    recipientEmail,
    subject,
    content: { value: content },
  } = store.state.editor;

  const methods = store.mapDispatch("editor", [
    "setMinimized",
    "saveDraft",
    "setSubject",
    "setRecipientEmail",
    "sendMail",
    "content/update",
    "content/undo",
    "content/redo",
  ]);

  return [
    open && (
      <Window>
        <Header onclick={() => methods.setMinimized(!minimized)}>
          <span>New Message</span>
          <CloseButton onclick={stop(methods.saveDraft)}>
            <i className="fas fa-times" />
          </CloseButton>
        </Header>
        <Body minimized={minimized}>
          <EditorInput
            label="To:"
            placeholder="Recipient"
            value={recipientEmail}
            setValue={methods.setRecipientEmail}
          />
          <EditorInput
            label="Subject:"
            placeholder="Subject"
            value={subject}
            setValue={methods.setSubject}
          />
          <TextArea value={content} setValue={methods.contentUpdate} />
          <ButtonGroup>
            <SendButton onclick={methods.sendMail}>Send</SendButton>
            <IconButton type="undo" onclick={methods.contentUndo} />
            <IconButton type="redo" onclick={methods.contentRedo} />
            <Space />
          </ButtonGroup>
        </Body>
      </Window>
    ),
  ];
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

const TextArea = $$(({ setValue, ...props }) => {
  const getInput = (e) => e.target.value;
  return [<textarea {...props} oninput={(e) => setValue(getInput(e))} />];
})`
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
