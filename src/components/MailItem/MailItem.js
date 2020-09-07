import Checkbox from "@components/Checkbox/Checkbox";
import IconButton from "@components/Common/IconButton";
import {
  ListItem,
  SenderInfo,
  Summary,
  Title,
  Preheader,
  Actions,
} from "./MailItem.decor";

const format = (s, length) =>
  s ? (s.length <= length ? s : s.slice(0, length) + "...") : "(empty)";

const MailItem = ({
  mail,
  folder,
  selected,
  toggleItem,
  deleteItem,
  selectItem,
  viewItem,
  ondrag,
  ondragstart,
  ondragend,
}) => {
  const { senderName, senderEmail, subject, content } = mail;
  const isInTrash = folder === "trash";
  return (
    // use-transform
    ListItem(
      (selected = selected),
      (draggable = !isInTrash),
      (onmousedown = selectItem),
      (onmouseup = viewItem),
      (ondrag = ondrag),
      (ondragstart = ondragstart),
      (ondragend = ondragend),
      [
        !isInTrash && Checkbox((checked = selected), (onchange = toggleItem)),
        SenderInfo(senderName || senderEmail || "(no name)"),
        Summary([
          Title("" + format(subject, 30)),
          Preheader((innerHTML = `&nbsp;&mdash;&nbsp;${format(content, 50)}`)),
        ]),
        !isInTrash &&
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

export default MailItem;
