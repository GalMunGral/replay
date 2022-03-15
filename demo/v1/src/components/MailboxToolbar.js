import Checkbox from "./Checkbox";
import IconButton from "./IconButton";
import Space from "./Space";
import { PageRange, PageRangeText } from "./MailboxToolbarComponents";

const MailboxButtons = (_, context) => () => {
  const {
    getPageStart,
    getPageEnd,
    getTotal,
    nextPage,
    prevPage,
    allSelected,
    toggleAll,
  } = context.pagination;
  const { getFolder } = context.route;

  const start = getPageStart();
  const end = getPageEnd();
  const total = getTotal();
  const folder = getFolder();

  return (
    // use-transform
    // prettier-ignore
    [
      folder !== "trash"
        ? Checkbox(checked=allSelected(), onchange=toggleAll)
        : null,
      Space(),
      PageRange([
        PageRangeText(innerHTML=`${start}&ndash;${Math.min(end, total)} of ${total}`)
      ]),
      IconButton(onclick=prevPage, type="angle-left"),
      IconButton(onclick=nextPage, type="angle-right"),
    ]
  );
};

export default MailboxButtons;
