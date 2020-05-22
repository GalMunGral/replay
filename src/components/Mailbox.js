import _ from "lodash";
import { withState, Observable } from "lib";
import store$ from "../observables/store";
import Tab from "./Tab";
import MailList from "./MailList";
import Layout from "./Layout";
import MailboxToolbar from "./MailboxToolbar";
import { TabBar } from "../elements/Mailbox";

const PAGE_SIZE = 50;
const TABS = ["primary", "social", "promotions"];

const initialState = () => ({
  store$,
  page$: Observable({
    tab: "primary",
    index: 0,
    get pageStart() {
      return this.index * PAGE_SIZE;
    },
    get pageEnd() {
      return (this.index + 1) * PAGE_SIZE;
    },
  }),
});

const Mailbox = ({ folder }, { page$, store$ }) => {
  const { state } = store$;
  const { tab, index, pageStart, pageEnd } = page$;

  const allMails = _.memoize(function (state, folder, tab) {
    return folder === "inbox"
      ? state[folder].filter((it) => it.category === tab)
      : state[folder];
  })(state, folder, tab);

  const total = allMails.length;
  const mails = allMails.slice(pageStart, pageEnd);

  const nextPage = () => {
    const pageCount = Math.ceil(total / PAGE_SIZE);
    page$.index = Math.min(index + 1, pageCount - 1);
  };

  const prevPage = () => {
    page$.index = Math.max(index - 1, 0);
  };

  return (
    // use-transform
    Layout([
      MailboxToolbar(
        (folder = folder),
        (pagination = {
          pageStart,
          pageEnd: Math.min(pageEnd, total),
          total,
          nextPage,
          prevPage,
          mails,
        })
      ),
      section([
        folder === "inbox"
          ? TabBar(
              TABS.map((t) =>
                Tab(
                  (key = t),
                  (name = t),
                  (active = t === tab),
                  (onclick = () => {
                    page$.tab = t;
                    page$.index = 0;
                  })
                )
              )
            )
          : null,
        MailList((folder = folder), (mails = mails)),
      ]),
    ])
  );
};

export default withState(initialState)(Mailbox);
