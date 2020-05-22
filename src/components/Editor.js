import { withState, Observable } from "lib";
import editor$ from "../observables/editor";
import IconButton from "../components/IconButton";
import Space from "../components/Space";
import EditorInput from "../components/EditorInput";
import {
  Window,
  Header,
  CloseButton,
  Body,
  TextArea,
  ButtonGroup,
  SendButton,
} from "../elements/Editor";

const initialState = () => ({
  state$: Observable({
    minimized: false,
  }),
});

const Editor = ({}, { state$, editorPopup$ }) => {
  const { minimized } = state$;
  const { recipientEmail, subject, content } = editor$;
  return (
    // use-transform
    Window([
      Header((onclick = () => (state$.minimized = !minimized)), [
        span("New Message"),
        CloseButton(
          (onclick = () => {
            editor$.saveDraft();
            editorPopup$.open = false;
          }),
          [i((className = "fas fa-times"))]
        ),
      ]),
      Body((minimized = minimized), [
        EditorInput(
          (label = "To:"),
          (placeholder = "Recipient"),
          (value = recipientEmail),
          (setValue = (v) => (editor$.recipientEmail = v))
        ),
        EditorInput(
          (label = "Subject:"),
          (placeholder = "Subject"),
          (value = subject),
          (setValue = (v) => (editor$.subject = v))
        ),
        TextArea(
          (value = content),
          (oninput = (e) => editor$.updateHistory(e.target.value))
        ),
        ButtonGroup([
          SendButton(
            (onclick = () => {
              editor$.send();
              editorPopup$.open = false;
            }),
            "Send"
          ),
          IconButton((onclick = () => editor$.undo()), (type = "undo")),
          IconButton((onclick = () => editor$.redo()), (type = "redo")),
          Space(),
        ]),
      ]),
    ])
  );
};

export default withState(initialState)(Editor);
