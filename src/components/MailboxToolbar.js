import Checkbox from "./Checkbox";
import IconButton from "./IconButton";
import Space from "./Space";
import { PageRange, PageRangeText } from "../elements/MailboxToolbar";

const MailboxToolbar = (
  __,
  {
    page$,
    page$: { pageStart, pageEnd, pageSize },
    route$: { folder },
    mails$: { total, currentPage },
    selection$,
    selection$: { selected },
  }
) => {
  const pageCount = Math.ceil(total / pageSize);
  pageEnd = Math.min(pageEnd, total);

  const nextPage = () => {
    page$.index = Math.min(page$.index + 1, pageCount - 1);
  };

  const prevPage = () => {
    page$.index = Math.max(page$.index - 1, 0);
  };

  const allSelected =
    currentPage.length > 0
      ? currentPage.every((item) => selected.has(item.id))
      : false;

  const toggleAll = () => {
    if (allSelected) {
      selection$.selected = new Set();
    } else {
      selection$.selected = new Set(currentPage.map((item) => item.id));
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
