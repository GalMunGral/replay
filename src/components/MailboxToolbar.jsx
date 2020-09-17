import { decorator as $$ } from "replay/utils";
import Checkbox from "./Checkbox";
import IconButton from "./IconButton";
import Space from "./Space";

const MailboxToolbar = (__, { route, mailbox }) => {
  const { folder } = route.params;
  const { pageStart, pageEnd, total, allSelected } = mailbox.state;

  const methods = mailbox.mapDispatch("", [
    "toggleAll",
    "previousPage",
    "nextPage",
  ]);

  return [
    folder !== "trash" ? (
      <Checkbox checked={allSelected} onchange={methods.toggleAll} />
    ) : null,
    <Space />,
    <PageRange>
      <PageRangeText innerHTML={`${pageStart}&ndash;${pageEnd} of ${total}`} />
    </PageRange>,
    <IconButton type="angle-left" onclick={methods.previousPage} />,
    <IconButton type="angle-right" onclick={methods.nextPage} />,
  ];
};

export default MailboxToolbar;

const PageRange = $$.div`
  flex: 0 0 200px;
  text-align: end;
`;

const PageRangeText = $$.span`
  font-size: 0.9rem;
  color: gray;
  margin: 0 20px;
`;
