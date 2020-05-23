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

function format(s, length) {
  if (!s) return "(empty)";
  return s.length <= length ? s : s.slice(0, length) + "...";
}

const MailItem = ({
  mail: { senderName, senderEmail, subject, content },
  folder,
  selected,
  toggleItem,
  deleteItem,
  eventListeners,
}) =>
  // use-transform
  ListItem(
    (draggable = folder !== "trash"),
    { selected },
    { ...eventListeners },
    [
      folder !== "trash" &&
        Checkbox((checked = selected), (onchange = toggleItem)),
      SenderInfo(senderName || senderEmail || "(no name)"),
      Summary([
        Title("" + format(subject, 30)),
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
  );

export default MailItem;
