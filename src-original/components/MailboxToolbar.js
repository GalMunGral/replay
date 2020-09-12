const MailboxToolbar = ({ allSelected, toggleAll }) => {
  return (
    //// use transform
    [
      $router.folder !== "trash"
        ? Checkbox((checked = allSelected), (onchange = toggleAll))
        : null,
      Space(),
      PageRange([
        PageRangeText({
          innerHTML: `${$mails.pageStart}&ndash;${$mails.pageEnd} of ${$mails.total}`,
        }),
      ]),
      IconButton((type = "angle-left"), (onclick = () => $mails.prevPage())),
      IconButton((type = "angle-right"), (onclick = () => $mails.nextPage())),
    ]
  );
};

import { decorator as $$ } from "replay/utils";
import $mails from "@observables/mails";
import $router from "@observables/router";
import Checkbox from "@components/Checkbox";
import IconButton from "@components/IconButton";
import Space from "@components/Space";

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
