import { stop, decorator as $$ } from "replay/utils";
import Checkbox from "./Checkbox";
import IconButton from "./IconButton";

const format = (s, length) =>
  s ? (s.length <= length ? s : s.slice(0, length) + "...") : "(empty)";

const MailItem = ({
  mail,
  folder,
  selected,
  actions: { toggleItem, deleteItem },
  events,
}) => {
  const { senderName, senderEmail, subject, content } = mail;
  const notTrash = folder !== "trash";
  const senderInfo = senderName || senderEmail || "(no name)";
  const title = format(subject, 30);
  const preheader = `&nbsp;&mdash;&nbsp;${format(content, 50)}`;

  return [
    <ListItem selected={selected} draggable={notTrash} {...events}>
      {notTrash ? <Checkbox checked={selected} onchange={toggleItem} /> : null}
      <SenderInfo>{senderInfo}</SenderInfo>
      <Summary>
        <Title>{title}</Title>
        <Preheader innerHTML={preheader} />
      </Summary>
      {notTrash ? (
        <Actions>
          <IconButton type="trash" onclick={stop(deleteItem)} />
        </Actions>
      ) : null}
    </ListItem>,
  ];
};

export default MailItem;

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
