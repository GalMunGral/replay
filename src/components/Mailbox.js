import { withContext, Observable } from "lib";
import Tab from "./Tab";
import MailList from "./MailList";
import Layout from "./Layout";
import MailboxToolbar from "./MailboxToolbar";
import { TabBar } from "../elements/Mailbox";

const tabs = ["primary", "social", "promotions"];

const context = () => ({
  page$: Observable({
    tab: "primary",
    index: 0,
    pageSize: 50,
    get pageStart() {
      return this.index * this.pageSize;
    },
    get pageEnd() {
      return (this.index + 1) * this.pageSize;
    },
  }),
  route$: Observable({
    folder: null,
  }),
  mails$: Observable({
    currentPage: [],
    total: 0,
  }),
});

const Mailbox = ({ folder }, { page$, mails$, route$, store$ }) => {
  const { tab, pageStart, pageEnd } = page$;
  const allMails = store$.getMails(folder, tab);
  mails$.total = allMails.length;
  mails$.currentPage = allMails.slice(pageStart, pageEnd);
  route$.folder = folder;

  return (
    // use-transform
    Layout([
      MailboxToolbar(),
      section([
        folder === "inbox" &&
          TabBar(
            tabs.map((t) =>
              Tab({
                key: t,
                name: t,
                active: t === tab,
                onclick: () => {
                  page$.tab = t;
                  page$.index = 0;
                },
              })
            )
          ),
        MailList(),
      ]),
    ])
  );
};

export default withContext(context)(Mailbox);
