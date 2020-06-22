import Checkbox from "@components/Checkbox/Checkbox";
import IconButton from "@components/Common/IconButton";
import Space from "@components/Common/Space";
import { PageRange, PageRangeText } from "./MailboxToolbar.decor";

const MailboxToolbar = ({ allSelected, toggleAll }, context) => {
  const { $route, $mails } = context;
  const { pageStart, pageEnd, total } = $mails;
  const canSelect = $route.folder !== "trash";

  return (
    // use-transform
    [
      canSelect && Checkbox((checked = allSelected), (onchange = toggleAll)),
      Space(),
      PageRange([
        PageRangeText({
          innerHTML: `${pageStart}&ndash;${pageEnd} of ${total}`,
        }),
      ]),
      IconButton((type = "angle-left"), (onclick = () => $mails.prevPage())),
      IconButton((type = "angle-right"), (onclick = () => $mails.nextPage())),
    ]
  );
};

export default MailboxToolbar;
