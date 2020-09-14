import { decorator as $$ } from "replay/utils";
import Checkbox from "./Checkbox";
import IconButton from "./IconButton";
import Space from "./Space";

const MailboxToolbar = ({ allSelected, toggleAll }, { $mails, $route }) => [
  $route.params.folder !== "trash" && (
    <Checkbox checked={allSelected} onchange={toggleAll} />
  ),
  <Space />,
  <PageRange>
    <PageRangeText
      innerHTML={`${$mails.pageStart}&ndash;${$mails.pageEnd} of ${$mails.total}`}
    />
  </PageRange>,
  <IconButton type="angle-left" onclick={() => $mails.prevPage()} />,
  <IconButton type="angle-right" onclick={() => $mails.nextPage()} />,
];

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
