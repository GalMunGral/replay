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
import { format } from "./MailItem.util";

const MailItem = (
  {
    mail,
    selected,
    toggleItem,
    deleteItem,
    selectItem,
    viewItem,
    dragHandlers,
  },
  { $router }
) => {
  const { senderName, senderEmail, subject, content } = mail;
  const { folder } = $router;
  const isInTrash = folder === "trash";

  return (
    // use-transform
    ListItem(
      (selected = selected),
      (draggable = !isInTrash),
      (onmousedown = selectItem),
      (onmouseup = viewItem),
      (ondrag = dragHandlers.ondrag),
      (ondragstart = dragHandlers.ondragstart),
      (ondragend = dragHandlers.ondragend),
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
