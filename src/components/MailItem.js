import Checkbox from "./Checkbox";
import IconButton from "./IconButton";
import {
  ListItem,
  SenderInfo,
  Summary,
  Title,
  Preheader,
  Actions,
} from "../elements/MailItem";

const MailItem = ({
  folder,
  mail,
  selected,
  toggleItem,
  deleteItem,
  onmouseup,
  onmousedown,
  dragListeners,
}) => {
  const { senderName, senderEmail, subject, content } = mail;
  const { ondrag, ondragstart, ondragend } = dragListeners;

  return (
    // use-transform
    ListItem(
      (draggable = folder !== "trash"),
      (selected = selected),
      (ondrag = ondrag),
      (ondragstart = ondragstart),
      (ondragend = ondragend),
      (onmousedown = onmousedown),
      (onmouseup = onmouseup),
      [
        folder !== "trash" &&
          Checkbox((checked = selected), (onchange = toggleItem)),
        SenderInfo(senderName || senderEmail || "(no name)"),
        Summary([
          Title((textContent = format(subject, 30))),
          Preheader((innerHTML = `&nbsp;&mdash;&nbsp;${format(content, 50)}`)),
        ]),
        folder !== "trash" &&
          Actions([
            IconButton(
              (type = "trash"),
              (onclick = deleteItem),
              (onmousedown = (e) => e.stopPropagation()),
              (onmouseup = (e) => e.stopPropagation())
            ),
          ]),
      ]
    )
  );
};

function format(s, length) {
  if (!s) return "(empty)";
  return s.length <= length ? s : s.slice(0, length) + "...";
}

export default MailItem;
