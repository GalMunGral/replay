import { decorator as $$ } from "replay/utils";
import Checkbox from "./Checkbox";
import IconButton from "./IconButton";
import Space from "./Space";

const MailboxToolbar = function ({}, scope) {
  const { allSelected, folder, rangeHTML, toggleAll, previousPage, nextPage } =
    scope;
  return [
    folder !== "trash" ? (
      <Checkbox checked={allSelected} onchange={toggleAll} />
    ) : (
      <comment />
    ),
    <Space />,
    <PageRange>
      <PageRangeText innerHTML={rangeHTML} />
    </PageRange>,
    <IconButton type="angle-left" onclick={previousPage} />,
    <IconButton type="angle-right" onclick={nextPage} />,
  ];
};

MailboxToolbar.init = ({}, { route, mailbox }) => ({
  get allSelected() {
    return mailbox.state.allSelected;
  },
  get folder() {
    return route.params.folder;
  },
  get rangeHTML() {
    const { pageStart, pageEnd, total } = mailbox.state;
    return `${pageStart}&ndash;${pageEnd} of ${total}`;
  },
  ...mailbox.mapDispatch("", ["toggleAll", "previousPage", "nextPage"]),
});

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
