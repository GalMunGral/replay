import IconButton from "@components/IconButton/IconButton";
import Space from "@components/Layout/Space";
import EditorInput from "@components/Editor/EditorInput";
import {
  Window,
  Header,
  CloseButton,
  Body,
  TextArea,
  ButtonGroup,
  SendButton,
} from "./Editor.decor";

const Editor = (__, { $editorPopup, $editor }) => {
  const { minimized } = $editorPopup;
  const { recipientEmail, subject, content } = $editor;

  if (!$editorPopup.open) return [null];

  return (
    // use-transform
    Window([
      Header((onclick = () => ($editorPopup.minimized = !minimized)), [
        span("New Message"),
        CloseButton(
          (onclick = () => {
            $editor.saveDraft();
            $editorPopup.open = false;
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
              $editorPopup.open = false;
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
