import $mails from "@observables/mails";
import $router from "@observables/router";
import Checkbox from "@components/Checkbox/Checkbox";
import IconButton from "@components/Common/IconButton";
import Space from "@components/Common/Space";
import { PageRange, PageRangeText } from "./MailboxToolbar.decor";

const MailboxToolbar = ({ allSelected, toggleAll }) => {
  return (
    // use-transform
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

export default MailboxToolbar;
