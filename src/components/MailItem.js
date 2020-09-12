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
    //// use transform
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

import { decorator as $$ } from "replay/utils";
import Checkbox from "@components/Checkbox";
import IconButton from "@components/IconButton";

export default MailItem;

const format = (s, length) =>
  s ? (s.length <= length ? s : s.slice(0, length) + "...") : "(empty)";

const ListItem = $$.div`
  --height: 40px;
  position: relative;
  height: var(--height);
  line-height: var(--height);
  padding: 0 10px;
  display: flex;
  border-bottom: 1px solid var(--light-gray);
  background-color: ${({ selected }) =>
    selected ? "var(--highlight)" : "white"};
  align-items: center;
  justify-content: space-between;
  cursor: pointer;

`.$`:active {
    cursor: grabbing;
  }
`.$`:hover {
    background: ${({ selected }) => (selected ? "var(--highlight)" : "white")};
    filter: brightness(0.95);
  }
`.$`:hover * {
    visibility: visible;
  }
`;

const SenderInfo = $$.div`
  flex: 0 0 200px;
  font-weight: 600;
`;

const Summary = $$.div`
  flex: 1 1 auto;
  line-height: 1rem;
`;

const Title = $$.span`
  font-weight: 600;
  font-size: 1rem;
  text-transform: capitalize;
`;

const Preheader = $$.span`
  font-weight: 300;
  font-size: 1rem;
  color: gray;
`;

const Actions = $$.div`
  margin-right: 30px;
  flex: 0 0 auto;
  visibility: hidden;
  color: var(--gray);
`;
