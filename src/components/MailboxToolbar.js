import selection$ from "../observables/selection";
import Checkbox from "./Checkbox";
import IconButton from "./IconButton";
import Space from "./Space";
import { PageRange, PageRangeText } from "../elements/MailboxToolbar";

const MailboxToolbar = ({
  folder,
  pagination: { pageStart, pageEnd, total, mails, nextPage, prevPage },
}) => {
  const { selected } = selection$;

  const allSelected =
    mails.length > 0 ? mails.every((item) => selected.has(item.id)) : false;

  const toggleAll = () => {
    if (allSelected) {
      selection$.selected = new Set();
    } else {
      selection$.selected = new Set(mails.map((item) => item.id));
    }
  };

  return (
    // use-transform
    [
      folder !== "trash" &&
        Checkbox((checked = allSelected), (onchange = toggleAll)),
      Space(),
      PageRange([
        PageRangeText(
          (innerHTML = `${pageStart}&ndash;${pageEnd} of ${total}`)
        ),
      ]),
      IconButton((onclick = prevPage), (type = "angle-left")),
      IconButton((onclick = nextPage), (type = "angle-right")),
    ]
  );
};

export default MailboxToolbar;
