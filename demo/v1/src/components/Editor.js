import IconButton from "./IconButton";
import Space from "./Space";
import EditorInput from "./EditorInput";
import {
  Window,
  Header,
  CloseButton,
  Body,
  TextArea,
  ButtonGroup,
  SendButton,
} from "./EditorComponents";

const Editor = (state, context) => {
  const {
    getRecipientEmail,
    setRecipientEmail,
    getSubject,
    setSubject,
    getContent,
    updateHistory,
    undo,
    redo,
    saveDraft,
    send,
    close,
  } = context.editor;
  state.minimized = false;

  return () => {
    return (
      // use-transform
      // prettier-ignore
      Window([
        Header(onclick=() => (state.minimized = !state.minimized), [
          span("New Message"),
          CloseButton(
            onclick=() => {
              saveDraft();
              close();
            },
            [i(className="fas fa-times")]
          ),
        ]),
        Body(minimized=state.minimized, [
          EditorInput(
            label="To:",
            placeholder="Recipient",
            value=getRecipientEmail(),
            setValue=setRecipientEmail
          ),
          EditorInput(
            label="Subject:",
            placeholder="Subject",
            value=getSubject(),
            setValue=setSubject
          ),
          TextArea(value=getContent(), oninput=updateHistory),
          ButtonGroup([
            SendButton(
              onclick=(e) => {
                send();
                close();
              },
              "Send"
            ),
            IconButton(onclick=undo, type="undo"),
            IconButton(onclick=redo, type="redo"),
            Space(),
          ]),
        ]),
      ])
    );
  };
};

export default Editor;
